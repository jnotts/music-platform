import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, getTemplate, updateTemplate } from "@/lib/api/client";
import type { EmailTemplateKey } from "@/lib/types/db";
import type { TemplateInput } from "@/lib/schemas/template";

/**
 * Query key constant for cache management
 */
export const TEMPLATES_KEY = ["admin-templates"];

/**
 * Fetch all templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: getTemplates,
  });
}

/**
 * Fetch a single template by key
 */
export function useTemplate(key: EmailTemplateKey | null) {
  return useQuery({
    queryKey: [...TEMPLATES_KEY, key],
    queryFn: () => (key ? getTemplate(key) : null),
    enabled: !!key,
  });
}

/**
 * Update a template (mutation)
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: TemplateInput }) =>
      updateTemplate(key, data),
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });
}
