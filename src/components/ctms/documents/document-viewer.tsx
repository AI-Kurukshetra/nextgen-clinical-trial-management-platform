"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, Download, Loader2, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDownloadDocument } from "@/hooks/use-documents";
import { getErrorMessage } from "@/lib/utils";
import type { Document } from "@/types/database";

const VIEWABLE_IMAGES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
];

function getViewerType(mime: string | null): "pdf" | "image" | "unsupported" {
  if (!mime) return "unsupported";
  if (mime === "application/pdf") return "pdf";
  if (VIEWABLE_IMAGES.includes(mime)) return "image";
  return "unsupported";
}

interface DocumentViewerProps {
  document: Document;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [open, setOpen] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const downloadDocument = useDownloadDocument();

  const viewerType = getViewerType(document.file_mime);

  async function handleOpen() {
    if (!document.s3_key) {
      toast.error("No file associated with this document.");
      return;
    }
    try {
      const { downloadUrl } = await downloadDocument.mutateAsync(document.id);
      setViewUrl(downloadUrl);
      setOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load document preview."));
    }
  }

  function handleClose() {
    setOpen(false);
    setViewUrl(null);
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleOpen}
        disabled={downloadDocument.isPending || !document.s3_key}
        title={!document.s3_key ? "No file available" : "View document"}
      >
        {downloadDocument.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
        <span className="ml-1">View</span>
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
        <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between shrink-0">
            <div className="min-w-0">
              <DialogTitle className="truncate">{document.name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                v{document.version} &middot; {document.file_mime ?? "unknown type"}
                {document.file_size
                  ? ` · ${Math.round(document.file_size / 1024)} KB`
                  : null}
              </p>
            </div>
            {viewUrl && (
              <a
                href={viewUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button size="sm" variant="outline" type="button">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </a>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden bg-muted/30">
            {!viewUrl ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : viewerType === "pdf" ? (
              <iframe
                src={viewUrl}
                className="w-full h-full border-0"
                title={document.name}
              />
            ) : viewerType === "image" ? (
              <div className="flex h-full items-center justify-center p-4 overflow-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewUrl}
                  alt={document.name}
                  className="max-w-full max-h-full object-contain rounded-md shadow-sm"
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileX className="h-12 w-12" />
                <p className="text-sm font-medium">Preview not available</p>
                <p className="text-xs">
                  {document.file_mime
                    ? `"${document.file_mime}" files cannot be previewed in the browser.`
                    : "Unknown file type."}
                </p>
                <a href={viewUrl} download target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download instead
                  </Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
