import { z } from "zod";

const productRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  description: z.string().nullable(),
  price: z.union([z.number(), z.string().regex(/^\d+(?:\.\d+)?$/)])
    .transform(Number).pipe(z.number().finite().nonnegative()),
  image_url: z.string().nullable(),
  category: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
});

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  createdAt: string;
};

export type CatalogConfig = { url?: string; publishableKey?: string };

export function parseProducts(data: unknown): Product[] {
  const parsed = z.array(productRowSchema).safeParse(data);
  if (!parsed.success || new Set(parsed.data.map(row => row.id)).size !== parsed.data.length) {
    throw new Error("The product catalog returned invalid data.");
  }
  return parsed.data.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: row.price,
    // Only safe image URLs or bundled image paths are rendered.
    image: row.image_url && (/^https:\/\//i.test(row.image_url) || /^\/images\//.test(row.image_url))
      ? row.image_url : "",
    category: row.category?.trim() || "Other essentials",
    createdAt: row.created_at,
  }));
}

/** Read directly from Supabase's SELECT-only public Data API; never a service key. */
export async function fetchProducts(
  config: CatalogConfig,
  signal?: AbortSignal,
  request: typeof fetch = fetch,
): Promise<Product[]> {
  if (!config.url?.startsWith("https://") || !config.publishableKey?.startsWith("sb_publishable_")) {
    throw new Error("The product catalog is not configured yet.");
  }
  const url = new URL("/rest/v1/products", config.url);
  url.searchParams.set("select", "id,name,description,price,image_url,category,created_at");
  url.searchParams.set("order", "created_at.asc,id.asc");

  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(cancel, 12000);
  try {
    const products: Product[] = [];
    // Supabase caps response size; request explicit pages rather than silently
    // omitting later products as the catalog grows.
    for (let start = 0; ; start += 500) {
      const response = await request(url.toString(), {
        headers: {
          apikey: config.publishableKey,
          Accept: "application/json",
          Range: `${start}-${start + 499}`,
          "Range-Unit": "items",
          Prefer: "count=exact",
        },
        signal: controller.signal,
        credentials: "omit",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("The product catalog is unavailable. Please try again.");
      const page = parseProducts(await response.json());
      products.push(...page);
      const total = Number(response.headers.get("content-range")?.split("/")[1]);
      if (!page.length || page.length < 500 || (Number.isFinite(total) && products.length >= total)) break;
    }
    if (new Set(products.map(product => product.id)).size !== products.length) {
      throw new Error("The product catalog returned invalid data.");
    }
    return products;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}
