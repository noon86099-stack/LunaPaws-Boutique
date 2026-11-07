import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/products";

export function useProducts() {
  return useQuery({
    queryKey: ["supabase-products"],
    queryFn: ({ signal }) => fetchProducts({
      url: import.meta.env.VITE_SUPABASE_URL,
      publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    }, signal),
    staleTime: 30000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    retry: 1,
  });
}
