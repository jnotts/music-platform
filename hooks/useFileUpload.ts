"use client";

import { useState, useCallback, useRef } from "react";
import { validateFile, UPLOAD_CONFIG } from "@/lib/validation/upload";
import { getSignedUploadUrl, deleteUploadedFile } from "@/lib/api/client";

export type UploadStatus = "idle" | "uploading" | "complete" | "error";

export interface FileUploadState {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number; // 0-100
  bytesUploaded: number;
  eta: number | null; // seconds remaining
  storagePath: string | null;
  error: string | null;
}

export interface UseFileUploadReturn {
  uploads: FileUploadState[];
  addFiles: (files: FileList | File[]) => void;
  removeUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  clearAll: () => void;
  isUploading: boolean;
  allComplete: boolean;
  hasErrors: boolean;
  overallProgress: number;
  completedUploads: FileUploadState[];
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const uploadSpeeds = useRef<Map<string, number[]>>(new Map());

  const updateUpload = useCallback(
    (id: string, updates: Partial<FileUploadState>) => {
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      );
    },
    [],
  );

  const uploadWithProgress = useCallback(
    (
      id: string,
      file: File,
      signedUrl: string,
      storagePath: string,
      signal: AbortSignal,
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let lastLoaded = 0;
        let lastTime = Date.now();

        xhr.upload.addEventListener("progress", (e) => {
          if (!e.lengthComputable) return;

          const now = Date.now();
          const timeDelta = (now - lastTime) / 1000; // seconds
          const bytesDelta = e.loaded - lastLoaded;

          if (timeDelta > 0.1) {
            // Update at least every 100ms
            const speed = bytesDelta / timeDelta; // bytes/sec
            const speeds = uploadSpeeds.current.get(id) || [];
            speeds.push(speed);
            if (speeds.length > 5) speeds.shift(); // Keep last 5 samples
            uploadSpeeds.current.set(id, speeds);

            const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
            const remaining = file.size - e.loaded;
            const eta = avgSpeed > 0 ? Math.round(remaining / avgSpeed) : null;

            updateUpload(id, {
              progress: Math.round((e.loaded / e.total) * 100),
              bytesUploaded: e.loaded,
              eta,
            });

            lastLoaded = e.loaded;
            lastTime = now;
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            updateUpload(id, {
              status: "complete",
              progress: 100,
              storagePath,
              eta: null,
            });
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Network error during upload")),
        );
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload cancelled")),
        );

        signal.addEventListener("abort", () => xhr.abort());

        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || "application/octet-stream",
        );
        xhr.send(file);
      });
    },
    [updateUpload],
  );

  const startUpload = useCallback(
    async (id: string, file: File) => {
      const controller = new AbortController();
      abortControllers.current.set(id, controller);
      uploadSpeeds.current.set(id, []);

      updateUpload(id, { status: "uploading", error: null, progress: 0 });

      try {
        // 1. Get signed URL
        const { signedUrl, storagePath } = await getSignedUploadUrl(
          file.name,
          file.type || "application/octet-stream",
          file.size,
          controller.signal,
        );

        // 2. Upload file with progress tracking
        await uploadWithProgress(
          id,
          file,
          signedUrl,
          storagePath,
          controller.signal,
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Cancelled, don't update state
        }

        updateUpload(id, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      } finally {
        abortControllers.current.delete(id);
        uploadSpeeds.current.delete(id);
      }
    },
    [updateUpload, uploadWithProgress],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const currentCount = uploads.length;
      const availableSlots =
        UPLOAD_CONFIG.maxTracksPerSubmission - currentCount;

      if (availableSlots <= 0) {
        console.warn(
          `Maximum ${UPLOAD_CONFIG.maxTracksPerSubmission} tracks allowed`,
        );
        return;
      }

      const filesToAdd = fileArray.slice(0, availableSlots);

      filesToAdd.forEach((file) => {
        const validation = validateFile(file);
        const id = crypto.randomUUID();

        const newUpload: FileUploadState = {
          id,
          file,
          status: validation.valid ? "idle" : "error",
          progress: 0,
          bytesUploaded: 0,
          eta: null,
          storagePath: null,
          error: validation.error || null,
        };

        setUploads((prev) => [...prev, newUpload]);

        // Start upload if valid
        if (validation.valid) {
          // Small delay to ensure state is updated
          setTimeout(() => startUpload(id, file), 0);
        }
      });
    },
    [uploads.length, startUpload],
  );

  const removeUpload = useCallback(
    (id: string) => {
      const upload = uploads.find((u) => u.id === id);

      // Cancel if in progress
      const controller = abortControllers.current.get(id);
      if (controller) {
        controller.abort();
        abortControllers.current.delete(id);
      }
      uploadSpeeds.current.delete(id);

      // Delete from storage if upload completed
      if (upload?.storagePath) {
        deleteUploadedFile(upload.storagePath).catch((err) => {
          console.error("Failed to delete file from storage:", err);
          // Continue anyway - file will be cleaned up by background job
        });
      }

      setUploads((prev) => prev.filter((u) => u.id !== id));
    },
    [uploads],
  );

  const retryUpload = useCallback(
    (id: string) => {
      const upload = uploads.find((u) => u.id === id);
      if (upload && upload.status === "error") {
        // Re-validate in case validation error
        const validation = validateFile(upload.file);
        if (validation.valid) {
          startUpload(id, upload.file);
        } else {
          updateUpload(id, { error: validation.error });
        }
      }
    },
    [uploads, startUpload, updateUpload],
  );

  const clearAll = useCallback(() => {
    // Delete all completed uploads from storage
    uploads.forEach((upload) => {
      if (upload.storagePath) {
        deleteUploadedFile(upload.storagePath).catch((err) => {
          console.error("Failed to delete file from storage:", err);
        });
      }
    });

    // Cancel all in-progress uploads
    abortControllers.current.forEach((controller) => controller.abort());
    abortControllers.current.clear();
    uploadSpeeds.current.clear();
    setUploads([]);
  }, [uploads]);

  const isUploading = uploads.some((u) => u.status === "uploading");
  const allComplete =
    uploads.length > 0 && uploads.every((u) => u.status === "complete");
  const hasErrors = uploads.some((u) => u.status === "error");
  const completedUploads = uploads.filter((u) => u.status === "complete");
  const overallProgress =
    uploads.length > 0
      ? Math.round(
          uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length,
        )
      : 0;

  return {
    uploads,
    addFiles,
    removeUpload,
    retryUpload,
    clearAll,
    isUploading,
    allComplete,
    hasErrors,
    overallProgress,
    completedUploads,
  };
}
