import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { findUserById } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const dbUser = user ? await findUserById(user.userId) : null;

  return (
    <div className="min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
        <Link href={"/"} className="flex items-center   gap-2 ">
          <h1 className="font-medium text-3xl">Next<span className="text-blue-700">Leave</span></h1>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {dbUser && (
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {dbUser.firstName} {dbUser.lastName}
              </span>
              <Badge variant="secondary" className="capitalize">
                {dbUser.role.toLowerCase()}
              </Badge>
            </div>
          )}
          <LogoutButton />
        </nav>
      </header>
      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
