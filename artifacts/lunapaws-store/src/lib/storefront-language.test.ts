import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { arabicCopy, localizeContent, translateText } from "./storefront-language";

test("all catalog and interface translations are present and English stays unchanged", () => {
  for (const [english, arabic] of Object.entries(arabicCopy)) {
    assert.ok(arabic.trim());
    assert.equal(translateText(english, "en"), english);
    assert.equal(translateText(english, "ar").trim(), arabic.trim());
  }
});

test("dynamic cart, favorite, feedback, category and price labels are localized", () => {
  const examples = {
    "Your bag (3)": "سلتك (3)",
    "Saved pieces (2)": "المفضّلة (2)",
    "Open bag, 3 items": "فتح السلة، 3 منتجات",
    "View favorites, 2 items": "عرض المفضّلة، 2 منتجات",
    "8 thoughtfully picked pieces": "8 منتجات مختارة بعناية",
    "The Sunday Cloud Bed added to your bag": "تمت إضافة سرير سحابة الأحد إلى سلتك",
    "Add The Sunday Cloud Bed to favorites": "إضافة سرير سحابة الأحد إلى المفضّلة",
    "Remove The Sunday Cloud Bed from favorites": "إزالة سرير سحابة الأحد من المفضّلة",
    "Decrease The Sunday Cloud Bed quantity": "تقليل كمية سرير سحابة الأحد",
    "Shop Cozy Beds": "تسوّق أسرّة مريحة",
    "KWD 28.500": "28.500 د.ك",
  };
  for (const [input, expected] of Object.entries(examples)) {
    assert.equal(translateText(input, "ar"), expected);
  }
});

test("presentation translation preserves handlers, IDs and typed input values", () => {
  const handler = () => undefined;
  const input = createElement("input", {
    id: "search", value: "The Sunday Cloud Bed", onChange: handler,
    placeholder: "Search thoughtful essentials...", "aria-label": "Search all products",
  });
  const result = localizeContent(input, "ar") as ReactElement<Record<string, unknown>>;
  assert.equal(result.props.id, "search");
  assert.equal(result.props.value, "The Sunday Cloud Bed");
  assert.equal(result.props.onChange, handler);
  assert.equal(result.props.placeholder, "ابحث عن مستلزمات قطك...");
  assert.equal(result.props["aria-label"], "البحث في جميع المنتجات");
  assert.equal(localizeContent(input, "en"), input);
});

test("nested translated HTML retains media, CSS and language options", () => {
  const tree = createElement("div", { dir: "rtl", lang: "ar" },
    createElement("style", null, ".Home { color: green; }"),
    createElement("button", { "aria-label": "Search products" }, "Shop Now "),
    createElement("img", { src: "/images/cat.jpg", alt: "The Sunday Cloud Bed" }),
    createElement("select", { defaultValue: "ar" },
      createElement("option", { value: "en" }, "English"),
      createElement("option", { value: "ar" }, "العربية")),
  );
  const html = renderToStaticMarkup(localizeContent(tree, "ar"));
  assert.ok(html.includes('dir="rtl" lang="ar"'));
  assert.ok(html.includes("تسوّق الآن"));
  assert.ok(html.includes('aria-label="البحث عن المنتجات"'));
  assert.ok(html.includes('alt="سرير سحابة الأحد"'));
  assert.ok(html.includes('src="/images/cat.jpg"'));
  assert.ok(html.includes(".Home { color: green; }"));
  assert.ok(html.includes("English"));
  assert.ok(html.includes("العربية"));
});
