import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Coffee } from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/i18n/i18nProvider";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"BUYER" | "SUPPLIER">("BUYER");
  const [businessName, setBusinessName] = useState("");
  const [businessNameAr, setBusinessNameAr] = useState("");
  const [iban, setIban] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [error, setError] = useState("");
  const { t } = useI18n();

  const login = useLogin();
  const register = useRegister();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      login.mutate({ email, password }, {
        onSuccess: (data: any) => {
          if (data.role === 'SUPPLIER' && data.supplierProfile?.status === 'PENDING') {
            setError("");
          } else {
            setLocation("/");
          }
        },
        onError: (err) => setError(err.message)
      });
    } else {
      const payload: any = { email, password, name, role };
      if (role === 'SUPPLIER') {
        payload.businessName = businessName;
        payload.businessNameAr = businessNameAr;
        payload.iban = iban;
        payload.taxNumber = taxNumber || undefined;
      }
      register.mutate(payload, {
        onSuccess: (data: any) => {
          if (data.role === 'SUPPLIER') {
            setError("");
          } else {
            setLocation("/");
          }
        },
        onError: (err) => setError(err.message)
      });
    }
  };

  return (
    <div className="flex-1 flex min-h-[80vh]">
      <div className="hidden lg:flex w-1/2 bg-[#1A0E08] relative overflow-hidden items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=800&fit=crop"
          alt="Coffee Aesthetic"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-5xl font-bold mb-4 font-sans" style={{ letterSpacing: '-0.02em' }} data-testid="text-auth-brand">{t("brand")}</h1>
          <p className="text-xl text-white/60 leading-relaxed max-w-md mx-auto">{t("auth.brandDescription")}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F9F5F0]">
        <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-2xl shadow-warm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1A0E08] mb-2" style={{ letterSpacing: '-0.01em' }} data-testid="text-auth-heading">
              {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm font-medium text-center" data-testid="text-auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">{t("auth.fullName")}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-[#1A0E08]"
                    placeholder={t("auth.namePlaceholder")}
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">{t("auth.accountType")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("BUYER")}
                      className={`py-3 rounded-xl font-bold border-2 transition-all ${role === 'BUYER' ? 'border-[#B8860B] bg-[#F5ECD7] text-[#B8860B]' : 'border-[#DDD0C0] text-[#8B6954]'}`}
                      data-testid="button-role-buyer"
                    >
                      {t("auth.buyer")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("SUPPLIER")}
                      className={`py-3 rounded-xl font-bold border-2 transition-all ${role === 'SUPPLIER' ? 'border-[#B8860B] bg-[#F5ECD7] text-[#B8860B]' : 'border-[#DDD0C0] text-[#8B6954]'}`}
                      data-testid="button-role-supplier"
                    >
                      {t("auth.supplier")}
                    </button>
                  </div>
                </div>

                {role === 'SUPPLIER' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">{t("auth.businessNameEn")}</label>
                      <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-[#1A0E08]" dir="ltr" data-testid="input-business-name-en" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">{t("auth.businessNameAr")}</label>
                      <input type="text" required value={businessNameAr} onChange={e => setBusinessNameAr(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-[#1A0E08]" data-testid="input-business-name-ar" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">{t("auth.iban")}</label>
                      <input type="text" required value={iban} onChange={e => setIban(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-[#1A0E08]" dir="ltr" data-testid="input-iban" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">{t("auth.taxNumber")}</label>
                      <input type="text" value={taxNumber} onChange={e => setTaxNumber(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-[#1A0E08]" dir="ltr" data-testid="input-tax-number" />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">{t("auth.email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-[#1A0E08] text-left"
                dir="ltr"
                placeholder="email@example.com"
                data-testid="input-email"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">{t("auth.password")}</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#F9F5F0] border border-[#DDD0C0] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 outline-none transition-all text-[#1A0E08] text-left"
                dir="ltr"
                data-testid="input-password"
              />
            </div>

            <button
              type="submit"
              disabled={login.isPending || register.isPending}
              className="w-full btn-gradient py-4 rounded-xl font-bold text-lg mt-8"
              data-testid="button-auth-submit"
            >
              {login.isPending || register.isPending ? t("auth.processingBtn") : (isLogin ? t("auth.loginBtn") : t("auth.registerBtn"))}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-primary hover:text-accent font-semibold transition-colors"
              data-testid="button-toggle-auth"
            >
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
