import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/api/requireAdmin";

/**
 * Admin layout that protects all /admin routes.
 * Checks authentication and admin status before rendering child pages.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and is an admin
  const adminCheck = await requireAdmin();

  // If not authenticated or not an admin, redirect to login
  if (!adminCheck.ok) {
    redirect("/login");
  }

  return <>{children}</>;
}
