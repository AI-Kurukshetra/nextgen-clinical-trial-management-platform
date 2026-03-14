interface FormSectionProps {
  label: string;
  children: React.ReactNode;
}

export function FormSection({ label, children }: FormSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-foreground border-b pb-1 w-full">{label}</legend>
      <div className="grid gap-4 md:grid-cols-2">
        {children}
      </div>
    </fieldset>
  );
}
