"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";

export const Form = FormProvider;

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName>;

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: FormFieldProps<TFieldValues, TName>) {
  // react-hook-form Controller already handles memoization internally
  return <Controller {...props} />;
}

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>;

export function FormItem({ className, ...props }: FormItemProps) {
  return (
    <div
      className={cn("space-y-2", className)}
      {...props}
    />
  );
}

export type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  );
}

export type FormControlProps = React.HTMLAttributes<HTMLDivElement>;

export function FormControl({ className, ...props }: FormControlProps) {
  return (
    <div
      className={cn(className)}
      {...props}
    />
  );
}

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>;

export function FormMessage({ className, children, ...props }: FormMessageProps) {
  const { formState } = useFormContext();
  const hasError = formState.errors && children != null;

  if (!hasError) {
    return null;
  }

  return (
    <p
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

