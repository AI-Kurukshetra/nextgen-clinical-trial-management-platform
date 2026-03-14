import { z } from "zod";
import { ROLES } from "@/constants/roles";

export const updateUserRoleSchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.USER]),
});

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;

