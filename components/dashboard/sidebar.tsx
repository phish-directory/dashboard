"use client";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { BarChart3, FileText, Home, Mail, Search, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminRoutes = [
  {
    title: "[ADMIN] Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "[ADMIN] Domains",
    href: "/admin/domains",
    icon: FileText,
  },
  {
    title: "[ADMIN] Metrics",
    href: "/admin/metrics",
    icon: BarChart3,
  },
];

const userRoutes = [
  {
    title: "Dashboard Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Domain Check",
    href: "/domain-check",
    icon: Search,
  },
  {
    title: "Email Check",
    href: "/email-check",
    icon: Mail,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const routes = [...userRoutes, ...(isAdmin ? adminRoutes : [])];

  return (
    <nav className="hidden w-64 border-r bg-muted/40 md:block">
      <div className="flex h-full flex-col gap-2 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === route.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
