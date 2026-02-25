import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function SupplierProfile() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/supplier/profile"],
    queryFn: async () => { const res = await authFetch("/api/supplier/profile"); return res.json(); },
  });

  const [form, setForm] = useState({ businessName: "", businessNameAr: "", description: "", descriptionAr: "", iban: "", taxNumber: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName || "",
        businessNameAr: profile.businessNameAr || "",
        description: profile.description || "",
        descriptionAr: profile.descriptionAr || "",
        iban: profile.iban || "",
        taxNumber: profile.taxNumber || "",
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/supplier/profile", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/supplier/profile"] }),
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-card rounded-2xl"></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-8" data-testid="text-supplier-profile-title">{t("supplier.profile.title")}</h1>
      <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(form); }} className="max-w-2xl space-y-6">
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">{t("supplier.profile.businessNameAr")}</label>
            <input value={form.businessNameAr} onChange={e => setForm(f => ({ ...f, businessNameAr: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" data-testid="input-profile-name-ar" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">{t("supplier.profile.businessNameEn")}</label>
            <input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" dir="ltr" data-testid="input-profile-name-en" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">{t("supplier.profile.iban")}</label>
            <input value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" dir="ltr" data-testid="input-profile-iban" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">{t("supplier.profile.taxNumber")}</label>
            <input value={form.taxNumber} onChange={e => setForm(f => ({ ...f, taxNumber: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" dir="ltr" data-testid="input-profile-tax" />
          </div>
        </div>
        <button type="submit" disabled={updateProfile.isPending} className="btn-gradient px-8 py-3 rounded-xl font-bold" data-testid="button-save-profile">
          {updateProfile.isPending ? t("common.loading") : t("supplier.profile.save")}
        </button>
      </form>
    </div>
  );
}
