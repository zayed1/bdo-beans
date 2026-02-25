import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, Wallet, UserCircle, Coffee, ArrowRight, ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/i18nProvider";

const navItems = [
  { key: "dashboard", path: "/supplier", icon: LayoutDashboard },
  { key: "products", path: "/supplier/products", icon: Package },
  { key: "orders", path: "/supplier/orders", icon: ShoppingCart },
  { key: "finances", path: "/supplier/finances", icon: Wallet },
  { key: "profile", path: "/supplier/profile", icon: UserCircle },
];

export function SupplierLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t, dir } = useI18n();
  const BackIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="flex flex-1 min-h-[80vh]">
      <aside className="w-64 bg-primary text-primary-foreground hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-secondary/50">
          <div className="flex items-center gap-2">
            <Coffee size={24} className="text-accent" />
            <span className="font-bold text-lg text-accent">{t("brand")}</span>
          </div>
          <p className="text-xs text-primary-foreground/60 mt-1">{t("nav.supplierDashboard")}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location === item.path || (item.path !== "/supplier" && location.startsWith(item.path));
            return (
              <Link key={item.key} href={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-accent text-primary font-bold shadow-sm' : 'text-primary-foreground/80 hover:bg-secondary/50'}`} data-testid={`link-supplier-${item.key}`}>
                <item.icon size={20} />
                {t(`supplier.sidebar.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-secondary/50">
          <Link href="/" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-accent transition-colors" data-testid="link-back-store">
            <BackIcon size={16} />
            {t("nav.home")}
          </Link>
        </div>
      </aside>

      <main className="flex-1 bg-background p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
