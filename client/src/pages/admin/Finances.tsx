import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { DollarSign, Percent, Wallet } from "lucide-react";

export default function AdminFinances() {
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/finances"],
    queryFn: async () => { const res = await authFetch("/api/admin/finances"); return res.json(); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-admin-finances-title">{t("admin.finances.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><DollarSign size={20} /></div>
            <span className="text-sm font-medium text-muted-foreground">{t("admin.finances.totalRevenue")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : `${Number(data?.totalRevenue || 0).toFixed(2)} ${t("common.sar")}`}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><Percent size={20} /></div>
            <span className="text-sm font-medium text-muted-foreground">{t("admin.finances.totalFees")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : `${Number(data?.totalFees || 0).toFixed(2)} ${t("common.sar")}`}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wallet size={20} /></div>
            <span className="text-sm font-medium text-muted-foreground">{t("admin.finances.supplierPayouts")}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : `${Number(data?.supplierPayouts || 0).toFixed(2)} ${t("common.sar")}`}</p>
        </div>
      </div>

      {data?.suppliers && data.suppliers.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h2 className="font-bold text-foreground">{t("admin.finances.perSupplier")}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-4 py-3 text-start font-semibold">{t("admin.finances.supplierName")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.finances.totalSales")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.finances.fees")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.finances.payout")}</th>
              </tr>
            </thead>
            <tbody>
              {data.suppliers.map((s: any) => (
                <tr key={s.supplierId} className="border-b border-border/20">
                  <td className="px-4 py-3 font-medium">{s.businessName}</td>
                  <td className="px-4 py-3">{Number(s.totalSales).toFixed(2)} {t("common.sar")}</td>
                  <td className="px-4 py-3 text-orange-600">{Number(s.fees).toFixed(2)} {t("common.sar")}</td>
                  <td className="px-4 py-3 font-bold">{Number(s.payout).toFixed(2)} {t("common.sar")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
