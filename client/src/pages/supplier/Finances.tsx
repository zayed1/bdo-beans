import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { DollarSign, Percent, Wallet } from "lucide-react";

export default function SupplierFinances() {
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/supplier/finances"],
    queryFn: async () => { const res = await authFetch("/api/supplier/finances"); return res.json(); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-supplier-finances-title">{t("supplier.finances.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><DollarSign size={20} /></div>
            <span className="text-sm font-medium text-muted-foreground">{t("supplier.finances.totalEarned")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : `${Number(data?.totalEarned || 0).toFixed(2)} ${t("common.sar")}`}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Percent size={20} /></div>
            <span className="text-sm font-medium text-muted-foreground">{t("supplier.finances.platformFees")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : `${Number(data?.platformFees || 0).toFixed(2)} ${t("common.sar")}`}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wallet size={20} /></div>
            <span className="text-sm font-medium text-muted-foreground">{t("supplier.finances.netPayout")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : `${Number(data?.netPayout || 0).toFixed(2)} ${t("common.sar")}`}</p>
        </div>
      </div>
    </div>
  );
}
