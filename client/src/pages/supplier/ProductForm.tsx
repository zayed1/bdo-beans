import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Plus, X } from "lucide-react";

export default function SupplierProductForm() {
  const { t, locale } = useI18n();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => { const res = await fetch("/api/categories"); return res.json(); },
  });

  const [form, setForm] = useState({
    nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
    categoryId: "", basePrice: "", unit: "KG", stockQuantity: "1", minOrderQuantity: "1", isActive: true,
  });

  const [attributes, setAttributes] = useState([
    { attributeKey: "processing_method", attributeValueEn: "", attributeValueAr: "" },
    { attributeKey: "roast_level", attributeValueEn: "", attributeValueAr: "" },
    { attributeKey: "origin_country", attributeValueEn: "", attributeValueAr: "" },
    { attributeKey: "brew_method", attributeValueEn: "", attributeValueAr: "" },
  ]);

  const [zones, setZones] = useState([{ zoneNameEn: "", zoneNameAr: "", shippingCost: "", estimatedDays: "", allowsCod: true }]);
  const [tiers, setTiers] = useState([{ minQuantity: "", maxQuantity: "", pricePerUnit: "" }]);

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      setLocation("/supplier/products");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      ...form,
      basePrice: form.basePrice,
      stockQuantity: parseInt(form.stockQuantity),
      minOrderQuantity: parseInt(form.minOrderQuantity),
      categoryId: form.categoryId || null,
      attributes: attributes.filter(a => a.attributeValueEn),
      shippingZones: zones.filter(z => z.zoneNameEn && z.shippingCost).map(z => ({ ...z, shippingCost: z.shippingCost, estimatedDays: parseInt(z.estimatedDays) || null })),
      priceTiers: tiers.filter(t => t.minQuantity && t.pricePerUnit).map(t => ({ minQuantity: parseInt(t.minQuantity), maxQuantity: t.maxQuantity ? parseInt(t.maxQuantity) : null, pricePerUnit: t.pricePerUnit })),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-product-form-title">{t("supplier.products.addProduct")}</h1>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.nameAr")}</label>
              <input type="text" required value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" data-testid="input-product-name-ar" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.nameEn")}</label>
              <input type="text" required value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" dir="ltr" data-testid="input-product-name-en" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.descAr")}</label>
              <textarea value={form.descriptionAr} onChange={e => setForm(f => ({ ...f, descriptionAr: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none" rows={3} data-testid="input-product-desc-ar" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.descEn")}</label>
              <textarea value={form.descriptionEn} onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none" rows={3} dir="ltr" data-testid="input-product-desc-en" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.category")}</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" data-testid="select-category">
                <option value="">---</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{locale === "ar" ? c.nameAr : c.nameEn}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.basePrice")}</label>
              <input type="number" step="0.01" required value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" dir="ltr" data-testid="input-base-price" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.unit")}</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" data-testid="select-unit">
                <option value="KG">{t("common.kg")}</option>
                <option value="G">{t("common.g")}</option>
                <option value="PACK">{t("common.pack")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">{t("supplier.products.stock")}</label>
              <input type="number" required value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" dir="ltr" data-testid="input-stock" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="font-bold text-foreground mb-4">{t("supplier.products.attributes")}</h3>
          <div className="space-y-3">
            {attributes.map((attr, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <input value={attr.attributeKey} disabled className="px-3 py-2 rounded-lg bg-muted border border-border text-sm" />
                <input value={attr.attributeValueEn} onChange={e => { const a = [...attributes]; a[i].attributeValueEn = e.target.value; setAttributes(a); }} placeholder="English" className="px-3 py-2 rounded-lg bg-background border border-border text-sm" dir="ltr" data-testid={`input-attr-en-${i}`} />
                <input value={attr.attributeValueAr} onChange={e => { const a = [...attributes]; a[i].attributeValueAr = e.target.value; setAttributes(a); }} placeholder="عربي" className="px-3 py-2 rounded-lg bg-background border border-border text-sm" data-testid={`input-attr-ar-${i}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-foreground">{t("supplier.products.shippingZones")}</h3>
            <button type="button" onClick={() => setZones([...zones, { zoneNameEn: "", zoneNameAr: "", shippingCost: "", estimatedDays: "", allowsCod: true }])} className="text-accent text-sm font-bold flex items-center gap-1" data-testid="button-add-zone">
              <Plus size={16} /> {t("supplier.products.addZone")}
            </button>
          </div>
          {zones.map((zone, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 mb-3 items-end">
              <input value={zone.zoneNameAr} onChange={e => { const z = [...zones]; z[i].zoneNameAr = e.target.value; setZones(z); }} placeholder={t("supplier.products.zoneName")} className="px-3 py-2 rounded-lg bg-background border border-border text-sm" data-testid={`input-zone-name-ar-${i}`} />
              <input value={zone.zoneNameEn} onChange={e => { const z = [...zones]; z[i].zoneNameEn = e.target.value; setZones(z); }} placeholder="Zone name EN" className="px-3 py-2 rounded-lg bg-background border border-border text-sm" dir="ltr" data-testid={`input-zone-name-en-${i}`} />
              <input type="number" step="0.01" value={zone.shippingCost} onChange={e => { const z = [...zones]; z[i].shippingCost = e.target.value; setZones(z); }} placeholder={t("supplier.products.shippingCost")} className="px-3 py-2 rounded-lg bg-background border border-border text-sm" dir="ltr" data-testid={`input-zone-cost-${i}`} />
              <input type="number" value={zone.estimatedDays} onChange={e => { const z = [...zones]; z[i].estimatedDays = e.target.value; setZones(z); }} placeholder={t("supplier.products.estimatedDays")} className="px-3 py-2 rounded-lg bg-background border border-border text-sm" dir="ltr" data-testid={`input-zone-days-${i}`} />
              <div className="flex items-center gap-2">
                <label className="text-xs flex items-center gap-1">
                  <input type="checkbox" checked={zone.allowsCod} onChange={e => { const z = [...zones]; z[i].allowsCod = e.target.checked; setZones(z); }} data-testid={`checkbox-zone-cod-${i}`} />
                  COD
                </label>
                {zones.length > 1 && <button type="button" onClick={() => setZones(zones.filter((_, j) => j !== i))} className="text-destructive"><X size={16} /></button>}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-foreground">{t("supplier.products.priceTiers")}</h3>
            <button type="button" onClick={() => setTiers([...tiers, { minQuantity: "", maxQuantity: "", pricePerUnit: "" }])} className="text-accent text-sm font-bold flex items-center gap-1" data-testid="button-add-tier">
              <Plus size={16} /> {t("supplier.products.addTier")}
            </button>
          </div>
          {tiers.map((tier, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 mb-3 items-end">
              <input type="number" value={tier.minQuantity} onChange={e => { const t = [...tiers]; t[i].minQuantity = e.target.value; setTiers(t); }} placeholder={t("supplier.products.minQty")} className="px-3 py-2 rounded-lg bg-background border border-border text-sm" dir="ltr" data-testid={`input-tier-min-${i}`} />
              <input type="number" value={tier.maxQuantity} onChange={e => { const t = [...tiers]; t[i].maxQuantity = e.target.value; setTiers(t); }} placeholder={t("supplier.products.maxQty")} className="px-3 py-2 rounded-lg bg-background border border-border text-sm" dir="ltr" data-testid={`input-tier-max-${i}`} />
              <input type="number" step="0.01" value={tier.pricePerUnit} onChange={e => { const t = [...tiers]; t[i].pricePerUnit = e.target.value; setTiers(t); }} placeholder={t("supplier.products.pricePerUnit")} className="px-3 py-2 rounded-lg bg-background border border-border text-sm" dir="ltr" data-testid={`input-tier-price-${i}`} />
              {tiers.length > 1 && <button type="button" onClick={() => setTiers(tiers.filter((_, j) => j !== i))} className="text-destructive p-2"><X size={16} /></button>}
            </div>
          ))}
        </div>

        <button type="submit" disabled={createProduct.isPending} className="btn-gradient px-8 py-3 rounded-xl font-bold text-lg w-full" data-testid="button-save-product">
          {createProduct.isPending ? t("common.loading") : t("supplier.products.save")}
        </button>
      </form>
    </div>
  );
}
