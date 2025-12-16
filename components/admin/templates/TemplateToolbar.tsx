import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
} from "lucide-react";
import { VariableMenu } from "./VariableMenu";
import type { EmailTemplateKey } from "@/lib/types/db";

interface TemplateToolbarProps {
  editor: Editor | null;
  templateKey: EmailTemplateKey;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

/**
 * Individual toolbar button component.
 */
function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
        active
          ? "border-[#2D7DFF] bg-[#2D7DFF] text-white"
          : "border-white/10 bg-white/5 text-[#A8A29E] hover:border-white/20 hover:bg-white/10 hover:text-[#F5F3EE]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

/**
 * Formatting toolbar for the TipTap email template editor.
 * Provides buttons for text formatting, alignment, links, and variable insertion.
 */
export function TemplateToolbar({ editor, templateKey }: TemplateToolbarProps) {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-2">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading"
      >
        <Heading2 size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Link */}
      <ToolbarButton
        onClick={addLink}
        active={editor.isActive("link")}
        title="Add Link"
      >
        <LinkIcon size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-white/10" />

      {/* Variable Insertion */}
      <VariableMenu editor={editor} templateKey={templateKey} />
    </div>
  );
}
