import { useParams } from "wouter";
import { useState, useMemo } from "react";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/store/use-cart";
import { ShoppingBag, Star, ShieldCheck, ChevronRight, ChevronLeft, Minus, Plus, Truck, Banknote, Check } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n/i18nProvider";
import { FadeUp, FadeIn } from "@/components/ui/motion";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id!);
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { t, locale, dir } = useI18n();

  const ChevIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (product.priceTiers && product.priceTiers.length > 0) {
      const sorted = [...product.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);
      for (const tier of sorted) {
        if (quantity >= tier.minQuantity && (tier.maxQuantity === null || quantity <= tier.maxQuantity)) {
          return Number(tier.pricePerUnit);
        }
      }
    }
    return Number(product.basePrice);
  }, [product, quantity]);

  const hasCod = product?.shippingZones?.some(z => z.allowsCod) || false;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse">
        <div className="h-6 bg-[#F0E8DE] w-32 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-[#F0E8DE] rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-10 bg-[#F0E8DE] w-3/4 rounded"></div>
            <div className="h-6 bg-[#F0E8DE] w-1/4 rounded"></div>
            <div className="h-32 bg-[#F0E8DE] w-full rounded mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2" data-testid="text-product-not-found">{t("productDetail.notFound")}</h2>
        <Link href="/products" className="text-[#B8860B] hover:underline" data-testid="link-back-to-store">{t("productDetail.backToStore")}</Link>
      </div>
    );
  }

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? (product.descriptionAr || t("productDetail.defaultDescription")) : (product.descriptionEn || t("productDetail.defaultDescription"));
  const categoryName = product.category ? (locale === "ar" ? product.category.nameAr : product.category.nameEn) : "";
  const supplierName = product.supplier ? (locale === "ar" ? product.supplier.businessNameAr : product.supplier.businessName) : "";

  const getAttrValue = (key: string) => {
    const attr = product.attributes?.find(a => a.attributeKey === key);
    if (!attr) return null;
    return locale === "ar" ? attr.attributeValueAr : attr.attributeValueEn;
  };

  return (
    <FadeUp className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center gap-2 text-sm text-[#8B6954] mb-8" data-testid="breadcrumb">
        <Link href="/" className="hover:text-[#1A0E08] transition-colors">{t("productDetail.home")}</Link>
        <ChevIcon size={14} />
        <Link href="/products" className="hover:text-[#1A0E08] transition-colors">{t("productDetail.products")}</Link>
        <ChevIcon size={14} />
        <span className="text-[#1A0E08] font-medium truncate">{name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <FadeIn>
          <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-warm">
            <img
              src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800&h=800&fit=crop"
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </FadeIn>

        <div className="flex flex-col">
          {categoryName && (
            <div className="mb-2 text-[#B8860B] font-semibold text-sm tracking-widest uppercase">{categoryName}</div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A0E08] mb-4 leading-tight" style={{ letterSpacing: '-0.01em' }} data-testid="text-product-name">{name}</h1>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#DDD0C0] flex-wrap">
            <div className="flex items-center text-[#B8860B]">
              <Star size={18} className="fill-current" />
              <span className="font-bold ms-1.5 text-[#1A0E08]">4.8</span>
              <span className="text-[#8B6954] ms-1 font-normal">(124 {t("productDetail.reviews")})</span>
            </div>
            {supplierName && (
              <>
                <div className="w-1 h-1 rounded-full bg-[#DDD0C0]"></div>
                <div className="flex items-center text-[#5C3D2E]">
                  <ShieldCheck size={18} className="me-1.5" />
                  <span className="font-medium text-sm">{t("productDetail.verifiedSupplier")}</span>
                </div>
              </>
            )}
            {hasCod && (
              <>
                <div className="w-1 h-1 rounded-full bg-[#DDD0C0]"></div>
                <div className="flex items-center text-[#2D6A4F] bg-[#2D6A4F]/10 px-3 py-1 rounded-full text-xs font-semibold">
                  <Banknote size={14} className="me-1" />
                  {t("productDetail.codAvailable")}
                </div>
              </>
            )}
          </div>

          <div className="text-3xl font-bold text-[#1A0E08] mb-2" data-testid="text-product-price">
            {currentPrice.toFixed(2)} <span className="text-lg font-medium text-[#8B6954]">{t("productDetail.perUnit", { unit: product.unit })}</span>
          </div>
          {product.priceTiers && product.priceTiers.length > 0 && currentPrice < Number(product.basePrice) && (
            <p className="text-sm text-[#2D6A4F] font-medium mb-6">{t("products.basePrice")}: <span className="line-through">{Number(product.basePrice).toFixed(2)}</span> {t("common.sar")}</p>
          )}

          <p className="text-[#5C3D2E] leading-relaxed mb-8">{description}</p>

          {product.attributes && product.attributes.length > 0 && (
            <div className="mb-6 pb-6 border-b border-[#DDD0C0]">
              <h3 className="font-bold text-[#1A0E08] mb-3">{t("productDetail.attributes")}</h3>
              <div className="grid grid-cols-2 gap-3">
                {getAttrValue("processing_method") && (
                  <div className="bg-[#F9F5F0] p-3 rounded-xl">
                    <span className="text-xs text-[#8B6954]">{t("productDetail.processingMethod")}</span>
                    <p className="font-semibold text-sm text-[#1A0E08]">{getAttrValue("processing_method")}</p>
                  </div>
                )}
                {getAttrValue("roast_level") && (
                  <div className="bg-[#F9F5F0] p-3 rounded-xl">
                    <span className="text-xs text-[#8B6954]">{t("productDetail.roastLevel")}</span>
                    <p className="font-semibold text-sm text-[#1A0E08]">{getAttrValue("roast_level")}</p>
                  </div>
                )}
                {getAttrValue("origin_country") && (
                  <div className="bg-[#F9F5F0] p-3 rounded-xl">
                    <span className="text-xs text-[#8B6954]">{t("productDetail.originCountry")}</span>
                    <p className="font-semibold text-sm text-[#1A0E08]">{getAttrValue("origin_country")}</p>
                  </div>
                )}
                {getAttrValue("brew_method") && (
                  <div className="bg-[#F9F5F0] p-3 rounded-xl">
                    <span className="text-xs text-[#8B6954]">{t("productDetail.brewMethod")}</span>
                    <p className="font-semibold text-sm text-[#1A0E08]">{getAttrValue("brew_method")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {product.priceTiers && product.priceTiers.length > 0 && (
            <div className="mb-6 pb-6 border-b border-[#DDD0C0]">
              <h3 className="font-bold text-[#1A0E08] mb-3">{t("productDetail.priceTiers")}</h3>
              <div className="bg-white rounded-xl shadow-warm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F0E8DE]">
                      <th className="px-4 py-3 text-start font-semibold text-[#5C3D2E]">{t("productDetail.tierQty")}</th>
                      <th className="px-4 py-3 text-start font-semibold text-[#5C3D2E]">{t("productDetail.tierPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...product.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity).map((tier, i) => (
                      <tr key={i} className={`border-b border-[#F0E8DE] last:border-0 ${quantity >= tier.minQuantity && (tier.maxQuantity === null || quantity <= tier.maxQuantity) ? 'bg-[#F5ECD7]' : 'hover:bg-[#F9F5F0]'}`}>
                        <td className="px-4 py-2.5 text-[#5C3D2E]">
                          {tier.maxQuantity ? t("productDetail.tierRange", { min: String(tier.minQuantity), max: String(tier.maxQuantity) }) : t("productDetail.tierFrom", { min: String(tier.minQuantity) })}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-[#1A0E08]">{Number(tier.pricePerUnit).toFixed(2)} {t("common.sar")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {product.shippingZones && product.shippingZones.length > 0 && (
            <div className="mb-6 pb-6 border-b border-[#DDD0C0]">
              <h3 className="font-bold text-[#1A0E08] mb-3">{t("productDetail.shippingZones")}</h3>
              <div className="bg-white rounded-xl shadow-warm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F0E8DE]">
                      <th className="px-4 py-3 text-start font-semibold text-[#5C3D2E]">{t("productDetail.zone")}</th>
                      <th className="px-4 py-3 text-start font-semibold text-[#5C3D2E]">{t("productDetail.cost")}</th>
                      <th className="px-4 py-3 text-start font-semibold text-[#5C3D2E]">{t("productDetail.estimatedDays")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.shippingZones.map((zone, i) => (
                      <tr key={i} className="border-b border-[#F0E8DE] last:border-0 hover:bg-[#F9F5F0]">
                        <td className="px-4 py-2.5 text-[#5C3D2E]">{locale === "ar" ? zone.zoneNameAr : zone.zoneNameEn}</td>
                        <td className="px-4 py-2.5 text-[#1A0E08]">{Number(zone.shippingCost).toFixed(2)} {t("common.sar")}</td>
                        <td className="px-4 py-2.5 text-[#5C3D2E]">{zone.estimatedDays} {t("productDetail.days")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#1A0E08]">{t("productDetail.quantity")}</span>
              <div className="flex items-center bg-white border border-[#DDD0C0] rounded-xl p-1 shadow-warm">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrderQuantity, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#3C2415] hover:bg-[#F0E8DE] rounded-lg transition-colors"
                  data-testid="button-qty-decrease"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-lg text-[#1A0E08]" data-testid="text-quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#3C2415] hover:bg-[#F0E8DE] rounded-lg transition-colors"
                  data-testid="button-qty-increase"
                >
                  <Plus size={18} />
                </button>
              </div>
              <span className="font-bold text-[#B8860B] text-lg" data-testid="text-total-price">
                {(currentPrice * quantity).toFixed(2)} {t("common.sar")}
              </span>
            </div>

            <motion.button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                addedToCart
                  ? "bg-[#2D6A4F] text-white"
                  : "btn-gold"
              }`}
              data-testid="button-add-to-cart"
            >
              <AnimatePresence mode="wait">
                {addedToCart ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={24} /> {t("productDetail.addedToCart") || t("productDetail.addToCartBtn")}
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag size={24} />
                    {product.stockQuantity === 0 ? t("productDetail.outOfStock") : t("productDetail.addToCartBtn")}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-[#DDD0C0]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F0E8DE] text-[#3C2415] flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A0E08]">{t("productDetail.qualityGuarantee")}</h4>
                <p className="text-xs text-[#8B6954] mt-1">{t("productDetail.qualityGuaranteeDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F0E8DE] text-[#3C2415] flex items-center justify-center flex-shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A0E08]">{t("productDetail.cooledDelivery")}</h4>
                <p className="text-xs text-[#8B6954] mt-1">{t("productDetail.cooledDeliveryDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
