"use client";

import { useCallback, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FileText, Sheet, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadDocument } from "@/hooks/use-documents";
import { getErrorMessage } from "@/lib/utils";
import {
  DOCUMENT_TYPES,
  uploadDocumentFormSchema,
  type UploadDocumentFormInput,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/types/schemas";

interface UploadDocumentFormProps {
  studyId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <Sheet className="h-5 w-5 text-green-600" />;
  return <FileIcon className="h-5 w-5 text-blue-500" />;
}

export function UploadDocumentForm({ studyId }: UploadDocumentFormProps) {
  const uploadDocument = useUploadDocument(studyId);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadDocumentFormInput>({
    resolver: zodResolver(uploadDocumentFormSchema),
    defaultValues: {
      name: "",
      doc_type: "protocol",
      site_id: "",
      version: "1.0",
      effective_date: null,
      expiry_date: null,
      file: undefined,
    },
  });

  function validateAndSetFile(file: File) {
    setFileError(null);
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setFileError("Only PDF, DOCX, and XLSX files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File size must be 50 MB or less.");
      return;
    }
    setSelectedFile(file);
    form.setValue("file", file, { shouldValidate: true });
    if (!form.getValues("name")) {
      form.setValue("name", file.name.replace(/\.[^.]+$/, ""));
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSetFile(file);
    },
    [form]
  );

  function clearFile() {
    setSelectedFile(null);
    setFileError(null);
    form.setValue("file", undefined as unknown as File, { shouldValidate: false });
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onSubmit(values: UploadDocumentFormInput) {
    try {
      await uploadDocument.mutateAsync(values);
      toast.success("Document uploaded.");
      form.reset({
        name: "",
        doc_type: "protocol",
        site_id: "",
        version: "1.0",
        effective_date: null,
        expiry_date: null,
        file: undefined,
      });
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload document."));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-4">
      {/* Drag-and-drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
        }`}
      >
        {selectedFile ? (
          <div className="flex items-center gap-3 text-sm" onClick={(e) => e.stopPropagation()}>
            <FileTypeIcon mimeType={selectedFile.type} />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
            </div>
            <button type="button" onClick={clearFile} className="ml-2 text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <FileIcon className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Drag & drop a file here, or <span className="text-primary underline">click to browse</span>
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX — max 50 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndSetFile(file);
          }}
        />
      </div>
      {(fileError || form.formState.errors.file) && (
        <p className="text-sm text-destructive">{fileError ?? (form.formState.errors.file?.message as string)}</p>
      )}

      <div className="grid gap-3 md:grid-cols-12">
        <div className="space-y-1 md:col-span-4">
          <Label>Document Name <span className="text-destructive">*</span></Label>
          <Input placeholder="Protocol v2" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label>Type</Label>
          <select
            {...form.register("doc_type")}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            {DOCUMENT_TYPES.map((docType) => (
              <option key={docType} value={docType}>
                {docType.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label>Version</Label>
          <Input placeholder="1.0" {...form.register("version")} />
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label>Site ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input placeholder="UUID" {...form.register("site_id")} />
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label>Effective Date</Label>
          <Input type="date" {...form.register("effective_date")} />
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label>Expiry Date</Label>
          <Input type="date" {...form.register("expiry_date")} />
        </div>

        <div className="md:col-span-12 flex justify-end">
          <Button type="submit" loading={uploadDocument.isPending} loadingText="Uploading..." disabled={!selectedFile}>
            Upload Document
          </Button>
        </div>
      </div>
    </form>
  );
}
