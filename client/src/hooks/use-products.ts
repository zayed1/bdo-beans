import { useQuery } from "@tanstack/react-query";
import type { ProductWithDetails } from "@shared/schema";

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  processing?: string[];
  roast?: string[];
  origin?: string[];
  brew?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<{ products: ProductWithDetails[]; total: number }>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.processing?.length) params.append("processing", filters.processing.join(","));
      if (filters.roast?.length) params.append("roast", filters.roast.join(","));
      if (filters.origin?.length) params.append("origin", filters.origin.join(","));
      if (filters.brew?.length) params.append("brew", filters.brew.join(","));
      if (filters.priceMin !== undefined) params.append("price_min", String(filters.priceMin));
      if (filters.priceMax !== undefined) params.append("price_max", String(filters.priceMax));
      if (filters.inStock) params.append("in_stock", "true");
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json();
    },
  });
}

export function useProduct(id: string) {
  return useQuery<ProductWithDetails | null>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return await res.json();
    },
    enabled: !!id,
  });
}
