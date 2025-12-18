import { useMemo } from "react";
import type { EmailTemplateKey } from "@/lib/types/db";

interface TemplatePreviewProps {
  subject: string;
  html: string;
  templateKey: EmailTemplateKey;
}

/**
 * Sample data for each template type
 */
const SAMPLE_DATA: Record<EmailTemplateKey, Record<string, string>> = {
  confirmation: {
    artist_name: "Neon Horizon",
    submission_id: "a1b2c3d4",
  },
  approved: {
    artist_name: "Neon Horizon",
    feedback: "Great energy and production quality! We love your sound.",
    grade: "8",
  },
  rejected: {
    artist_name: "Neon Horizon",
    feedback: "Not quite the sound we're looking for right now.",
  },
};

/**
 * Replace {{variable}} syntax with sample data
 */
function replaceVariables(text: string, vars: Record<string, string>): string {
  let result = text;
  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  });
  return result;
}

/**
 * Preview pane for email templates.
 * Shows how the email will look with sample data injected.
 */
export function TemplatePreview({
  subject,
  html,
  templateKey,
}: TemplatePreviewProps) {
  const sampleData = SAMPLE_DATA[templateKey] || {};

  const previewSubject = useMemo(
    () => replaceVariables(subject || "", sampleData),
    [subject, sampleData],
  );

  const previewHtml = useMemo(
    () => replaceVariables(html || "", sampleData),
    [html, sampleData],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-sm font-medium text-muted">Preview</h2>
        <p className="text-xs text-muted">
          Showing with sample data for{" "}
          <span className="capitalize">{templateKey}</span> template
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {/* Email Subject Bar */}
        {subject && (
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="text-xs font-medium text-gray-500">Subject</div>
            <div className="mt-1 font-semibold text-gray-900">
              {previewSubject || (
                <span className="text-gray-400">No subject</span>
              )}
            </div>
          </div>
        )}

        {/* Email Body */}
        <div
          className="prose prose-sm max-w-none px-6 py-6 text-gray-900"
          dangerouslySetInnerHTML={{
            __html:
              previewHtml ||
              "<p class='text-gray-400'>Start typing to see preview...</p>",
          }}
        />
      </div>

      {/* Variable Legend */}
      <div className="rounded-xl border border-border bg-surface-muted p-4">
        <div className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
          Sample Data
        </div>
        <div className="space-y-1">
          {Object.entries(sampleData).map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 text-xs">
              <code className="font-mono text-primary">{`{{${key}}}`}</code>
              <span className="text-muted">→</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
