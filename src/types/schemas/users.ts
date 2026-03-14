import { z } from "zod";
import { ROLES } from "@/constants/roles";

export const updateUserRoleSchema = z.object({
  role: z.enum([
    ROLES.ADMIN,
    ROLES.STUDY_MANAGER,
    ROLES.MONITOR,
    ROLES.SITE_COORDINATOR,
    ROLES.VIEWER,
  ]),
});

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;
