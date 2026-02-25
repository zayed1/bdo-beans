import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18nProvider";
import { authFetch } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AdminSuppliers() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"PENDING" | "ALL">("PENDING");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["/api/admin/suppliers", tab],
    queryFn: async () => {
      const url = tab === "PENDING" ? "/api/admin/suppliers?status=PENDING" : "/api/admin/suppliers";
      const res = await authFetch(url);
      return res.json();
    },
  });

  const approve = useMutation({
    mutationFn: async (id: string) => { await apiRequest("POST", `/api/admin/suppliers/${id}/approve`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/suppliers"] }),
  });

  const reject = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiRequest("POST", `/api/admin/suppliers/${id}/reject`, { reason });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/suppliers"] }); setRejectId(null); setRejectReason(""); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6" data-testid="text-admin-suppliers-title">{t("admin.suppliers.title")}</h1>

      <div className="flex gap-2 mb-8">
        <button onClick={() => setTab("PENDING")} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${tab === "PENDING" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`} data-testid="button-tab-pending">{t("admin.suppliers.pending")}</button>
        <button onClick={() => setTab("ALL")} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${tab === "ALL" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`} data-testid="button-tab-all">{t("admin.suppliers.all")}</button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-24 bg-card rounded-xl animate-pulse border border-border/20"></div>)}</div>
      ) : !suppliers || suppliers.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground" data-testid="text-no-pending">{t("admin.suppliers.noPending")}</p>
      ) : (
        <div className="space-y-4">
          {suppliers.map((s: any) => (
            <div key={s.id} className="bg-card rounded-xl p-6 border border-border/50 shadow-sm" data-testid={`card-supplier-${s.id}`}>
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{locale === "ar" ? s.businessNameAr : s.businessName}</h3>
                  <p className="text-sm text-muted-foreground">{s.user?.email}</p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>{t("admin.suppliers.iban")}: <span className="font-mono">{s.iban}</span></p>
                    {s.taxNumber && <p>{t("admin.suppliers.taxNumber")}: {s.taxNumber}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    s.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    s.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {s.status}
                  </span>
                  {s.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve.mutate(s.id)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700" data-testid={`button-approve-${s.id}`}>
                        <CheckCircle2 size={16} /> {t("admin.suppliers.approve")}
                      </button>
                      <button onClick={() => setRejectId(s.id)} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700" data-testid={`button-reject-${s.id}`}>
                        <XCircle size={16} /> {t("admin.suppliers.reject")}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {rejectId === s.id && (
                <div className="mt-4 flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">{t("admin.suppliers.rejectionReason")}</label>
                    <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm" data-testid={`input-reject-reason-${s.id}`} />
                  </div>
                  <button onClick={() => reject.mutate({ id: s.id, reason: rejectReason })} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold" data-testid={`button-confirm-reject-${s.id}`}>{t("common.confirm")}</button>
                  <button onClick={() => setRejectId(null)} className="px-4 py-2 rounded-lg text-sm border border-border">{t("common.cancel")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
