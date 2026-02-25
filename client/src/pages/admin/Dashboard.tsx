import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { DollarSign, Users, ShoppingCart, TrendingUp, Package, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => { const res = await authFetch("/api/admin/dashboard"); return res.json(); },
  });

  const stats = [
    { label: t("admin.dashboard.totalRevenue"), value: data ? `${Number(data.totalRevenue).toFixed(2)} ${t("admin.dashboard.sar")}` : "---", icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: t("admin.dashboard.platformFees"), value: data ? `${Number(data.platformFees).toFixed(2)} ${t("admin.dashboard.sar")}` : "---", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: t("admin.dashboard.activeSuppliers"), value: data?.activeSuppliers ?? "---", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: t("admin.dashboard.pendingApprovals"), value: data?.pendingApprovals ?? "---", icon: Clock, color: "bg-orange-50 text-orange-600" },
    { label: t("admin.dashboard.totalOrders"), value: data?.totalOrders ?? "---", icon: ShoppingCart, color: "bg-pink-50 text-pink-600" },
    { label: t("admin.dashboard.todayOrders"), value: data?.todayOrders ?? "---", icon: Package, color: "bg-cyan-50 text-cyan-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-admin-dashboard-title">{t("admin.dashboard.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm" data-testid={`card-admin-stat-${i}`}>
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
