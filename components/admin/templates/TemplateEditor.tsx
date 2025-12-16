"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { EmailTemplateKey } from "@/lib/types/db";
import type { TemplateInput } from "@/lib/schemas/template";
import { Variable } from "./extensions/Variable";
import { TemplateToolbar } from "./TemplateToolbar";

interface TemplateEditorProps {
  control: Control<TemplateInput>;
  name: keyof TemplateInput;
  templateKey: EmailTemplateKey;
}

/**
 * Main TipTap editor component integrated with React Hook Form.
 * Provides rich text editing for email templates with variable support.
 */
export function TemplateEditor({
  control,
  name,
  templateKey,
}: TemplateEditorProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <EditorWrapper
          value={field.value as string}
          onChange={field.onChange}
          templateKey={templateKey}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

interface EditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  templateKey: EmailTemplateKey;
  error?: string;
}

function EditorWrapper({
  value,
  onChange,
  templateKey,
  error,
}: EditorWrapperProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Variable,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-[#F5F3EE]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value changes externally (e.g., form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#A8A29E]">
        HTML Content *
      </label>

      <div
        className={`overflow-hidden rounded-xl border ${
          error ? "border-red-500" : "border-white/10"
        } bg-white/5`}
      >
        <TemplateToolbar editor={editor} templateKey={templateKey} />

        <div className="border-t border-white/10">
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">{error}</p>
      )}

      <p className="text-xs text-[#A8A29E]">
        Use the toolbar to format text and insert template variables.
      </p>
    </div>
  );
}
