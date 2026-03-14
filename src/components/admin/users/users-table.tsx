"use client";

import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserListItem } from "@/types/api";
import { RoleSelect } from "@/components/admin/users/role-select";
import { ROLES, type Role } from "@/constants/roles";

type UsersTableProps = {
  users: UserListItem[];
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email ?? "—"}</TableCell>
              <TableCell>{user.full_name ?? "—"}</TableCell>
              <TableCell>
                <RoleSelect
                  userId={user.id}
                  currentRole={(user.role as Role) ?? ROLES.USER}
                />
              </TableCell>
              <TableCell>
                {user.created_at ? format(new Date(user.created_at), "yyyy-MM-dd") : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

