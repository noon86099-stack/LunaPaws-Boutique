import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LunapawsStorefront } from "../components/mockups/lunapaws/LunapawsStorefront";
import type { Product } from "./products";

function renderCatalog(state: "loading" | "error" | "empty" | "ready") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false, gcTime: Infinity } },
  });
  const key = ["supabase-products"];
  if (state === "empty") client.setQueryData(key, []);
  if (state === "error") client.getQueryCache().build(client, { queryKey: key }).setState({
    status: "error", fetchStatus: "idle", error: new Error("Simulated database outage"),
  });
  if (state === "ready") client.setQueryData<Product[]>(key, [{
    id: "10000000-0000-4000-8000-000000000001",
    name: "Database-only product",
    price: 9.125,
    description: "A product returned by the database.",
    category: "Grooming",
    image: "https://example.com/grooming.jpg",
    createdAt: "2026-11-07T00:00:00Z",
  }]);
  try {
    return renderToStaticMarkup(createElement(QueryClientProvider, { client },
      createElement(LunapawsStorefront)));
  } finally { client.clear(); }
}

test("loading renders a clear status and skeletons, never hardcoded product cards", () => {
  const html = renderCatalog("loading");
  assert.ok(html.includes("Loading the collection..."));
  assert.ok(html.includes('role="status"'));
  assert.equal((html.match(/class="lp-product-skeleton"/g) ?? []).length, 8);
  assert.ok(!html.includes('data-testid="product-card-'));
});

test("an unavailable database renders error feedback and retry instead of fake products", () => {
  const html = renderCatalog("error");
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes("Please check your connection and try again."));
  assert.ok(html.includes("Try again"));
  assert.ok(!html.includes('data-testid="product-card-'));
  assert.ok(!html.includes("Simulated database outage"));
});

test("a real empty database renders the catalog-empty state, not search-empty results", () => {
  const html = renderCatalog("empty");
  assert.ok(html.includes("Our collection is being prepared."));
  assert.ok(html.includes("Refresh collection"));
  assert.ok(!html.includes("Nothing here just yet."));
  assert.ok(!html.includes('data-testid="product-card-'));
});

test("the storefront displays database rows and additional database categories without a demo array", () => {
  const html = renderCatalog("ready");
  assert.ok(html.includes("Database-only product"));
  assert.ok(html.includes("KWD 9.125"));
  assert.ok(html.includes("Grooming"));
  assert.equal((html.match(/data-testid="product-card-/g) ?? []).length, 1);
  assert.ok(!html.includes("The Sunday Cloud Bed"));
  assert.ok(!html.includes("Loading the collection..."));
});
