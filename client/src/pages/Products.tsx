import { useState } from "react";
import { useProducts, type ProductFilters } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { ProductCard } from "@/components/ui/ProductCard";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/i18n/i18nProvider";
import { useSearch } from "wouter";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const { t, locale } = useI18n();
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(urlParams.get("category") || "");
  const [processingFilters, setProcessingFilters] = useState<string[]>([]);
  const [roastFilters, setRoastFilters] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  const categoryId = activeCategory
    ? categories.find(c => c.slug === activeCategory)?.id
    : undefined;

  const filters: ProductFilters = {
    search: search || undefined,
    categoryId,
    processing: processingFilters.length ? processingFilters : undefined,
    roast: roastFilters.length ? roastFilters : undefined,
    inStock,
    sort,
  };

  const { data, isLoading } = useProducts(filters);
  const products = data?.products || [];
  const total = data?.total || 0;

  const toggleFilter = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const FilterSidebar = () => (
    <div className="bg-white rounded-2xl p-6 shadow-warm sticky top-24">
      <div className="flex items-center gap-2 mb-6 text-[#1A0E08]">
        <Filter size={20} />
        <h2 className="text-lg font-bold">{t("products.filters")}</h2>
      </div>

      <ul className="space-y-1 mb-6">
        <li>
          <button
            onClick={() => setActiveCategory("")}
            className={`w-full text-start px-4 py-2.5 rounded-xl transition-all duration-200 text-sm ${!activeCategory ? "bg-[#3C2415] text-white font-semibold" : "text-[#5C3D2E] hover:bg-[#F0E8DE]"}`}
            data-testid="button-filter-all"
          >
            {t("products.all")}
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => setActiveCategory(cat.slug)}
              className={`w-full text-start px-4 py-2.5 rounded-xl transition-all duration-200 text-sm ${activeCategory === cat.slug ? "bg-[#3C2415] text-white font-semibold" : "text-[#5C3D2E] hover:bg-[#F0E8DE]"}`}
              data-testid={`button-filter-cat-${cat.slug}`}
            >
              {locale === "ar" ? cat.nameAr : cat.nameEn}
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-[#DDD0C0] pt-6 mb-6">
        <h3 className="font-bold text-[#1A0E08] mb-4 text-sm">{t("products.processing")}</h3>
        <div className="space-y-2.5">
          {[{ value: "natural", label: t("products.natural") }, { value: "washed", label: t("products.washed") }, { value: "honey", label: t("products.honey") }].map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-sm text-[#5C3D2E]">
              <input
                type="checkbox"
                checked={processingFilters.includes(opt.value)}
                onChange={() => toggleFilter(processingFilters, setProcessingFilters, opt.value)}
                className="rounded border-[#DDD0C0] text-[#B8860B] focus:ring-[#B8860B]"
                data-testid={`checkbox-processing-${opt.value}`}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#DDD0C0] pt-6 mb-6">
        <h3 className="font-bold text-[#1A0E08] mb-4 text-sm">{t("products.roastLevel")}</h3>
        <div className="space-y-2.5">
          {[{ value: "light", label: t("products.light") }, { value: "medium", label: t("products.medium") }, { value: "dark", label: t("products.dark") }].map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-sm text-[#5C3D2E]">
              <input
                type="checkbox"
                checked={roastFilters.includes(opt.value)}
                onChange={() => toggleFilter(roastFilters, setRoastFilters, opt.value)}
                className="rounded border-[#DDD0C0] text-[#B8860B] focus:ring-[#B8860B]"
                data-testid={`checkbox-roast-${opt.value}`}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#DDD0C0] pt-6">
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-[#1A0E08]">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => setInStock(!inStock)}
            className="rounded border-[#DDD0C0] text-[#B8860B] focus:ring-[#B8860B]"
            data-testid="checkbox-in-stock"
          />
          {t("products.inStockOnly")}
        </label>
      </div>
    </div>
  );

  return (
    <FadeUp className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col md:flex-row gap-8">
      <aside className="hidden md:block w-64 flex-shrink-0">
        <FilterSidebar />
      </aside>

      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 w-80 h-full bg-[#F9F5F0] overflow-y-auto p-4 z-50 md:hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <FilterSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A0E08]" style={{ letterSpacing: '-0.01em' }} data-testid="text-products-title">{t("products.title")}</h1>
            <p className="text-sm text-[#8B6954] mt-1" data-testid="text-result-count">{t("products.resultCount", { count: String(total) })}</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={t("products.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DDD0C0] focus:outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 transition-all text-sm"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6954]" size={18} />
            </div>

            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="hidden sm:block px-3 py-2.5 rounded-xl bg-white border border-[#DDD0C0] text-sm focus:outline-none focus:border-[#B8860B] text-[#5C3D2E]"
              data-testid="select-sort"
            >
              <option value="newest">{t("products.sortNewest")}</option>
              <option value="price_asc">{t("products.sortPriceAsc")}</option>
              <option value="price_desc">{t("products.sortPriceDesc")}</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden p-2.5 bg-white border border-[#DDD0C0] rounded-xl text-[#3C2415]"
              data-testid="button-mobile-filters"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-[380px] animate-pulse shadow-warm"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-warm">
            <div className="w-16 h-16 bg-[#F0E8DE] text-[#3C2415] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#1A0E08] mb-2" data-testid="text-no-results">{t("products.noResults")}</h3>
            <p className="text-[#8B6954]">{t("products.noResultsDesc")}</p>
          </div>
        )}
      </div>
    </FadeUp>
  );
}
