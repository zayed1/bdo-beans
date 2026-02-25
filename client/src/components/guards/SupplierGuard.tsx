import { type ReactNode } from "react";
import { useUser } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useI18n } from "@/i18n/i18nProvider";
import { Clock } from "lucide-react";

export function SupplierGuard({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();
  const { t } = useI18n();

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.role !== "SUPPLIER") {
    return <Redirect to="/" />;
  }

  if (user.supplierProfile?.status === "PENDING") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-6">
          <Clock size={48} className="text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-4" data-testid="text-supplier-pending">{t("auth.supplierPending")}</h1>
        <p className="text-lg text-muted-foreground max-w-md">{t("auth.supplierPendingDesc")}</p>
      </div>
    );
  }

  if (user.supplierProfile?.status === "REJECTED") {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
