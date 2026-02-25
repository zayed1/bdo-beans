import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Coffee, Leaf, Zap, ShieldCheck, Truck } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ui/ProductCard";
import { useI18n } from "@/i18n/i18nProvider";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { motion } from "framer-motion";

export default function Home() {
  const { t, locale, dir } = useI18n();
  const { data, isLoading } = useProducts({ limit: 4 });
  const featuredProducts = data?.products || [];

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="flex flex-col w-full">
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden -mt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1920&h=1080&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A0E08]/90 via-[#1A0E08]/75 to-[#1A0E08]/90"></div>
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block py-1.5 px-5 rounded-full bg-white/10 border border-white/20 text-[#D4A843] font-semibold text-sm mb-8 backdrop-blur-md"
            data-testid="text-hero-badge"
          >
            {t("hero.badge")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
            data-testid="text-hero-title"
          >
            {t("hero.title1")} <br />
            <span className="text-[#D4A843]">{t("hero.title2")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed max-w-xl mx-auto"
            data-testid="text-hero-desc"
          >
            {t("hero.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/products"
              className="btn-gold px-10 py-4 rounded-full font-bold text-lg inline-flex items-center justify-center min-w-[220px]"
              data-testid="link-browse-products"
            >
              {t("hero.browseProducts")}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brown-950 mb-3" style={{ letterSpacing: '-0.01em' }} data-testid="text-categories-title">{t("categories.title")}</h2>
              <p className="text-brown-500 text-lg max-w-lg mx-auto">{t("categories.subtitle")}</p>
            </div>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StaggerItem>
              <Link href="/products?category=coffee" className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer block" data-testid="link-category-coffee">
                <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=400&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Coffee" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E08]/90 via-[#1A0E08]/30 to-transparent"></div>
                <div className="absolute bottom-6 right-6 text-white">
                  <Coffee size={28} className="text-[#D4A843] mb-3" />
                  <h3 className="text-2xl font-bold mb-1">{t("categories.coffee")}</h3>
                  <p className="text-white/70 text-sm">{t("categories.coffeeDesc")}</p>
                </div>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/products?category=matcha" className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer block" data-testid="link-category-matcha">
                <img src="https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Matcha" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E08]/90 via-[#1A0E08]/30 to-transparent"></div>
                <div className="absolute bottom-6 right-6 text-white">
                  <Leaf size={28} className="text-[#2D6A4F] mb-3" />
                  <h3 className="text-2xl font-bold mb-1">{t("categories.matcha")}</h3>
                  <p className="text-white/70 text-sm">{t("categories.matchaDesc")}</p>
                </div>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/products?category=tea" className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer block" data-testid="link-category-tea">
                <img src="https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=600&h=400&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Tea" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E08]/90 via-[#1A0E08]/30 to-transparent"></div>
                <div className="absolute bottom-6 right-6 text-white">
                  <Zap size={28} className="text-[#D4A843] mb-3" />
                  <h3 className="text-2xl font-bold mb-1">{t("categories.tea")}</h3>
                  <p className="text-white/70 text-sm">{t("categories.teaDesc")}</p>
                </div>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="flex justify-between items-center mb-12 md:mb-16">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brown-950" style={{ letterSpacing: '-0.01em' }} data-testid="text-featured-title">{t("featured.title")}</h2>
              </div>
              <Link href="/products" className="text-gold font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm" data-testid="link-view-all">
                {t("featured.viewAll")} <ArrowIcon size={16} />
              </Link>
            </div>
          </FadeUp>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl h-[380px] animate-pulse shadow-warm"></div>
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#1A0E08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4A843] mb-16" style={{ letterSpacing: '-0.01em' }} data-testid="text-whyus-title">{t("whyUs.title")}</h2>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <StaggerItem>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <ShieldCheck size={32} className="text-[#D4A843]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t("whyUs.quality")}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{t("whyUs.qualityDesc")}</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Coffee size={32} className="text-[#D4A843]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t("whyUs.variety")}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{t("whyUs.varietyDesc")}</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Truck size={32} className="text-[#D4A843]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t("whyUs.delivery")}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{t("whyUs.deliveryDesc")}</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
