import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { authFetch } from "@/hooks/use-auth";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { items: { productId: string; quantity: number }[]; paymentMethod: string; notes?: string; address?: any }) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["/api/orders/me"],
    queryFn: async () => {
      const res = await authFetch("/api/orders/me");
      if (res.status === 401) return [];
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json();
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["/api/orders", id],
    queryFn: async () => {
      const res = await authFetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      return await res.json();
    },
    enabled: !!id,
  });
}
