/**
 * Upload validation constants and utilities
 */

export const UPLOAD_CONFIG = {
  allowedMimeTypes: [
    "audio/mpeg", // MP3
    "audio/wav", // WAV
    "audio/x-wav", // WAV alternate
    "audio/flac", // FLAC
    "audio/x-m4a", // M4A
    "audio/mp4", // M4A alternate
  ],
  allowedExtensions: [".mp3", ".wav", ".flac", ".m4a"],
  maxFileSizeMB: 50,
  maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
  maxTracksPerSubmission: 5,
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file for upload
 */
export function validateFile(file: File): FileValidationResult {
  // Check extension
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (
    !UPLOAD_CONFIG.allowedExtensions.includes(
      ext as (typeof UPLOAD_CONFIG.allowedExtensions)[number]
    )
  ) {
    return {
      valid: false,
      error: `Invalid format. Allowed: ${UPLOAD_CONFIG.allowedExtensions.join(
        ", "
      )}`,
    };
  }

  // Check size
  if (file.size > UPLOAD_CONFIG.maxFileSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum: ${UPLOAD_CONFIG.maxFileSizeMB}MB`,
    };
  }

  // Check MIME type (browsers may not always report correctly, so we also check extension)
  if (file.type && !UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    // Allow if extension is valid even if MIME type is unexpected
    // Some browsers report different MIME types
    console.warn(
      `Unexpected MIME type ${file.type} for file ${file.name}, allowing based on extension`
    );
  }

  return { valid: true };
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format seconds to human readable time
 */
export function formatEta(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return "";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}
