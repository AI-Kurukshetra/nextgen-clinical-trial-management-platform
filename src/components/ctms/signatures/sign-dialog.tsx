"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSignature } from "@/hooks/use-signatures";
import { getErrorMessage } from "@/lib/utils";
import { signatureCreateSchema, type SignatureCreateInput } from "@/types/schemas";

interface SignDialogProps {
  triggerLabel: string;
  tableName: "documents";
  recordId: string;
  meaning: string;
  title: string;
  description: string;
  onSigned?: () => void;
}

export function SignDialog({
  triggerLabel,
  tableName,
  recordId,
  meaning,
  title,
  description,
  onSigned,
}: SignDialogProps) {
  const [open, setOpen] = useState(false);
  const createSignature = useCreateSignature();

  const form = useForm<SignatureCreateInput>({
    resolver: zodResolver(signatureCreateSchema),
    defaultValues: {
      table_name: tableName,
      record_id: recordId,
      reason: "",
      meaning,
      password: "",
    },
  });

  const { register, handleSubmit, formState, setValue } = form;

  async function onSubmit(values: SignatureCreateInput) {
    try {
      await createSignature.mutateAsync({
        ...values,
        table_name: tableName,
        record_id: recordId,
        meaning,
      });
      toast.success("Electronic signature captured.");
      setOpen(false);
      form.reset({
        table_name: tableName,
        record_id: recordId,
        reason: "",
        meaning,
        password: "",
      });
      onSigned?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to sign record."));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setValue("table_name", tableName);
        setValue("record_id", recordId);
        setValue("meaning", meaning);
      }}
    >
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-3">
          <input type="hidden" {...register("table_name")} />
          <input type="hidden" {...register("record_id")} />
          <input type="hidden" {...register("meaning")} />

          <div className="space-y-1">
            <Label htmlFor={`reason-${recordId}`}>Reason for signature</Label>
            <Input
              id={`reason-${recordId}`}
              {...register("reason")}
              placeholder="Explain why you are approving/closing this record."
              disabled={createSignature.isPending}
            />
            {formState.errors.reason ? (
              <p className="text-xs text-destructive">{formState.errors.reason.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label htmlFor={`password-${recordId}`}>Confirm password</Label>
            <Input
              id={`password-${recordId}`}
              type="password"
              {...register("password")}
              autoComplete="current-password"
              disabled={createSignature.isPending}
            />
            {formState.errors.password ? (
              <p className="text-xs text-destructive">{formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createSignature.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={createSignature.isPending} loadingText="Signing...">
              Sign and Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
