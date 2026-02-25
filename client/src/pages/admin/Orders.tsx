import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";

export default function AdminOrders() {
  const { t } = useI18n();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => { const res = await authFetch("/api/admin/orders"); return res.json(); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-admin-orders-title">{t("admin.orders.title")}</h1>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse border border-border/20"></div>)}</div>
      ) : !orders || orders.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">{t("orders.noOrders")}</p>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.orderNumber")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.date")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.total")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.platformFee")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.status")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.paymentMethod")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors" data-testid={`row-admin-order-${order.id}`}>
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-bold">{Number(order.totalAmount).toFixed(2)} {t("common.sar")}</td>
                  <td className="px-4 py-3 text-orange-600 font-semibold">{Number(order.platformFee).toFixed(2)} {t("common.sar")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-accent/20 text-accent-foreground'
                    }`}>
                      {t(`orders.statuses.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{order.paymentMethod === 'COD' ? t("checkout.cod") : t("checkout.creditCard")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
