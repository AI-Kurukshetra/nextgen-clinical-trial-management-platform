import { z } from "zod";

export const createItemSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
});

export const updateItemSchema = createItemSchema;

export type ItemFormValues = z.infer<typeof createItemSchema>;

