"use client";

import { useUsers } from "@/hooks/use-users";
import { UsersTable } from "@/components/admin/users/users-table";
import { EmptyState } from "@/components/common/empty-state";
import { Users as UsersIcon } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function AdminUsersPage() {
  const { data, isLoading, isError, error } = useUsers();
  const users = data?.data ?? [];

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading users...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load users.")}
      </p>
    );
  }

  if (!users.length) {
    return (
      <EmptyState
        icon={UsersIcon}
        title="No users found"
        description="Profiles will appear here after users sign up."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground">
          View all users and manage their roles.
        </p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
