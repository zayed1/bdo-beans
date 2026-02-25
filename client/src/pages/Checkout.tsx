import { useState } from "react";
import { useCart } from "@/store/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { CreditCard, Banknote, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n/i18nProvider";
import { FadeUp } from "@/components/ui/motion";
import { motion } from "framer-motion";

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { t, locale } = useI18n();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSuccess, setIsSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");

  const subtotal = getTotal();
  const shipping = items.length > 0 ? 25 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (items.length === 0) return;

    createOrder.mutate({
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      paymentMethod,
      notes: "",
      address: { fullName, phone, city, district, street }
    }, {
      onSuccess: () => {
        setIsSuccess(true);
        clearCart();
      }
    });
  };

  if (isSuccess) {
    return (
      <FadeUp className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-bold text-[#1A0E08] mb-4 text-center" style={{ letterSpacing: '-0.01em' }} data-testid="text-order-success">{t("checkout.orderSuccess")}</h1>
        <p className="text-lg text-[#8B6954] text-center max-w-md mb-8">{t("checkout.orderSuccessDesc")}</p>
        <Link href="/products" className="btn-gold px-8 py-3 rounded-full font-bold" data-testid="link-continue-shopping">{t("checkout.continueShopping")}</Link>
      </FadeUp>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-2xl font-bold text-[#1A0E08] mb-4 text-center" data-testid="text-cart-empty">{t("cart.emptyPage")}</h1>
        <Link href="/products" className="text-[#B8860B] hover:underline" data-testid="link-back-to-store">{t("cart.backToStore")}</Link>
      </div>
    );
  }

  return (
    <FadeUp className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <h1 className="text-3xl font-bold text-[#1A0E08] mb-10" style={{ letterSpacing: '-0.01em' }} data-testid="text-checkout-title">{t("checkout.title")}</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-warm">
            <h2 className="text-xl font-bold text-[#1A0E08] mb-6">{t("checkout.shippingAddress")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C3D2E] mb-2">{t("checkout.fullName")}</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all" placeholder={t("checkout.fullNamePlaceholder")} data-testid="input-fullname" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C3D2E] mb-2">{t("checkout.phone")}</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-left" dir="ltr" placeholder={t("checkout.phonePlaceholder")} data-testid="input-phone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C3D2E] mb-2">{t("checkout.city")}</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all" data-testid="input-city" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C3D2E] mb-2">{t("checkout.district")}</label>
                <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all" data-testid="input-district" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#5C3D2E] mb-2">{t("checkout.street")}</label>
                <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all" placeholder={t("checkout.addressPlaceholder")} data-testid="input-street" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-warm">
            <h2 className="text-xl font-bold text-[#1A0E08] mb-6">{t("checkout.paymentMethod")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-200 ${paymentMethod === 'COD' ? 'border-[#B8860B] bg-[#F5ECD7] text-[#B8860B]' : 'border-[#DDD0C0] hover:border-[#C4A882] text-[#8B6954]'}`} data-testid="radio-cod">
                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <Banknote size={32} />
                <span className="font-bold">{t("checkout.cod")}</span>
              </label>

              <div className="relative border-2 rounded-xl p-5 flex flex-col items-center gap-3 border-[#DDD0C0] text-[#8B6954]/50 cursor-not-allowed opacity-60" data-testid="radio-online-disabled">
                <CreditCard size={32} />
                <span className="font-bold">{t("checkout.creditCard")}</span>
                <span className="absolute top-2 right-2 bg-[#F0E8DE] text-[#8B6954] text-xs font-bold px-2 py-0.5 rounded-full">{t("checkout.comingSoon")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-[#1A0E08] text-white p-6 rounded-2xl shadow-luxury sticky top-24">
            <h2 className="text-xl font-bold mb-6" data-testid="text-order-summary">{t("checkout.orderSummary")}</h2>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">{item.quantity}x</span>
                    <span className="truncate" title={locale === "ar" ? item.product.nameAr : item.product.nameEn}>{locale === "ar" ? item.product.nameAr : item.product.nameEn}</span>
                  </div>
                  <span className="font-bold shrink-0">{(Number(item.product.basePrice) * item.quantity).toFixed(2)} {t("common.sar")}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-white/20 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">{t("checkout.subtotal")}</span>
                <span>{subtotal.toFixed(2)} {t("common.sar")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">{t("checkout.shipping")}</span>
                <span>{shipping.toFixed(2)} {t("common.sar")}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-end">
              <span className="text-lg font-bold">{t("checkout.total")}</span>
              <span className="text-2xl font-bold text-[#D4A843]" data-testid="text-order-total">{total.toFixed(2)} {t("common.sar")}</span>
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={createOrder.isPending || !fullName || !phone || !city || !street}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-8 bg-[#B8860B] text-white hover:bg-[#D4A843] py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-70"
              data-testid="button-confirm-order"
            >
              {createOrder.isPending ? t("checkout.processing") : t("checkout.confirmOrder")}
            </motion.button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
              <ShieldCheck size={14} /> {t("checkout.securePayments")}
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
