"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, AlertCircle } from "lucide-react";
import type { EmailTemplateKey } from "@/lib/types/db";
import { templateSchema, type TemplateInput } from "@/lib/schemas/template";
import { useTemplate, useUpdateTemplate } from "@/hooks/useTemplates";
import { TemplateEditor } from "@/components/admin/templates/TemplateEditor";
import { TemplatePreview } from "@/components/admin/templates/TemplatePreview";
import { AdminNav } from "@/components/admin/AdminNav";

type PageProps = {
  params: Promise<{ key: string }>;
};

const VALID_KEYS: EmailTemplateKey[] = ["confirmation", "approved", "rejected"];

/**
 * Admin template editor page.
 * Edit subject and HTML content for a specific email template with live preview.
 */
export default function AdminTemplateEditorPage({ params }: PageProps) {
  const { key } = use(params);
  const templateKey = key as EmailTemplateKey;

  const {
    data: template,
    isLoading,
    error: fetchError,
  } = useTemplate(templateKey);
  const updateMutation = useUpdateTemplate();

  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      subject: "",
      html: "",
    },
  });

  // Reset form when template loads
  useEffect(() => {
    if (template) {
      form.reset({
        subject: template.subject,
        html: template.html,
      });
    }
  }, [template, form]);

  const handleSave = async (data: TemplateInput) => {
    try {
      await updateMutation.mutateAsync({ key: templateKey, data });
      setSuccessMessage("Template saved successfully!");
      // Reset form state to mark as not dirty after successful save
      form.reset(data);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  // Validate key
  if (!VALID_KEYS.includes(templateKey)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-red-400">
              Invalid Template Key
            </h1>
            <p className="mt-2 text-muted">
              Valid keys: {VALID_KEYS.join(", ")}
            </p>
            <Link
              href="/admin/templates"
              className="mt-4 inline-block text-primary hover:underline"
            >
              ← Back to Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AdminNav
          title={`${key.charAt(0).toUpperCase() + key.slice(1)} Template`}
          backLink={{ href: "/admin/templates", label: "Templates" }}
        />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded-xl bg-surface-muted" />
            <div className="h-96 w-full animate-pulse rounded-xl bg-surface-muted" />
          </div>
        </main>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={40} />
            <h1 className="text-xl font-semibold text-red-400">
              Failed to Load Template
            </h1>
            <p className="mt-2 text-muted">
              {fetchError instanceof Error
                ? fetchError.message
                : "Unknown error"}
            </p>
            <Link
              href="/admin/templates"
              className="mt-4 inline-block text-primary hover:underline"
            >
              ← Back to Templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav
        title={`${key.charAt(0).toUpperCase() + key.slice(1)} Template`}
        backLink={{ href: "/admin/templates", label: "Templates" }}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <form onSubmit={form.handleSubmit(handleSave)}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Editor */}
            <div className="space-y-4">
              {/* Subject Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="Email subject..."
                  className={`w-full rounded-xl border ${
                    form.formState.errors.subject
                      ? "border-red-500"
                      : "border-border"
                  } bg-surface-muted px-4 py-3 text-foreground placeholder-muted/50 focus:border-primary focus:outline-none`}
                  {...form.register("subject")}
                />
                {form.formState.errors.subject && (
                  <p className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={12} />
                    {form.formState.errors.subject.message}
                  </p>
                )}
              </div>

              {/* TipTap Editor */}
              <TemplateEditor
                control={form.control}
                name="html"
                templateKey={templateKey}
              />

              {/* Save Button */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !form.formState.isDirty}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    !form.formState.isDirty
                      ? "No changes to save"
                      : updateMutation.isPending
                        ? "Saving..."
                        : "Save changes"
                  }
                >
                  {updateMutation.isPending && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  {updateMutation.isPending ? "Saving..." : "Save Template"}
                </button>

                {successMessage && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Check size={16} />
                    {successMessage}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {updateMutation.isError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Failed to save template</div>
                      <div className="mt-1 text-xs">
                        {updateMutation.error instanceof Error
                          ? updateMutation.error.message
                          : "Please try again."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <TemplatePreview
              subject={form.watch("subject")}
              html={form.watch("html")}
              templateKey={templateKey}
            />
          </div>
        </form>
      </main>
    </div>
  );
}
