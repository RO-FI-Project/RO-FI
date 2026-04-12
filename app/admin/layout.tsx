import { auth, currentUser } from "@clerk/nextjs/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConvexProviders } from "@/components/ConvexProviders";
import { getRoleFromClaims, parseRole } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  const claimRole = getRoleFromClaims(sessionClaims);
  const user = await currentUser();
  const userRole = parseRole(user?.publicMetadata?.role);
  const role = claimRole ?? userRole;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userLabel = user?.fullName || userEmail || "Admin user";
  const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() ?? "";
  const superAdminEmail = normalizeEmail(process.env.SUPER_ADMIN_EMAIL);
  const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
  const normalizedUserEmail = normalizeEmail(userEmail);
  const isAllowedEmail = Boolean(
    normalizedUserEmail &&
      (normalizedUserEmail === superAdminEmail ||
        (allowedEmails ? allowedEmails.includes(normalizedUserEmail) : false))
  );

  const missingRole = !role;
  const missingAllowlist = !isAllowedEmail;

  if (missingRole || missingAllowlist) {
    const reasons = [
      missingAllowlist ? "Email chưa nằm trong allowlist admin." : null,
      missingRole ? "Tài khoản chưa có publicMetadata.role hợp lệ trong Clerk." : null,
    ].filter(Boolean);
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 text-center">
        <div className="max-w-md rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Chưa được cấp quyền truy cập</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {reasons.map((reason) => (
              <li key={reason}>- {reason}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Sau khi cấp quyền hoặc role, vui lòng đăng xuất và đăng nhập lại để cập nhật session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminShell role={role} userLabel={userLabel}>
      <ConvexProviders>{children}</ConvexProviders>
    </AdminShell>
  );
}
