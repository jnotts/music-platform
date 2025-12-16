import { Node, mergeAttributes } from "@tiptap/core";

export interface VariableOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    variable: {
      /**
       * Insert a variable node
       */
      insertVariable: (variable: string) => ReturnType;
    };
  }
}

/**
 * Custom TipTap extension for email template variables.
 * Renders {{variable}} as non-editable, styled pills in the editor.
 * Serializes back to {{variable}} syntax in HTML output.
 */
export const Variable = Node.create<VariableOptions>({
  name: "variable",

  group: "inline",

  inline: true,

  selectable: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-variable"),
        renderHTML: (attributes) => {
          if (!attributes.name) {
            return {};
          }
          return {
            "data-variable": attributes.name,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable]",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        {
          "data-variable": node.attrs.name,
          class:
            "variable-pill inline-flex items-center gap-1 rounded bg-[#2D7DFF]/20 border border-[#2D7DFF]/40 px-2 py-0.5 text-xs font-mono text-[#2D7DFF] select-none",
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      `{{${node.attrs.name}}}`,
    ];
  },

  renderText({ node }) {
    return `{{${node.attrs.name}}}`;
  },

  addCommands() {
    return {
      insertVariable:
        (variable: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              name: variable,
            },
          });
        },
    };
  },
});
