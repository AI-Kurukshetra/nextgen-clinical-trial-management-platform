"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnumDropdownOption {
  value: string;
  label: string;
}

interface EnumDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: EnumDropdownOption[];
  disabled?: boolean;
  placeholder?: string;
}

export function EnumDropdown({
  value,
  onChange,
  options,
  disabled,
  placeholder = "Select option",
}: EnumDropdownProps) {
  const active = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled}>
        <Button type="button" variant="outline" className="w-full justify-between" disabled={disabled}>
          <span className="truncate">{active?.label ?? placeholder}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
