import { Coffee, Instagram, Twitter, Mail } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n/i18nProvider";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto" style={{ backgroundColor: "var(--brown-900)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer" data-testid="link-footer-logo">
              <Coffee size={28} style={{ color: "var(--gold)" }} />
              <span className="font-bold text-2xl tracking-tight" style={{ color: "var(--gold)" }}>{t("brand")}</span>
            </Link>
            <p className="leading-relaxed text-sm" style={{ color: "var(--brown-300)" }}>
              {t("footer.description")}
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: "var(--brown-800)", color: "var(--brown-300)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--gold)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--brown-800)";
                  e.currentTarget.style.color = "var(--brown-300)";
                }}
                data-testid="link-instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: "var(--brown-800)", color: "var(--brown-300)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--gold)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--brown-800)";
                  e.currentTarget.style.color = "var(--brown-300)";
                }}
                data-testid="link-twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-5" style={{ color: "var(--brown-100)" }}>{t("footer.shopWithUs")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-products">{t("footer.allProducts")}</Link></li>
              <li><Link href="/products?category=coffee" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-coffee">{t("footer.specialtyCoffee")}</Link></li>
              <li><Link href="/products?category=tea" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-tea">{t("footer.premiumTea")}</Link></li>
              <li><Link href="/products?category=matcha" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-matcha">{t("footer.matcha")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-5" style={{ color: "var(--brown-100)" }}>{t("footer.aboutPlatform")}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-about">{t("footer.aboutUs")}</a></li>
              <li><a href="#" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-supplier">{t("footer.joinAsSupplier")}</a></li>
              <li><a href="#" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-terms">{t("footer.terms")}</a></li>
              <li><a href="#" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-privacy">{t("footer.privacy")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-5" style={{ color: "var(--brown-100)" }}>{t("footer.contactUs")}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} style={{ color: "var(--gold)" }} />
                <a href="mailto:hello@bdobeans.com" className="footer-link transition-colors duration-300" style={{ color: "var(--brown-300)" }} data-testid="link-footer-email">hello@bdobeans.com</a>
              </li>
              <li style={{ color: "var(--brown-300)" }}>{t("footer.location")}</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center text-sm" style={{ borderTopColor: "var(--brown-800)", borderTopWidth: "1px", color: "var(--brown-500)" }}>
          <p>{t("footer.rights", { year: String(new Date().getFullYear()) })}</p>
        </div>
      </div>
    </footer>
  );
}
