"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, type Role } from "@/constants/roles";
import { useUpdateUserRole } from "@/hooks/use-users";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

type RoleSelectProps = {
  userId: string;
  currentRole: Role;
};

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useUpdateUserRole();

  const handleChange = async (role: Role) => {
    try {
      await mutateAsync({ id: userId, role });
      toast.success("Role updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update role."));
    } finally {
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={isPending}
          loadingText="Updating..."
          className="inline-flex items-center gap-1"
        >
          <span className="capitalize">{currentRole}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void handleChange(ROLES.ADMIN)}>
          Admin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleChange(ROLES.USER)}>
          User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

