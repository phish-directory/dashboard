"use client";

import type React from "react";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  let isDev: boolean;

  if (process.env.NODE_ENV === "production") {
    isDev = false;
  } else {
    isDev = true;
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (
      isClient &&
      !isLoading &&
      !user &&
      !pathname.includes("/login") &&
      !pathname.includes("/signup")
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname, isClient]);

  if (!isClient) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user && !pathname.includes("/login") && !pathname.includes("/signup")) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      {isDev && (
        <div className="bg-blue-500 text-white text-center text-sm py-1">
          Development Environment - Using API at localhost:3000
        </div>
      )}
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}
