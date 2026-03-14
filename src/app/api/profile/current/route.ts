import { getCurrentUserWithProfile } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/utils/api";
import type { CurrentUserProfile } from "@/types/api";

export async function GET() {
  const { user, profile } = await getCurrentUserWithProfile();

  if (!user) {
    return sendError("Unauthorized", 401);
  }

  return sendSuccess<CurrentUserProfile>({
    user: { id: user.id, email: user.email ?? null },
    profile: profile
      ? {
          id: profile.id,
          full_name: profile.full_name ?? null,
          avatar_url: profile.avatar_url ?? null,
          role: profile.role,
        }
      : null,
  });
}
