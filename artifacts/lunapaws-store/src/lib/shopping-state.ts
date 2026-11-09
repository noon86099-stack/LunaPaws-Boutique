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
    const stored = JSON.parse(localStorage.getItem("lunapaws-cart") ?? "[]");
    const data: unknown = Array.isArray(stored) ? stored : stored?.items;
    if (!Array.isArray(data)) return [];
    return data.flatMap(item => {
      const id = savedId(item?.productId);
      return id && Number.isSafeInteger(item.quantity) && item.quantity > 0
        ? [{ productId: id, quantity: item.quantity }] : [];
    });
  } catch { return []; }
}

function paidReceipts(): string[] {
  const stored = JSON.parse(localStorage.getItem("lunapaws-cart") ?? "[]");
  return Array.isArray(stored?.paidOrders)
    ? stored.paidOrders.filter((id: unknown): id is string => typeof id === "string") : [];
}

export function persistCart(items: CartItem[]): boolean {
  try {
    localStorage.setItem("lunapaws-cart", JSON.stringify({ version: 2, items, paidOrders: paidReceipts() }));
    return true;
  } catch { return false; }
}

/** Save the updated bag AND the receipt in one write, before updating React.
 * Reopening a paid return must never subtract those quantities a second time.
 */
export function consumePaidOrder(orderId: string, paid: CartItem[], products: Product[]): CartItem[] {
  const receipts = paidReceipts();
  const current = reconcileCart(readCart(), products);
  if (receipts.includes(orderId)) return current;
  const quantities = new Map(paid.map(item => [item.productId, item.quantity]));
  const items = current.map(item => ({
    ...item, quantity: Math.max(0, item.quantity - (quantities.get(item.productId) ?? 0)),
  })).filter(item => item.quantity > 0);
  // Throws rather than risking repeated subtraction after a failed storage write.
  localStorage.setItem("lunapaws-cart", JSON.stringify({ version: 2, items, paidOrders: [...receipts, orderId] }));
  return items;
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
