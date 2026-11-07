import type { Product } from "./products";

export type CartItem = { productId: string; quantity: number };

// Compatibility only, not a product source: resolve IDs saved by the old
// numeric-ID demo against the UUID/name pairs returned by Supabase.
const legacyProductNames: Record<string, string> = {
  "1": "The Sunday Cloud Bed",
  "2": "Moss & Mellow Cushion",
  "3": "Little Orbit Play Set",
  "4": "Tumbleweed Sisal Scratcher",
  "5": "The Dune Everyday Collar",
  "6": "Poppy Bow Collar",
  "7": "Pebble Ceramic Bowl",
  "8": "Sage Slow-Supper Bowl",
};

const savedId = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value
    : typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? String(value) : null;

export function readCart(): CartItem[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem("lunapaws-cart") ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.flatMap(item => {
      const id = savedId(item?.productId);
      return id && Number.isSafeInteger(item.quantity) && item.quantity > 0
        ? [{ productId: id, quantity: item.quantity }] : [];
    });
  } catch { return []; }
}

export function readFavorites(): string[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem("lunapaws-favorites") ?? "[]");
    return Array.isArray(data) ? data.flatMap(value => savedId(value) ? [savedId(value)!] : []) : [];
  } catch { return []; }
}

function resolveId(id: string, products: Product[]): string {
  if (!legacyProductNames[id]) return id;
  return products.find(product => product.name === legacyProductNames[id])?.id ?? id;
}

export function reconcileCart(items: CartItem[], products: Product[]): CartItem[] {
  const merged = new Map<string, number>();
  for (const item of items) {
    const id = resolveId(item.productId, products);
    merged.set(id, (merged.get(id) ?? 0) + item.quantity);
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

export function reconcileFavorites(ids: string[], products: Product[]): string[] {
  return [...new Set(ids.map(id => resolveId(id, products)))];
}
