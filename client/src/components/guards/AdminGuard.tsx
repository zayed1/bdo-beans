import { type ReactNode } from "react";
import { useUser } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (!user || user.role !== "ADMIN") {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
