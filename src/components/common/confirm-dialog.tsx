import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            loading={isPending}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

