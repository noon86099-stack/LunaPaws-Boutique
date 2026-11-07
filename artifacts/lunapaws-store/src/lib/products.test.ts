import assert from "node:assert/strict";
import test from "node:test";
import { fetchProducts, parseProducts } from "./products";
import { readCart, readFavorites, reconcileCart, reconcileFavorites } from "./shopping-state";

const row = (n = 1) => ({
  id: `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  name: "The Sunday Cloud Bed",
  description: "A washable, soft cat bed.",
  price: "28.500",
  image_url: "https://example.com/cat-bed.jpg",
  category: "Cozy Beds",
  created_at: "2026-11-07T12:00:00.000000+00:00",
});
const config = { url: "https://catalog.supabase.co", publishableKey: "sb_publishable_test" };

test("Supabase row decoding preserves UUIDs, KWD precision, text and images", () => {
  const [product] = parseProducts([row()]);
  assert.equal(product?.id, row().id);
  assert.equal(product?.price, 28.5);
  assert.equal(product?.price.toFixed(3), "28.500");
  assert.equal(product?.image, row().image_url);
  const [nullable] = parseProducts([{ ...row(), description: null, image_url: null, category: null }]);
  assert.equal(nullable?.description, "");
  assert.equal(nullable?.image, "");
  assert.equal(nullable?.category, "Other essentials");
  assert.equal(parseProducts([{ ...row(), image_url: "javascript:alert(1)" }])[0]?.image, "");
  assert.deepEqual(parseProducts([]), []);
});

test("bad catalog responses are rejected rather than silently replaced by demo products", () => {
  for (const bad of [
    { message: "not an array" }, [{ ...row(), id: 1 }], [{ ...row(), price: -1 }],
    [{ ...row(), price: "" }], [{ ...row(), name: "" }],
    [{ ...row(), created_at: "not a date" }], [row(), row()],
  ]) assert.throws(() => parseProducts(bad), /invalid data/);
});

test("catalog uses the public Data API and no privileged or user credentials", async () => {
  const result = await fetchProducts(config, undefined, (async (url, init) => {
    assert.ok(String(url).startsWith("https://catalog.supabase.co/rest/v1/products?"));
    assert.ok(new URL(String(url)).searchParams.get("select")?.includes("image_url"));
    assert.equal(init?.credentials, "omit");
    assert.equal((init?.headers as Record<string, string>).apikey, config.publishableKey);
    assert.equal((init?.headers as Record<string, string>).Range, "0-499");
    assert.ok(!("Authorization" in (init?.headers ?? {})));
    return new Response(JSON.stringify([row()]), { status: 200 });
  }) as typeof fetch);
  assert.equal(result[0]?.id, row().id);
  await assert.rejects(fetchProducts({ ...config, publishableKey: "sb_secret_not_allowed" }), /not configured/);
  await assert.rejects(fetchProducts(config, undefined, (async () =>
    new Response("Sensitive diagnostic body", { status: 403 })) as typeof fetch), /unavailable/);
  await assert.rejects(fetchProducts(config, undefined, (async () =>
    new Response(JSON.stringify({ error: "bad payload" }))) as typeof fetch), /invalid data/);
  assert.deepEqual(await fetchProducts(config, undefined, (async () => new Response("[]")) as typeof fetch), []);
});

test("catalog pagination does not truncate products beyond the first response", async () => {
  let calls = 0;
  const result = await fetchProducts(config, undefined, (async (_url, init) => {
    const start = calls++ * 500;
    assert.equal((init?.headers as Record<string, string>).Range, `${start}-${start + 499}`);
    const data = start === 0 ? Array.from({ length: 500 }, (_, index) => row(index + 1)) : [row(501)];
    return new Response(JSON.stringify(data), { headers: { "content-range": `${start}-${start + data.length - 1}/501` } });
  }) as typeof fetch);
  assert.equal(result.length, 501);
  assert.equal(calls, 2);
});

test("legacy shopping state migrates to UUIDs without losing quantities or favorites", () => {
  const products = parseProducts([row()]);
  assert.deepEqual(reconcileCart([
    { productId: "1", quantity: 2 }, { productId: row().id, quantity: 3 },
    { productId: "deleted-product", quantity: 1 },
  ], products), [
    { productId: row().id, quantity: 5 }, { productId: "deleted-product", quantity: 1 },
  ]);
  assert.deepEqual(reconcileFavorites(["1", row().id, "deleted-product"], products), [row().id, "deleted-product"]);
  assert.deepEqual(reconcileCart([{ productId: "1", quantity: 2 }], []), [{ productId: "1", quantity: 2 }]);
  assert.deepEqual(reconcileFavorites(["1"], []), ["1"]);
});

test("storage decoding supports old numeric IDs and safely handles damaged storage", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    let stored = '[{"productId":1,"quantity":2},null,{"productId":2,"quantity":0}]';
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => stored } });
    assert.deepEqual(readCart(), [{ productId: "1", quantity: 2 }]);
    stored = "[1,2,null,{},\"current-uuid\"]";
    assert.deepEqual(readFavorites(), ["1", "2", "current-uuid"]);
    stored = "malformed json";
    assert.deepEqual(readCart(), []);
    assert.deepEqual(readFavorites(), []);
    stored = '{"not":"an array"}';
    assert.deepEqual(readCart(), []);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
