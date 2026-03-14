"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SITE_MEMBER_ROLES, PERMISSION_FLAGS, SITE_ROLE_DEFAULT_MASK } from "@/constants/permissions";
import {
  useAddSiteMember,
  useProfileSearch,
  useRemoveSiteMember,
  useSiteMembers,
  useUpdateSiteMember,
} from "@/hooks/use-site-members";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EnumDropdown } from "@/components/shared/enum-dropdown";
import { permissionLabels } from "@/lib/site-permissions";

interface SiteMembersPanelProps {
  siteId: string;
}

export function SiteMembersPanel({ siteId }: SiteMembersPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState<string>("viewer");
  const [mask, setMask] = useState<number>(SITE_ROLE_DEFAULT_MASK.viewer ?? 0);

  const { data: members, isLoading } = useSiteMembers(siteId);
  const { data: candidates } = useProfileSearch(query);
  const addMember = useAddSiteMember(siteId);
  const updateMember = useUpdateSiteMember(siteId);
  const removeMember = useRemoveSiteMember(siteId);

  const roleOptions = useMemo(
    () => SITE_MEMBER_ROLES.map((item) => ({ value: item, label: item.replaceAll("_", " ") })),
    []
  );

  function updateMask(bit: number, checked: boolean) {
    setMask((current) => (checked ? current | bit : current & ~bit));
  }

  async function onAddMember() {
    if (!selectedUserId) {
      toast.error("Select a user first.");
      return;
    }

    try {
      await addMember.mutateAsync({ user_id: selectedUserId, role: role as (typeof SITE_MEMBER_ROLES)[number], permission_mask: mask });
      toast.success("Member added to site.");
      setSelectedUserId("");
      setQuery("");
      setRole("viewer");
      setMask(SITE_ROLE_DEFAULT_MASK.viewer ?? 0);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add site member."));
    }
  }

  async function onApplyDefaultMask() {
    setMask(SITE_ROLE_DEFAULT_MASK[role] ?? 0);
  }

  async function onRemoveMember(memberId: string) {
    try {
      await removeMember.mutateAsync(memberId);
      toast.success("Member removed.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove member."));
    }
  }

  async function onPromote(memberId: string, nextRole: string) {
    try {
      await updateMember.mutateAsync({
        memberId,
        input: {
          role: nextRole as (typeof SITE_MEMBER_ROLES)[number],
          permission_mask: SITE_ROLE_DEFAULT_MASK[nextRole] ?? 0,
        },
      });
      toast.success("Member role updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update member role."));
    }
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="text-base font-semibold">Site Access & Ownership</h3>
        <p className="text-sm text-muted-foreground">
          Owner/Admin can grant site-level permissions using bitmasks. This controls who can enroll subjects, manage
          visits, documents, and deviations at this site.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 md:grid-cols-12">
        <div className="md:col-span-5 space-y-1">
          <Label>User search (email or name)</Label>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." />
          {query.length >= 2 ? (
            <div className="max-h-32 overflow-y-auto rounded-md border bg-background p-1 text-sm">
              {(candidates ?? []).map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className="block w-full rounded px-2 py-1 text-left hover:bg-muted"
                  onClick={() => {
                    setSelectedUserId(candidate.id);
                    setQuery(candidate.email ?? candidate.full_name ?? candidate.id);
                  }}
                >
                  {candidate.full_name ?? "Unnamed"} · {candidate.email ?? "no-email"}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="md:col-span-3 space-y-1">
          <Label>Site role</Label>
          <EnumDropdown
            value={role}
            onChange={(value) => setRole(value)}
            options={roleOptions}
            placeholder="Select role"
          />
          <Button type="button" variant="outline" className="w-full" onClick={onApplyDefaultMask}>
            Apply Role Defaults
          </Button>
        </div>

        <div className="md:col-span-4 space-y-1">
          <Label>Permission mask: {mask}</Label>
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-2 text-xs">
            {PERMISSION_FLAGS.map((flag) => (
              <label key={flag.bit} className="flex items-center gap-2">
                <Checkbox
                  checked={(mask & flag.bit) === flag.bit}
                  onCheckedChange={(checked) => updateMask(flag.bit, Boolean(checked))}
                />
                <span>{flag.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-12 flex justify-end">
          <Button onClick={onAddMember} loading={addMember.isPending} loadingText="Adding...">
            Add Site Member
          </Button>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading site members...</p> : null}

      <div className="space-y-2">
        {(members ?? []).map((member) => (
          <div key={member.id} className="rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{member.profile?.full_name ?? member.profile?.email ?? member.user_id}</p>
                <p className="text-xs text-muted-foreground">
                  Role: {member.role} · Mask: {member.permission_mask}
                </p>
                <p className="text-xs text-muted-foreground">{permissionLabels(member.permission_mask).join(", ") || "No permissions"}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => onPromote(member.id, "admin")}>
                  Make Admin
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => onPromote(member.id, "viewer")}>
                  Make Viewer
                </Button>
                {member.role !== "owner" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveMember(member.id)}
                    loading={removeMember.isPending}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {(members?.length ?? 0) === 0 ? <p className="text-sm text-muted-foreground">No site members yet.</p> : null}
      </div>
    </section>
  );
}
