import { ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";
import type { ProductWithDetails } from "@shared/schema";
import { useCart } from "@/store/use-cart";
import { useI18n } from "@/i18n/i18nProvider";
import { motion } from "framer-motion";

export function ProductCard({ product }: { product: ProductWithDetails }) {
  const addItem = useCart((state) => state.addItem);
  const { t, locale } = useI18n();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const categoryName = product.category
    ? (locale === "ar" ? product.category.nameAr : product.category.nameEn)
    : "";
  const supplierName = product.supplier
    ? (locale === "ar" ? product.supplier.businessNameAr : product.supplier.businessName)
    : t("products.supplierPartner");

  return (
    <Link href={`/products/${product.id}`} className="group block h-full" data-testid={`card-product-${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(26,14,8,0.06)] hover:shadow-[0_20px_60px_rgba(26,14,8,0.12)] transition-shadow duration-500 h-full flex flex-col overflow-hidden"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=600&h=600&fit=crop"
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {product.stockQuantity < 5 && product.stockQuantity > 0 && (
            <span className="absolute top-3 right-3 bg-destructive/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm" data-testid={`badge-limited-${product.id}`}>
              {t("products.limitedStock")}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col p-5">
          <span className="text-xs font-semibold text-[#B8860B] uppercase tracking-wider mb-2">
            {categoryName}
          </span>

          <h3 className="font-semibold text-[#1A0E08] text-lg mb-1 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
            {name}
          </h3>

          <p className="text-xs text-[#8B6954] mb-4">
            {supplierName}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#B8860B]">{Number(product.basePrice).toFixed(2)} {t("common.sar")}</span>
            </div>

            <button
              onClick={handleAddToCart}
              className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out bg-[#B8860B] text-white rounded-full px-4 min-h-9 flex items-center gap-1.5 text-sm font-medium hover:bg-[#D4A843] active:scale-95"
              aria-label={t("products.addToCart")}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart size={16} />
              <span>{t("products.addToCart")}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
