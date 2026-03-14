"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { ContentContainer } from "@/components/shared/content-container";
import { ProfileSkeleton } from "@/components/dashboard/profile-skeleton";
import { getErrorMessage } from "@/lib/utils";

export default function ProfilePage() {
  const { data, isLoading, isError, error } = useCurrentUser();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load profile.")}
      </p>
    );
  }

  if (!data?.user) {
    return null;
  }

  const { user, profile } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">
          Your account details.
        </p>
      </div>

      <ContentContainer as="section" className="space-y-6">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Email</h2>
          <p className="text-foreground">{user.email ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Display name</h2>
          <p className="text-foreground">{profile?.full_name ?? "—"}</p>
        </div>
      </ContentContainer>
    </div>
  );
}
