export type AdminRole = "admin" | "editor" | "viewer";

export type AdminPermission =
  | "dashboard.read"
  | "releases.read"
  | "releases.write"
  | "leads.read"
  | "leads.write"
  | "settings.read"
  | "settings.write"
  | "audit.read";

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  admin: [
    "dashboard.read",
    "releases.read",
    "releases.write",
    "leads.read",
    "leads.write",
    "settings.read",
    "settings.write",
    "audit.read",
  ],
  editor: ["dashboard.read", "releases.read", "releases.write", "leads.read", "leads.write", "settings.read", "settings.write"],
  viewer: ["dashboard.read", "releases.read", "leads.read", "settings.read", "audit.read"],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parseRole = (value: unknown): AdminRole | null => {
  if (value === "admin" || value === "editor" || value === "viewer") {
    return value;
  }
  return null;
};

export const getRoleFromClaims = (claims: unknown): AdminRole | null => {
  if (!isRecord(claims)) return null;
  const metadata = isRecord(claims.metadata) ? claims.metadata : null;
  const publicMetadata = isRecord(claims.publicMetadata) ? claims.publicMetadata : null;
  return parseRole(metadata?.role ?? publicMetadata?.role);
};

export const hasPermission = (role: AdminRole | null, permission: AdminPermission) =>
  role ? rolePermissions[role].includes(permission) : false;
