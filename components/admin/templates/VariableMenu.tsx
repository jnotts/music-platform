"use client";

import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown, Code } from "lucide-react";
import type { EmailTemplateKey } from "@/lib/types/db";

interface VariableMenuProps {
  editor: Editor;
  templateKey: EmailTemplateKey;
}

/**
 * Variable definitions for each template type
 */
const TEMPLATE_VARIABLES: Record<EmailTemplateKey, string[]> = {
  confirmation: ["artist_name", "submission_id"],
  approved: ["artist_name", "feedback", "grade"],
  rejected: ["artist_name", "feedback"],
};

/**
 * Dropdown menu for inserting template variables into the editor.
 * Shows variables specific to the current template type.
 */
export function VariableMenu({ editor, templateKey }: VariableMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const variables = TEMPLATE_VARIABLES[templateKey] || [];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const insertVariable = (variable: string) => {
    editor
      .chain()
      .focus()
      .command(({ commands }) => {
        return commands.insertVariable(variable);
      })
      .run();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-all ${
          isOpen
            ? "border-[#2D7DFF] bg-[#2D7DFF] text-white"
            : "border-white/10 bg-white/5 text-[#A8A29E] hover:border-white/20 hover:bg-white/10 hover:text-[#F5F3EE]"
        }`}
        title="Insert Variable"
      >
        <Code size={16} />
        <span>Variable</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0B0D0F] shadow-lg">
          <div className="p-2">
            <div className="mb-2 px-2 text-xs font-medium tracking-wide text-[#A8A29E] uppercase">
              Available Variables
            </div>
            {variables.map((variable) => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#F5F3EE] transition-colors hover:bg-white/10"
              >
                <Code size={14} className="text-[#2D7DFF]" />
                <span className="font-mono">{`{{${variable}}}`}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
