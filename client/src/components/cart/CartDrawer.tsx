import { X, Trash2, Plus, Minus, ShoppingBag, Coffee } from "lucide-react";
import { useCart } from "@/store/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useI18n } from "@/i18n/i18nProvider";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal } = useCart();
  const { t, locale } = useI18n();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-[#F9F5F0] shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-[#DDD0C0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-[#3C2415]" size={22} />
                <h2 className="text-xl font-bold text-[#1A0E08]" data-testid="text-cart-title">{t("cart.title")}</h2>
                <span className="bg-[#B8860B] text-white px-2.5 py-0.5 rounded-full text-sm font-bold min-w-[24px] text-center">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#8B6954] hover:text-[#9B2C2C] hover:bg-[#9B2C2C]/10 rounded-full transition-colors"
                data-testid="button-close-cart"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#F0E8DE] flex items-center justify-center">
                    <ShoppingBag size={36} className="text-[#C4A882]" />
                  </div>
                  <p className="text-lg font-medium text-[#1A0E08]" data-testid="text-cart-empty">{t("cart.empty")}</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-2 px-6 py-2.5 rounded-full border-2 border-[#3C2415] text-[#3C2415] hover:bg-[#3C2415] hover:text-white transition-colors font-medium text-sm"
                    data-testid="button-browse-from-cart"
                  >
                    {t("cart.browseProducts")}
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex gap-4 bg-white p-4 rounded-xl shadow-warm"
                      data-testid={`card-cart-item-${item.product.id}`}
                    >
                      <div className="w-20 h-20 rounded-lg bg-[#F0E8DE] flex-shrink-0 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-[#F0E8DE] to-[#DDD0C0] flex items-center justify-center">
                          <Coffee className="text-[#C4A882]" size={28} />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-sm text-[#1A0E08] line-clamp-2">{locale === "ar" ? item.product.nameAr : item.product.nameEn}</h3>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-[#8B6954] hover:text-[#9B2C2C] transition-colors p-1"
                              data-testid={`button-remove-item-${item.product.id}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-[#8B6954] mt-1">{item.product.basePrice} {t("common.sar")} / {item.product.unit}</p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center bg-[#F9F5F0] border border-[#DDD0C0] rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-[#F0E8DE] text-[#3C2415] transition-colors"
                              disabled={item.quantity <= 1}
                              data-testid={`button-decrease-${item.product.id}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#1A0E08]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-[#F0E8DE] text-[#3C2415] transition-colors"
                              data-testid={`button-increase-${item.product.id}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-bold text-[#B8860B]">
                            {(Number(item.product.basePrice) * item.quantity).toFixed(2)} {t("common.sar")}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-[#DDD0C0]">
                <div className="flex justify-between mb-4 text-[#1A0E08]">
                  <span className="font-medium">{t("cart.subtotal")}</span>
                  <span className="font-bold text-xl">{getTotal().toFixed(2)} {t("common.sar")}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full block text-center btn-gold py-4 rounded-xl font-bold text-lg"
                  data-testid="link-checkout"
                >
                  {t("cart.checkout")}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
