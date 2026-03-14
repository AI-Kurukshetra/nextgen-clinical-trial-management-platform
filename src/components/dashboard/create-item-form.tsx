"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getErrorMessage } from "@/lib/utils";
import { createItemSchema, type ItemFormValues } from "@/types/schemas";

export function CreateItemForm() {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      await apiPost<unknown>("/items", {
        title: values.title.trim(),
        description: values.description?.trim() || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items.all });
      toast.success("Item created!");
      form.reset();
      setOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create item."));
    },
  });

  const onSubmit = async (values: ItemFormValues) => {
    await mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Add item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create item</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="new-title">Title</Label>
            <Input
              id="new-title"
              {...form.register("title")}
              placeholder="Item title"
              disabled={isPending}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-description">Description (optional)</Label>
            <Input
              id="new-description"
              {...form.register("description")}
              placeholder="Brief description"
              disabled={isPending}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            loading={isPending}
            loadingText="Creating..."
          >
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
