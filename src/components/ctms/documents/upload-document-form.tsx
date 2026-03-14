"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadDocument } from "@/hooks/use-documents";
import { getErrorMessage } from "@/lib/utils";
import { DOCUMENT_TYPES, uploadDocumentFormSchema, type UploadDocumentFormInput } from "@/types/schemas";

interface UploadDocumentFormProps {
  studyId: string;
}

export function UploadDocumentForm({ studyId }: UploadDocumentFormProps) {
  const uploadDocument = useUploadDocument(studyId);

  const form = useForm<UploadDocumentFormInput>({
    resolver: zodResolver(uploadDocumentFormSchema),
    defaultValues: {
      name: "",
      doc_type: "protocol",
      site_id: "",
      version: "1.0",
      file: undefined,
    },
  });

  async function onSubmit(values: UploadDocumentFormInput) {
    try {
      await uploadDocument.mutateAsync(values);
      toast.success("Document uploaded.");
      form.reset({
        name: "",
        doc_type: "protocol",
        site_id: "",
        version: "1.0",
        file: undefined,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload document."));
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 rounded-lg border p-4 md:grid-cols-12">
      <div className="space-y-1 md:col-span-4">
        <Label>Document Name</Label>
        <Input placeholder="Protocol v2" {...form.register("name")} />
      </div>

      <div className="space-y-1 md:col-span-2">
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

      <div className="space-y-1 md:col-span-2">
        <Label>Site ID (optional)</Label>
        <Input placeholder="UUID" {...form.register("site_id")} />
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label>File</Label>
        <Input
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) form.setValue("file", file, { shouldValidate: true });
          }}
        />
      </div>

      <div className="md:col-span-12 flex justify-end">
        <Button type="submit" loading={uploadDocument.isPending} loadingText="Uploading...">
          Upload Document
        </Button>
      </div>
    </form>
  );
}
