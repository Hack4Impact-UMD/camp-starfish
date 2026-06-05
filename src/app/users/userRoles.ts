import { Role } from "@/types/users/userTypes";

export const ALL_ROLES: Role[] = ["ADMIN", "STAFF", "PHOTOGRAPHER", "PARENT", "CAMPER"];

/** Badge/Select colors keyed by role, using the project theme palettes. */
export const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "error",
  STAFF: "blue",
  PHOTOGRAPHER: "aqua",
  PARENT: "green",
  CAMPER: "orange",
};

/** Formats a role enum value for display, e.g. "PHOTOGRAPHER" -> "Photographer". */
export function formatRole(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
