import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Package } from "lucide-react";
import { Link } from "wouter";

export default function SupplierProducts() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/supplier/products"],
    queryFn: async () => {
      const res = await authFetch("/api/supplier/products");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/products/${id}/toggle`);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary" data-testid="text-supplier-products-title">{t("supplier.products.title")}</h1>
        <Link href="/supplier/products/new" className="btn-gradient px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2" data-testid="link-add-product">
          <Plus size={18} /> {t("supplier.products.addProduct")}
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse border border-border/20"></div>)}</div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <Package size={48} className="text-primary/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-no-products">{t("supplier.products.noProducts")}</h3>
          <p className="text-muted-foreground">{t("supplier.products.noProductsDesc")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-muted/50 text-sm">
                <th className="px-4 py-3 text-start font-semibold">{t("supplier.products.name")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("supplier.products.basePrice")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("supplier.products.stock")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("supplier.products.status")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors" data-testid={`row-product-${product.id}`}>
                  <td className="px-4 py-3 font-medium">{locale === "ar" ? product.nameAr : product.nameEn}</td>
                  <td className="px-4 py-3">{Number(product.basePrice).toFixed(2)} {t("common.sar")}</td>
                  <td className="px-4 py-3">{product.stockQuantity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.isActive ? t("supplier.products.active") : t("supplier.products.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive.mutate(product.id)}
                      className="text-xs font-medium text-primary hover:underline"
                      data-testid={`button-toggle-${product.id}`}
                    >
                      {product.isActive ? t("supplier.products.deactivate") : t("supplier.products.activate")}
                    </button>
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
