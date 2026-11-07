import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const favoriteRows = z.array(z.object({ product_id: z.string().uuid() }));
const EMPTY_IDS: string[] = [];

export function useAccountFavorites(userId: string | undefined) {
  const cache = useQueryClient();
  const previousUser = useRef(userId);
  const key = ["account-favorites", userId ?? "guest"] as const;

  // Separate cache keys prevent even a single render of another account's data.
  // Remove old caches as well, including when auth changes in another tab.
  useEffect(() => {
    if (previousUser.current !== userId) {
      const oldId = previousUser.current;
      void cache.cancelQueries({ queryKey: ["account-favorites", oldId ?? "guest"] });
      cache.removeQueries({ queryKey: ["account-favorites", oldId ?? "guest"] });
      previousUser.current = userId;
    }
  }, [userId, cache]);

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(userId),
    queryFn: async ({ signal }) => {
      const { data, error } = await getSupabase().from("favorites")
        .select("product_id").eq("user_id", userId!).order("created_at").abortSignal(signal);
      if (error) throw error;
      return favoriteRows.parse(data).map(row => row.product_id);
    },
    staleTime: 15000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: userId ? 30000 : false,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: async (action: { owner: string; productIds: string[]; remove?: boolean }) => {
      const client = getSupabase();
      const result = action.remove
        ? await client.from("favorites").delete().eq("user_id", action.owner)
          .in("product_id", action.productIds)
        : await client.from("favorites").upsert(
          action.productIds.map(product_id => ({ user_id: action.owner, product_id })),
          { onConflict: "user_id,product_id", ignoreDuplicates: true },
        );
      if (result.error) throw result.error;
      return action;
    },
    onSuccess: (action) => {
      const actionKey = ["account-favorites", action.owner];
      cache.setQueryData<string[]>(actionKey, old => {
        const ids = old ?? [];
        return action.remove ? ids.filter(id => !action.productIds.includes(id))
          : [...new Set([...ids, ...action.productIds])];
      });
      void cache.invalidateQueries({ queryKey: actionKey });
    },
  });

  const save = (productIds: string[], remove = false) => {
    if (!userId) return Promise.reject(new Error("Please log in first."));
    return mutation.mutateAsync({ owner: userId, productIds, remove });
  };

  return {
    ids: userId ? query.data ?? EMPTY_IDS : EMPTY_IDS,
    ready: Boolean(userId && query.isSuccess),
    loading: Boolean(userId && query.isPending),
    error: Boolean(userId && query.isError),
    saving: mutation.isPending,
    retry: () => { void query.refetch(); },
    save,
  };
}
