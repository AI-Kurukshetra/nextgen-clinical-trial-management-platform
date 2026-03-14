"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getErrorMessage } from "@/lib/utils";

type SeedResponse = { message?: string };

export function SeedButton() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = await apiPost<SeedResponse>("/items/seed");
      return data;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items.all });
      if (result?.message) {
        toast.success(result.message);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to seed demo items."));
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => mutate()}
      loading={isPending}
      loadingText="Seeding..."
    >
      Seed demo items
    </Button>
  );
}
