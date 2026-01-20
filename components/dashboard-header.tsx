"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LogOut, FileText, Users, Home, Database, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "brzezinscy@yahoo.pl";

export function DashboardHeader() {
  const { data: session } = useSession() || {};
  const pathname = usePathname();
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const navItems = [
    { href: "/strona-glowna", label: "Strona główna", icon: Home },
    { href: "/rekordy", label: "Rekordy", icon: FileText },
    { href: "/uzytkownicy", label: "Użytkownicy", icon: Users },
    { href: "/kopie-zapasowe", label: "Kopie zapasowe", icon: Database },
    ...(isAdmin ? [{ href: "/logi", label: "Logi", icon: ScrollText }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/strona-glowna" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                Ewidencja Godzin
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems?.map?.((item) => {
                const Icon = item?.icon;
                const isActive = pathname === item?.href;
                return (
                  <Link
                    key={item?.href}
                    href={item?.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item?.label}
                  </Link>
                );
              }) ?? null}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {session?.user?.name ?? "Użytkownik"}
              </span>
              <span className="text-xs text-gray-500">
                {session?.user?.email ?? ""}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/logowanie" })}
              title="Wyloguj"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
