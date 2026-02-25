import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, Search, Globe, LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/use-cart";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/i18nProvider";

export function Navbar() {
  const [location] = useLocation();
  const cartItems = useCart((state) => state.items);
  const setIsCartOpen = useCart((state) => state.setIsOpen);
  const { data: user } = useUser();
  const logout = useLogout();
  const { t, locale, setLocale } = useI18n();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomepage = location === "/";
  const isTransparent = isHomepage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: "/", label: t("nav.home"), active: location === "/" },
    { href: "/products", label: t("nav.products"), active: location.startsWith("/products") },
    { href: "/products?category=coffee", label: t("nav.specialtyCoffee"), active: false },
    { href: "/products?category=matcha", label: t("nav.matcha"), active: false },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/90 backdrop-blur-xl shadow-warm"
        }`}
        style={{ height: 64 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="group cursor-pointer"
                data-testid="link-home-logo"
              >
                <span
                  className={`font-bold text-2xl tracking-tight transition-colors duration-300 ${
                    isTransparent
                      ? "text-white"
                      : "text-[#1A0E08]"
                  } group-hover:opacity-70`}
                >
                  {t("brand")}
                </span>
              </Link>

              <nav className="hidden md:flex gap-6 font-medium text-sm">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors duration-300 ${
                      isTransparent
                        ? link.active
                          ? "text-white font-bold"
                          : "text-white/80 hover:text-white"
                        : link.active
                          ? "text-[#1A0E08] font-bold"
                          : "text-[#5C3D2E] hover:text-[#1A0E08]"
                    }`}
                    data-testid={`link-nav-${link.href.replace(/[^a-z]/g, "") || "home"}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className={`p-2 rounded-full flex items-center gap-1 text-sm font-medium transition-colors duration-300 ${
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-[#5C3D2E] hover:text-[#1A0E08]"
                }`}
                data-testid="button-lang-switch"
              >
                <Globe size={18} />
                <span className="hidden sm:inline">
                  {locale === "ar" ? "EN" : "عربي"}
                </span>
              </button>

              <button
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-[#5C3D2E] hover:text-[#1A0E08]"
                }`}
                data-testid="button-search"
              >
                <Search size={20} />
              </button>

              {user ? (
                <div className="flex items-center gap-1">
                  {user.role === "SUPPLIER" && (
                    <Link
                      href="/supplier"
                      className={`text-xs font-medium hidden sm:inline transition-colors duration-300 ${
                        isTransparent
                          ? "text-[#D4A843] hover:text-white"
                          : "text-[#B8860B] hover:text-[#1A0E08]"
                      }`}
                      data-testid="link-supplier-dash"
                    >
                      {t("nav.supplierDashboard")}
                    </Link>
                  )}
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className={`text-xs font-medium hidden sm:inline transition-colors duration-300 ${
                        isTransparent
                          ? "text-[#D4A843] hover:text-white"
                          : "text-[#B8860B] hover:text-[#1A0E08]"
                      }`}
                      data-testid="link-admin-dash"
                    >
                      {t("nav.adminDashboard")}
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      isTransparent
                        ? "text-white/80 hover:text-white"
                        : "text-[#5C3D2E] hover:text-[#1A0E08]"
                    }`}
                    data-testid="link-my-orders"
                  >
                    <User size={20} />
                  </Link>
                  <button
                    onClick={() => logout.mutate()}
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      isTransparent
                        ? "text-white/80 hover:text-red-300"
                        : "text-[#5C3D2E] hover:text-destructive"
                    }`}
                    data-testid="button-logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isTransparent
                      ? "text-white/80 hover:text-white"
                      : "text-[#5C3D2E] hover:text-[#1A0E08]"
                  }`}
                  data-testid="link-auth"
                >
                  <User size={20} />
                </Link>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2 rounded-full relative transition-colors duration-300 ${
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-[#5C3D2E] hover:text-[#1A0E08]"
                }`}
                data-testid="button-cart"
              >
                <ShoppingBag size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-[#B8860B] text-white text-xs font-bold flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-full transition-colors duration-300 ${
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-[#5C3D2E] hover:text-[#1A0E08]"
                }`}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-menu-overlay"
            />
            <motion.div
              initial={{ x: locale === "ar" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: locale === "ar" ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 bottom-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-luxury md:hidden"
              style={locale === "ar" ? { right: 0 } : { left: 0 }}
              data-testid="mobile-menu-panel"
            >
              <div className="flex flex-col h-full p-6 pt-20">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`py-3 px-4 rounded-md text-base font-medium transition-colors duration-200 ${
                        link.active
                          ? "text-[#1A0E08] bg-[#F0E8DE]"
                          : "text-[#5C3D2E] hover:text-[#1A0E08] hover:bg-[#F9F5F0]"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-link-${link.href.replace(/[^a-z]/g, "") || "home"}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-[#DDD0C0] flex flex-col gap-1">
                  {user ? (
                    <>
                      {user.role === "SUPPLIER" && (
                        <Link
                          href="/supplier"
                          className="py-3 px-4 rounded-md text-sm font-medium text-[#B8860B] hover:bg-[#F5ECD7] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="mobile-link-supplier"
                        >
                          {t("nav.supplierDashboard")}
                        </Link>
                      )}
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="py-3 px-4 rounded-md text-sm font-medium text-[#B8860B] hover:bg-[#F5ECD7] transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="mobile-link-admin"
                        >
                          {t("nav.adminDashboard")}
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        className="py-3 px-4 rounded-md text-sm font-medium text-[#5C3D2E] hover:text-[#1A0E08] hover:bg-[#F9F5F0] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="mobile-link-orders"
                      >
                        {t("nav.orders") || "Orders"}
                      </Link>
                      <button
                        onClick={() => {
                          logout.mutate();
                          setMobileMenuOpen(false);
                        }}
                        className="py-3 px-4 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-start"
                        data-testid="mobile-button-logout"
                      >
                        {t("nav.logout") || "Logout"}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth"
                      className="py-3 px-4 rounded-md text-sm font-medium text-[#B8860B] hover:bg-[#F5ECD7] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-auth"
                    >
                      {t("nav.login") || "Login"}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
