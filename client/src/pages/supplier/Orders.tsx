import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function SupplierOrders() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/supplier/orders"],
    queryFn: async () => { const res = await authFetch("/api/supplier/orders"); return res.json(); },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, itemStatus, trackingNumber }: { id: string; itemStatus: string; trackingNumber?: string }) => {
      const res = await apiRequest("PATCH", `/api/supplier/order-items/${id}`, { itemStatus, trackingNumber });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/supplier/orders"] }),
  });

  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-supplier-orders-title">{t("supplier.orders.title")}</h1>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse border border-border/20"></div>)}</div>
      ) : !items || items.length === 0 ? (
        <p className="text-muted-foreground text-center py-10" data-testid="text-no-supplier-orders">{t("supplier.orders.noOrders")}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <div key={item.id} className="bg-card rounded-xl p-4 border border-border/50 shadow-sm" data-testid={`card-supplier-order-${item.id}`}>
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{t("supplier.orders.orderNumber")}: {item.orderId?.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{t("supplier.orders.items")}: {item.quantity}x - {Number(item.subtotal).toFixed(2)} {t("common.sar")}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.itemStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  item.itemStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                  item.itemStatus === 'PROCESSING' ? 'bg-orange-100 text-orange-700' :
                  'bg-accent/20 text-accent-foreground'
                }`}>
                  {t(`orders.itemStatuses.${item.itemStatus}`)}
                </span>
              </div>

              {item.itemStatus === 'PENDING' && (
                <button onClick={() => updateItem.mutate({ id: item.id, itemStatus: "PROCESSING" })} className="text-sm font-bold text-primary hover:underline" data-testid={`button-start-processing-${item.id}`}>
                  {t("supplier.orders.markProcessing")}
                </button>
              )}

              {item.itemStatus === 'PROCESSING' && (
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="text"
                    value={trackingInputs[item.id] || ""}
                    onChange={e => setTrackingInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder={t("supplier.orders.trackingNumber")}
                    className="px-3 py-2 rounded-lg bg-background border border-border text-sm flex-1"
                    dir="ltr"
                    data-testid={`input-tracking-${item.id}`}
                  />
                  <button
                    onClick={() => updateItem.mutate({ id: item.id, itemStatus: "SHIPPED", trackingNumber: trackingInputs[item.id] })}
                    className="text-sm font-bold text-white bg-primary px-4 py-2 rounded-lg"
                    data-testid={`button-mark-shipped-${item.id}`}
                  >
                    {t("supplier.orders.markShipped")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
