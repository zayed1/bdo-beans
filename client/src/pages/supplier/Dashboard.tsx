import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function SupplierDashboard() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/supplier/dashboard"],
    queryFn: async () => {
      const res = await authFetch("/api/supplier/dashboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const stats = [
    { label: t("supplier.dashboard.totalSales"), value: data ? `${Number(data.totalSales).toFixed(2)} ${t("supplier.dashboard.sar")}` : "---", icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: t("supplier.dashboard.pendingOrders"), value: data?.pendingOrders ?? "---", icon: ShoppingCart, color: "bg-orange-50 text-orange-600" },
    { label: t("supplier.dashboard.activeProducts"), value: data?.activeProducts ?? "---", icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: t("supplier.dashboard.monthlyRevenue"), value: data ? `${Number(data.monthlyRevenue).toFixed(2)} ${t("supplier.dashboard.sar")}` : "---", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-supplier-dashboard-title">{t("supplier.sidebar.dashboard")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm" data-testid={`card-stat-${i}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
