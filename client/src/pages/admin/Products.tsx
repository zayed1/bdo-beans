import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";

export default function AdminProducts() {
  const { t, locale } = useI18n();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: async () => { const res = await authFetch("/api/admin/products"); return res.json(); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-admin-products-title">{t("admin.products.title")}</h1>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse border border-border/20"></div>)}</div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50">
                <th className="px-4 py-3 text-start font-semibold">{t("admin.products.name")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.products.supplier")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.products.category")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.products.price")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.products.stock")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("admin.products.status")}</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product: any) => (
                <tr key={product.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors" data-testid={`row-admin-product-${product.id}`}>
                  <td className="px-4 py-3 font-medium">{locale === "ar" ? product.nameAr : product.nameEn}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.supplier ? (locale === "ar" ? product.supplier.businessNameAr : product.supplier.businessName) : "---"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.category ? (locale === "ar" ? product.category.nameAr : product.category.nameEn) : "---"}</td>
                  <td className="px-4 py-3">{Number(product.basePrice).toFixed(2)} {t("common.sar")}</td>
                  <td className="px-4 py-3">{product.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.isActive ? t("supplier.products.active") : t("supplier.products.inactive")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
