import { useMyOrders } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/i18nProvider";
import { Package, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export default function Orders() {
  const { data: orders, isLoading } = useMyOrders();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="h-8 bg-[#F0E8DE] w-48 rounded mb-8 animate-pulse"></div>
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl mb-4 animate-pulse shadow-warm"></div>)}
      </div>
    );
  }

  return (
    <FadeUp className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <h1 className="text-3xl font-bold text-[#1A0E08] mb-8" style={{ letterSpacing: '-0.01em' }} data-testid="text-orders-title">{t("orders.title")}</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-warm">
          <ShoppingBag size={48} className="text-[#C4A882] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A0E08] mb-2" data-testid="text-no-orders">{t("orders.noOrders")}</h3>
          <p className="text-[#8B6954] mb-6">{t("orders.noOrdersDesc")}</p>
          <Link href="/products" className="btn-gold px-6 py-2.5 rounded-full font-bold">{t("hero.browseProducts")}</Link>
        </div>
      ) : (
        <StaggerContainer className="space-y-4">
          {orders.map((order: any) => (
            <StaggerItem key={order.id}>
              <div className="bg-white rounded-xl p-6 shadow-warm hover:shadow-warm-hover transition-shadow duration-300" data-testid={`card-order-${order.id}`}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={18} className="text-[#3C2415]" />
                      <span className="font-bold text-[#1A0E08]" data-testid={`text-order-number-${order.id}`}>{order.orderNumber}</span>
                    </div>
                    <p className="text-sm text-[#8B6954]">{new Date(order.createdAt).toLocaleDateString(t("brand") === "Bdo Beans" ? "en-US" : "ar-SA")}</p>
                  </div>
                  <div className="text-end">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'DELIVERED' ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'CANCELLED' ? 'bg-[#9B2C2C]/10 text-[#9B2C2C]' :
                      'bg-[#F5ECD7] text-[#B8860B]'
                    }`} data-testid={`badge-status-${order.id}`}>
                      {t(`orders.statuses.${order.status}`)}
                    </span>
                    <p className="font-bold text-[#B8860B] mt-2">{Number(order.totalAmount).toFixed(2)} {t("common.sar")}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#F0E8DE] flex justify-between items-center">
                  <span className="text-sm text-[#8B6954]">
                    {t("checkout.paymentMethod")}: {order.paymentMethod === 'COD' ? t("checkout.cod") : t("checkout.creditCard")}
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </FadeUp>
  );
}
