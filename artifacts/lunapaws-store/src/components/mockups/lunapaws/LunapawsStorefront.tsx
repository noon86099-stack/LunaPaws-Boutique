import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Instagram,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import advertisementVideo from "@assets/0_LunaPaws_Ad_1793645838002.mp4";
import { localizeContent, translateText, type StoreLanguage } from "@/lib/storefront-language";
import { AddToBagButton } from "@/components/storefront/AddToBagButton";

type Category = "Cozy Beds" | "Toys & Play" | "Collars & Accessories" | "Feeding Essentials";
type Product = {
  id: number;
  name: string;
  category: Category;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  image: string;
  tag?: string;
};
type CartItem = { productId: number; quantity: number };
type Panel = "cart" | "favorites" | "checkout" | null;

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "The Sunday Cloud Bed",
    category: "Cozy Beds",
    price: 28.5,
    description: "A sink-in-soft bouclé nest with a supportive recycled-fibre cushion. Removable cover, made for long afternoon naps.",
    rating: 4.9,
    reviews: 38,
    image: "/images/lunapaws-product-sunday-cloud-bed.jpg",
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Moss & Mellow Cushion",
    category: "Cozy Beds",
    price: 22.75,
    description: "A deep, grounded green cushion with a quilted cotton shell and a plush, washable inner pad.",
    rating: 4.8,
    reviews: 24,
    image: "/images/lunapaws-product-moss-cushion.jpg",
  },
  {
    id: 3,
    name: "Little Orbit Play Set",
    category: "Toys & Play",
    price: 8.9,
    description: "A three-piece play set with a felted wool ball, feather wand and a little crinkle moon for curious paws.",
    rating: 4.7,
    reviews: 19,
    image: "/images/lunapaws-product-orbit-play-set.jpg",
    tag: "New",
  },
  {
    id: 4,
    name: "Tumbleweed Sisal Scratcher",
    category: "Toys & Play",
    price: 16.25,
    description: "A sculptural, sturdy scratcher wrapped in natural sisal, designed to look lovely in your living room.",
    rating: 4.9,
    reviews: 31,
    image: "/images/lunapaws-product-tumbleweed-scratcher.jpg",
  },
  {
    id: 5,
    name: "The Dune Everyday Collar",
    category: "Collars & Accessories",
    price: 6.75,
    description: "Soft cotton webbing, a quick-release safety buckle and a tiny brass-tone bell. Easy, everyday comfort.",
    rating: 4.8,
    reviews: 42,
    image: "/images/lunapaws-product-dune-collar.jpg",
    tag: "Made for daily wear",
  },
  {
    id: 6,
    name: "Poppy Bow Collar",
    category: "Collars & Accessories",
    price: 7.5,
    description: "A cheerful terracotta bow on an adjustable cotton collar, finished with a breakaway clasp.",
    rating: 4.6,
    reviews: 17,
    image: "/images/lunapaws-product-poppy-bow-collar.jpg",
  },
  {
    id: 7,
    name: "Pebble Ceramic Bowl",
    category: "Feeding Essentials",
    price: 11.25,
    description: "A gently raised stoneware bowl with a smooth, glazed inside and a weighted base that stays put.",
    rating: 4.9,
    reviews: 27,
    image: "/images/lunapaws-product-pebble-ceramic-bowl.jpg",
    tag: "Small-batch",
  },
  {
    id: 8,
    name: "Sage Slow-Supper Bowl",
    category: "Feeding Essentials",
    price: 13.4,
    description: "A calming sage-green feeder with a shallow maze to make mealtimes a little slower and gentler.",
    rating: 4.8,
    reviews: 21,
    image: "/images/lunapaws-product-sage-slow-bowl.jpg",
  },
];

const CATEGORIES: { name: Category; image: string; line: string }[] = [
  { name: "Cozy Beds", image: "/images/lunapaws-product-sunday-cloud-bed.jpg", line: "A softer place to land." },
  { name: "Toys & Play", image: "/images/lunapaws-product-orbit-play-set.jpg", line: "For bright, busy paws." },
  { name: "Collars & Accessories", image: "/images/lunapaws-product-dune-collar.jpg", line: "Everyday, with a little charm." },
  { name: "Feeding Essentials", image: "/images/lunapaws-product-pebble-ceramic-bowl.jpg", line: "Make room for the good stuff." },
];

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 700'%3E%3Crect width='800' height='700' fill='%23eaded0'/%3E%3Ccircle cx='400' cy='340' r='125' fill='%23d99578' opacity='.55'/%3E%3Cpath d='M330 270l-10-96 79 63m81 33 10-96-79 63' fill='%2324483f' opacity='.82'/%3E%3Cpath d='M400 236c-72 0-122 58-122 128 0 73 48 123 122 123s122-50 122-123c0-70-50-128-122-128z' fill='%23fff8f0'/%3E%3Ccircle cx='360' cy='354' r='9' fill='%2324483f'/%3E%3Ccircle cx='440' cy='354' r='9' fill='%2324483f'/%3E%3Cpath d='M386 389q14 12 28 0' fill='none' stroke='%2324483f' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E";

const formatPrice = (value: number) => `KWD ${value.toFixed(3)}`;

function BrandMark({ light = false }: { light?: boolean }) {
  const color = light ? "#fff8f0" : "#24483f";
  return (
    <span className="lp-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M30.8 5.9a18.7 18.7 0 1 0 11.3 31.2A17.2 17.2 0 0 1 30.8 5.9Z" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
        <circle cx="17.1" cy="28.7" r="3.4" fill={color} />
        <circle cx="25.4" cy="28.7" r="3.4" fill={color} />
        <circle cx="14.8" cy="22.2" r="2.4" fill={color} />
        <circle cx="21.3" cy="20" r="2.4" fill={color} />
        <path d="M16.7 34.1c.4-2.6 2.5-4.5 4.5-4.5s4.1 1.9 4.5 4.5c.2 1.5-1.2 2.4-2.6 1.8l-1.9-.8-1.9.8c-1.4.6-2.8-.3-2.6-1.8Z" fill={color} />
      </svg>
    </span>
  );
}

function SafeImage({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  const [imageSrc, setImageSrc] = useState(src);
  useEffect(() => setImageSrc(src), [src]);
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setImageSrc(FALLBACK_IMAGE)}
    />
  );
}

export function LunapawsStorefront() {
  const [language, setLanguage] = useState<StoreLanguage>(() => {
    try { return localStorage.getItem("lunapaws-language") === "ar" ? "ar" : "en"; }
    catch { return "en"; }
  });
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = language === "ar" ? "LUNAPAWS | مستلزمات قطط مختارة بحب" : "LUNAPAWS | Little Paws, Big Love";
    try { localStorage.setItem("lunapaws-language", language); } catch { /* Preference is optional when storage is disabled. */ }
  }, [language]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("lunapaws-cart");
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("lunapaws-favorites");
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [showFavorites, setShowFavorites] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", address: "", city: "", phone: "" });

  useEffect(() => {
    localStorage.setItem("lunapaws-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("lunapaws-favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    const links = [
      ["preconnect", "https://fonts.googleapis.com"],
      ["preconnect", "https://fonts.gstatic.com"],
    ];
    links.forEach(([rel, href]) => {
      if (!document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        if (href.includes("gstatic")) link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
    });
    if (!document.head.querySelector('link[data-lunapaws-fonts="true"]')) {
      const font = document.createElement("link");
      font.rel = "stylesheet";
      font.media = "print";
      font.onload = () => {
        font.media = "all";
      };
      font.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap";
      font.dataset.lunapawsFonts = "true";
      document.head.appendChild(font);
    }
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        setSelectedProduct(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesFavorite = !showFavorites || favorites.includes(product.id);
      const matchesSearch =
        !term ||
        [product.name, product.category, product.description,
          translateText(product.name, "ar"), translateText(product.category, "ar"),
          translateText(product.description, "ar")].join(" ").toLowerCase().includes(term);
      return matchesCategory && matchesFavorite && matchesSearch;
    });
  }, [activeCategory, favorites, query, showFavorites]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };
  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const match = current.find((item) => item.productId === product.id);
      return match
        ? current.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          )
        : [...current, { productId: product.id, quantity }];
    });
    setToast(`${product.name} added to your bag`);
  };
  const updateQuantity = (productId: number, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };
  const toggleFavorite = (productId: number) => {
    setFavorites((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  };
  const openProduct = (product: Product) => {
    setDetailQuantity(1);
    setSelectedProduct(product);
  };
  const chooseCategory = (category: Category | "All") => {
    setActiveCategory(category);
    setShowFavorites(false);
    scrollTo("shop");
  };
  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }
    setNewsletterMessage("You're on the list. A little joy is headed your way.");
    setNewsletterEmail("");
  };
  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderPlaced(true);
    setCart([]);
  };

  const navLinks = [
    { label: "Home", target: "home" },
    { label: "Shop", target: "shop" },
    { label: "Categories", target: "categories" },
    { label: "About Us", target: "about" },
  ];

  return localizeContent((
    <div className="lp-root" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <style>{`
        .lp-root {
          --lp-cream: #FFF8F0;
          --lp-forest: #24483F;
          --lp-terracotta: #D99578;
          --lp-ink: #2e3934;
          --lp-muted: #7c827c;
          --lp-line: #e9e1d8;
          --lp-sage: #e9eee7;
          color: var(--lp-ink);
          background: var(--lp-cream);
          font-family: Inter, 'Avenir Next', sans-serif;
          min-height: 100vh;
          overflow: hidden;
        }
        .lp-root * { box-sizing: border-box; }
        .lp-root button, .lp-root input, .lp-root textarea { font: inherit; }
        .lp-root button { color: inherit; }
        .lp-root a { color: inherit; text-decoration: none; }
        .lp-root button:focus-visible, .lp-root a:focus-visible, .lp-root input:focus-visible {
          outline: 3px solid rgba(217,149,120,.62);
          outline-offset: 3px;
        }
        .lp-display { font-family: Poppins, 'Avenir Next', sans-serif; }
        .lp-container { width: min(1180px, calc(100% - 64px)); margin: 0 auto; }
        .lp-topline {
          min-height: 34px; display: flex; align-items: center; justify-content: center;
          background: var(--lp-forest); color: #fff8f0; font-size: 10px; letter-spacing: .15em;
          text-transform: uppercase; font-weight: 600;
        }
        .lp-topline span { opacity: .84; }
        .lp-header { position: sticky; top: 0; z-index: 20; background: rgba(255,248,240,.94); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(36,72,63,.07); }
        .lp-header-inner { height: 77px; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
        .lp-logo { display: inline-flex; align-items: center; gap: 9px; color: var(--lp-forest); flex-shrink: 0; }
        .lp-brand-mark { width: 39px; height: 39px; display: inline-flex; }
        .lp-brand-mark svg { width: 100%; height: 100%; }
        .lp-wordmark { font-family: Poppins, sans-serif; font-size: 18px; line-height: 1; letter-spacing: .16em; font-weight: 600; }
        .lp-header nav { display: flex; align-items: center; gap: clamp(18px, 3vw, 40px); }
        .lp-nav-link { font-size: 12px; color: #52625a; font-weight: 500; transition: color .2s; }
        .lp-nav-link:hover { color: var(--lp-terracotta); }
        .lp-header-actions { display: flex; align-items: center; gap: 13px; }
        .lp-icon-button { position: relative; width: 38px; height: 38px; display: inline-flex; justify-content: center; align-items: center; border: 0; border-radius: 50%; background: transparent; cursor: pointer; transition: background .2s, color .2s; }
        .lp-icon-button:hover { background: #f0e9df; color: var(--lp-forest); }
        .lp-icon-button svg { width: 18px; height: 18px; stroke-width: 1.7; }
        .lp-count { position: absolute; top: 1px; right: 0; width: 16px; height: 16px; display: grid; place-items: center; border-radius: 50%; background: var(--lp-terracotta); color: white; font-size: 9px; font-weight: 700; }
        .lp-menu-trigger { display: none; }
        .lp-search-wrap { position: relative; }
        .lp-search-pop { position: absolute; right: -88px; top: 49px; width: 270px; padding: 12px; border: 1px solid var(--lp-line); border-radius: 15px; background: var(--lp-cream); box-shadow: 0 15px 36px rgba(37,53,44,.12); }
        .lp-search-pop input { width: 100%; border: 0; background: #f4eee6; border-radius: 10px; padding: 12px 13px; color: var(--lp-ink); font-size: 12px; }
        .lp-mobile-nav { display: none; }
        .lp-hero { position: relative; background: #eee4d8; min-height: 496px; overflow: hidden; }
        .lp-hero-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 45%; filter: saturate(.83); }
        .lp-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,248,240,.97) 0%, rgba(255,248,240,.84) 34%, rgba(255,248,240,.12) 72%, rgba(255,248,240,.02) 100%); }
        .lp-hero-inner { position: relative; z-index: 1; min-height: 496px; display: flex; align-items: center; }
        .lp-hero-copy { max-width: 510px; padding: 46px 0 50px; }
        .lp-eyebrow { display: flex; align-items: center; gap: 9px; color: var(--lp-forest); font-size: 10px; font-weight: 700; letter-spacing: .19em; text-transform: uppercase; }
        .lp-eyebrow::before { content: ""; width: 26px; height: 1px; background: var(--lp-terracotta); }
        .lp-hero h1 { margin: 22px 0 17px; color: var(--lp-forest); font-size: clamp(42px, 5vw, 66px); line-height: 1.1; letter-spacing: -.055em; font-weight: 500; max-width: 570px; }
        .lp-hero h1 em { color: var(--lp-terracotta); font-style: normal; }
        .lp-hero-copy p { max-width: 390px; margin: 0; color: #66716a; font-size: 13px; line-height: 1.85; }
        .lp-button { display: inline-flex; align-items: center; justify-content: center; gap: 11px; border: 1px solid var(--lp-forest); border-radius: 999px; background: var(--lp-forest); color: var(--lp-cream) !important; padding: 13px 22px; min-height: 47px; font-size: 11px; line-height: 1; letter-spacing: .06em; font-weight: 600; cursor: pointer; transition: transform .2s, background .2s, box-shadow .2s; }
        .lp-button:hover { background: #31594e; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(36,72,63,.15); }
        .lp-button svg { width: 15px; height: 15px; }
        .lp-button-light { color: var(--lp-forest) !important; background: var(--lp-cream); border-color: var(--lp-cream); }
        .lp-button-light:hover { color: var(--lp-forest) !important; background: white; }
        .lp-hero .lp-button { margin-top: 27px; }
        .lp-hero-note { display: flex; gap: 22px; margin-top: 38px; color: #69746c; font-size: 10px; }
        .lp-hero-note span { display: inline-flex; align-items: center; gap: 7px; }
        .lp-hero-note svg { width: 14px; height: 14px; color: var(--lp-terracotta); }
        .lp-stamp { position: absolute; z-index: 2; right: max(8%, calc((100% - 1180px)/2 + 24px)); bottom: 50px; width: 94px; height: 94px; display: grid; place-items: center; border: 1px solid rgba(255,248,240,.78); border-radius: 50%; color: white; background: rgba(36,72,63,.2); backdrop-filter: blur(5px); text-align: center; transform: rotate(-10deg); }
        .lp-stamp strong { font-family: Poppins,sans-serif; font-size: 11px; line-height: 1.4; letter-spacing: .1em; text-transform: uppercase; }
        .lp-perks { display: grid; grid-template-columns: repeat(3,1fr); border-bottom: 1px solid var(--lp-line); background: #fffaf4; }
        .lp-perk { display: flex; justify-content: center; align-items: center; gap: 11px; padding: 17px 10px; color: var(--lp-forest); font-size: 10px; letter-spacing: .04em; }
        .lp-perk:not(:last-child) { border-right: 1px solid var(--lp-line); }
        .lp-perk svg { width: 16px; height: 16px; color: var(--lp-terracotta); stroke-width: 1.7; }
        .lp-section { padding: 83px 0; scroll-margin-top: 90px; }
        .lp-section-heading { display: flex; justify-content: space-between; align-items: end; gap: 25px; margin-bottom: 29px; }
        .lp-section-heading h2 { color: var(--lp-forest); margin: 10px 0 0; font: 500 clamp(28px, 3vw, 37px)/1.2 Poppins,sans-serif; letter-spacing: -.045em; }
        .lp-section-heading p { margin: 10px 0 0; font-size: 12px; line-height: 1.7; color: var(--lp-muted); }
        .lp-text-link { display: inline-flex; gap: 7px; align-items: center; border: 0; border-bottom: 1px solid rgba(36,72,63,.3); padding: 0 0 5px; color: var(--lp-forest); background: transparent; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .lp-text-link svg { width: 14px; height: 14px; }
        .lp-category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 17px; }
        .lp-category-card { position: relative; height: 284px; overflow: hidden; border-radius: 18px; background: #e8ddd0; cursor: pointer; text-align: left; border: 0; padding: 0; }
        .lp-category-card img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .65s cubic-bezier(.2,.7,.2,1); }
        .lp-category-card:hover img { transform: scale(1.045); }
        .lp-category-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, rgba(24,42,34,.74) 100%); }
        .lp-category-content { position: absolute; z-index: 1; left: 19px; right: 19px; bottom: 19px; color: white; }
        .lp-category-content small { font-size: 9px; opacity: .82; letter-spacing: .12em; text-transform: uppercase; }
        .lp-category-content strong { display: block; margin: 7px 0 4px; font: 500 17px Poppins,sans-serif; letter-spacing: -.02em; }
        .lp-category-content span { font-size: 10px; opacity: .87; }
        .lp-shop-section { padding-top: 73px; background: #f6eee4; }
        .lp-filter-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin: 28px 0 23px; }
        .lp-filter-pills { display: flex; gap: 7px; flex-wrap: wrap; }
        .lp-filter-pill { border: 1px solid #ddd5ca; border-radius: 999px; background: transparent; color: #6f7771; padding: 9px 13px; font-size: 10px; cursor: pointer; transition: all .2s; }
        .lp-filter-pill:hover, .lp-filter-pill.active { color: white; border-color: var(--lp-forest); background: var(--lp-forest); }
        .lp-filter-note { color: var(--lp-muted); font-size: 10px; white-space: nowrap; }
        .lp-product-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 18px; }
        .lp-product-card { min-width: 0; position: relative; overflow: hidden; background: #fffaf4; border: 1px solid rgba(59,72,59,.05); border-radius: 17px; transition: transform .28s ease, box-shadow .28s ease; }
        .lp-product-card:hover { transform: translateY(-5px); box-shadow: 0 16px 34px rgba(61,48,34,.1); }
        .lp-product-image { position: relative; height: 208px; overflow: hidden; background: #e9dfd3; }
        .lp-product-image-trigger { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: pointer; }
        .lp-product-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.2,.7,.2,1); }
        .lp-product-card:hover .lp-product-image img { transform: scale(1.055); }
        .lp-fav-button { position: absolute; right: 11px; top: 11px; display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: 50%; background: rgba(255,248,240,.94); color: var(--lp-forest); cursor: pointer; transition: transform .2s, color .2s; }
        .lp-fav-button:hover { transform: scale(1.08); }
        .lp-fav-button svg { width: 15px; height: 15px; }
        .lp-fav-button.selected { color: #bd6f5c; }
        .lp-product-info { padding: 16px 15px 12px; }
        .lp-product-title { min-height: 40px; margin: 0 0 8px; color: var(--lp-forest); font: 500 14px/1.4 Poppins,sans-serif; }
        .lp-product-title button { border: 0; padding: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
        .lp-product-price { display: block; margin-bottom: 13px; color: var(--lp-forest); font: 700 19px/1.4 Inter,sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .lp-rating { display: flex; align-items: center; gap: 4px; color: #7d6754; font-size: 9px; }
        .lp-rating svg { width: 11px; height: 11px; fill: #d9a56d; stroke: #d9a56d; }
        .lp-rating span { color: #a2a099; }
        .lp-add-small { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--lp-forest); font-size: 9px; font-weight: 700; cursor: pointer; }
        .lp-add-small svg { width: 14px; height: 14px; }
        .lp-card-add { width: 100%; justify-content: center; min-height: 42px; padding: 9px 10px; border: 1px solid var(--lp-forest); border-radius: 999px; font-size: 12px; transition: background .2s; }
        .lp-card-add:hover { background: var(--lp-sage); }
        .lp-add-feedback { display: block; min-height: 19px; padding-top: 3px; color: var(--lp-forest); font-size: 11px; font-weight: 600; text-align: center; }
        .lp-empty-products { grid-column: 1/-1; padding: 52px 20px; background: rgba(255,250,244,.7); border: 1px dashed #d9cfc2; border-radius: 18px; text-align: center; }
        .lp-empty-products svg { color: var(--lp-terracotta); }
        .lp-empty-products h3 { color: var(--lp-forest); font: 500 19px Poppins,sans-serif; margin: 10px 0 5px; }
        .lp-empty-products p { color: var(--lp-muted); font-size: 11px; margin: 0 0 14px; }
        .lp-promo { padding: 0 0 82px; background: #f6eee4; }
        .lp-promo-inner { min-height: 276px; position: relative; overflow: hidden; display: flex; align-items: center; border-radius: 22px; background: var(--lp-forest); color: var(--lp-cream); }
        .lp-promo-inner::before { content: ""; position: absolute; width: 460px; height: 460px; border: 1px solid rgba(255,248,240,.15); border-radius: 50%; right: 4%; top: -180px; box-shadow: 0 0 0 38px rgba(255,248,240,.025),0 0 0 80px rgba(255,248,240,.025); }
        .lp-promo-copy { position: relative; z-index: 1; padding: 42px 7%; max-width: 620px; }
        .lp-promo .lp-eyebrow { color: #e4b89e; }
        .lp-promo h2 { margin: 15px 0 12px; font: 500 clamp(28px,3.4vw,43px)/1.2 Poppins,sans-serif; letter-spacing: -.05em; }
        .lp-promo p { max-width: 430px; color: rgba(255,248,240,.72); font-size: 11px; line-height: 1.8; }
        .lp-promo .lp-button { margin-top: 11px; }
        .lp-promo-art { position: absolute; right: 7%; bottom: -3px; width: 235px; height: 240px; display: flex; align-items: end; justify-content: center; opacity: .9; }
        .lp-promo-art img { width: 100%; height: 100%; object-fit: cover; border-radius: 130px 130px 14px 14px; filter: saturate(.72); }
        .lp-video-section { padding: 76px 0; background: var(--lp-cream); }
        .lp-video-window { width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 22px; background: var(--lp-forest); box-shadow: 0 18px 48px rgba(36,72,63,.12); }
        .lp-video-window video { display: block; width: 100%; height: 100%; object-fit: contain; background: var(--lp-forest); }
        .lp-video-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 20px; }
        .lp-video-note { color: var(--lp-muted); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; }
        .lp-about-section { background: #fffaf4; padding: 83px 0; }
        .lp-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9%; align-items: center; }
        .lp-about-image { height: 390px; position: relative; border-radius: 18px; overflow: hidden; background: #e9ddd0; }
        .lp-about-image img { width: 100%; height: 100%; object-fit: cover; }
        .lp-about-image::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg,rgba(36,72,63,.18),transparent 52%); }
        .lp-about-mark { position: absolute; z-index: 1; bottom: 19px; left: 19px; padding: 13px 15px; border-radius: 12px; color: var(--lp-forest); background: var(--lp-cream); font: 500 11px Poppins,sans-serif; }
        .lp-about-copy h2 { margin: 13px 0 17px; color: var(--lp-forest); font: 500 clamp(30px,3.5vw,43px)/1.18 Poppins,sans-serif; letter-spacing: -.05em; }
        .lp-about-copy p { max-width: 480px; color: #778079; font-size: 12px; line-height: 1.95; }
        .lp-about-values { display: flex; gap: 24px; margin: 25px 0; }
        .lp-about-value strong { display: block; color: var(--lp-forest); font: 500 21px Poppins,sans-serif; }
        .lp-about-value span { color: #899087; font-size: 9px; }
        .lp-testimonials { padding: 79px 0; background: #f1e9df; }
        .lp-testimonial-grid { display: grid; grid-template-columns: 1.15fr 1fr 1fr; gap: 16px; }
        .lp-testimonial { padding: 22px; border-radius: 17px; background: #fffaf4; }
        .lp-testimonial.primary { background: var(--lp-forest); color: var(--lp-cream); padding: 27px; }
        .lp-quote-mark { color: var(--lp-terracotta); font: 500 37px/1 Georgia,serif; }
        .lp-testimonial p { min-height: 83px; margin: 10px 0 18px; font: 400 13px/1.7 Poppins,sans-serif; }
        .lp-testimonial:not(.primary) p { color: #5e6d64; font-size: 11px; }
        .lp-reviewer { display: flex; align-items: center; gap: 10px; }
        .lp-avatar { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; background: #ead6c4; color: var(--lp-forest); font-size: 10px; font-weight: 700; }
        .lp-reviewer strong { display: block; font-size: 10px; font-weight: 600; }
        .lp-reviewer span { display: block; margin-top: 3px; color: #92978f; font-size: 8px; }
        .lp-testimonial.primary .lp-reviewer span { color: rgba(255,248,240,.62); }
        .lp-stars { display: flex; gap: 2px; color: #d6a26e; }
        .lp-stars svg { width: 11px; height: 11px; fill: currentColor; }
        .lp-newsletter { padding: 63px 0; background: #e6ece5; }
        .lp-newsletter-inner { display: flex; align-items: center; justify-content: space-between; gap: 35px; }
        .lp-newsletter h2 { margin: 9px 0 7px; color: var(--lp-forest); font: 500 28px Poppins,sans-serif; letter-spacing: -.04em; }
        .lp-newsletter p { margin: 0; color: #748078; font-size: 11px; }
        .lp-newsletter-form { width: min(410px, 48%); }
        .lp-newsletter-controls { display: flex; border: 1px solid #c7d2c8; border-radius: 999px; padding: 4px; background: rgba(255,248,240,.8); }
        .lp-newsletter-controls input { width: 100%; min-width: 0; border: 0; outline: none; background: transparent; padding: 0 14px; color: var(--lp-forest); font-size: 10px; }
        .lp-newsletter-controls button { border: 0; padding: 11px 17px; border-radius: 999px; background: var(--lp-forest); color: white; font-size: 9px; font-weight: 600; white-space: nowrap; cursor: pointer; }
        .lp-newsletter-message { min-height: 15px; margin: 8px 0 0 13px; color: var(--lp-forest); font-size: 9px; }
        .lp-footer { padding: 53px 0 19px; background: #203f37; color: #fff8f0; }
        .lp-footer-grid { display: grid; grid-template-columns: 1.45fr 1fr 1fr 1.2fr; gap: 45px; padding-bottom: 42px; }
        .lp-footer .lp-logo { color: var(--lp-cream); }
        .lp-footer-brand p { max-width: 250px; color: rgba(255,248,240,.62); font-size: 10px; line-height: 1.8; margin: 17px 0; }
        .lp-socials { display: flex; gap: 8px; }
        .lp-socials a { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid rgba(255,248,240,.23); border-radius: 50%; color: #fff8f0; transition: background .2s; }
        .lp-socials a:hover { background: rgba(255,248,240,.12); }
        .lp-socials svg { width: 13px; height: 13px; }
        .lp-footer-col h3 { margin: 3px 0 17px; font: 500 11px Poppins,sans-serif; }
        .lp-footer-col a, .lp-footer-col button { display: block; padding: 0; margin: 0 0 11px; border: 0; color: rgba(255,248,240,.64); background: transparent; font-size: 9px; cursor: pointer; text-align: left; }
        .lp-footer-col a:hover, .lp-footer-col button:hover { color: white; }
        .lp-footer-bottom { display: flex; justify-content: space-between; align-items: center; gap: 15px; padding-top: 17px; border-top: 1px solid rgba(255,248,240,.14); color: rgba(255,248,240,.5); font-size: 8px; }
        .lp-footer-bottom span:last-child { letter-spacing: .1em; }
        .lp-overlay { position: fixed; inset: 0; z-index: 60; display: flex; justify-content: flex-end; background: rgba(24,37,31,.38); backdrop-filter: blur(3px); animation: lp-fade-in .18s ease both; }
        .lp-panel { position: relative; display: flex; flex-direction: column; width: min(460px, 100%); height: 100%; background: var(--lp-cream); box-shadow: -15px 0 48px rgba(29,42,35,.16); animation: lp-slide-in .28s ease both; }
        .lp-panel-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 25px 20px; border-bottom: 1px solid var(--lp-line); }
        .lp-panel-head h2 { margin: 0; color: var(--lp-forest); font: 500 22px Poppins,sans-serif; }
        .lp-close { display: grid; place-items: center; width: 35px; height: 35px; border: 0; border-radius: 50%; background: #f0e9df; color: var(--lp-forest); cursor: pointer; }
        .lp-close svg { width: 17px; height: 17px; }
        .lp-panel-scroll { flex: 1; overflow-y: auto; padding: 18px 25px; }
        .lp-cart-row { display: grid; grid-template-columns: 77px 1fr auto; gap: 13px; padding: 13px 0; border-bottom: 1px solid var(--lp-line); }
        .lp-cart-row img { width: 77px; height: 77px; border-radius: 11px; object-fit: cover; background: #e9dfd3; }
        .lp-cart-row h3 { margin: 2px 0 5px; color: var(--lp-forest); font: 500 12px Poppins,sans-serif; }
        .lp-cart-row p { margin: 0 0 8px; color: var(--lp-forest); font-size: 16px; font-weight: 600; }
        .lp-quantity { display: flex; align-items: center; gap: 9px; margin-top: 12px; }
        .lp-quantity button { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid #ded6cb; border-radius: 50%; color: var(--lp-forest); background: transparent; cursor: pointer; }
        .lp-quantity button svg { width: 11px; height: 11px; }
        .lp-quantity span { min-width: 12px; text-align: center; font-size: 10px; }
        .lp-remove { border: 0; background: transparent; color: #9a8175; cursor: pointer; align-self: start; padding: 3px; }
        .lp-remove svg { width: 14px; height: 14px; }
        .lp-panel-bottom { padding: 19px 25px 24px; border-top: 1px solid var(--lp-line); background: #fffaf4; }
        .lp-subtotal { display: flex; justify-content: space-between; margin-bottom: 7px; color: var(--lp-forest); font-size: 12px; font-weight: 600; }
        .lp-panel-bottom small { display: block; margin-bottom: 15px; color: #96958e; font-size: 9px; }
        .lp-full-button { width: 100%; }
        .lp-empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 65px 20px; }
        .lp-empty-state > svg { width: 33px; height: 33px; margin-bottom: 15px; color: var(--lp-terracotta); stroke-width: 1.4; }
        .lp-empty-state h3 { color: var(--lp-forest); font: 500 17px Poppins,sans-serif; margin: 0 0 8px; }
        .lp-empty-state p { max-width: 240px; color: var(--lp-muted); font-size: 10px; line-height: 1.7; margin: 0 0 19px; }
        .lp-modal-backdrop { position: fixed; inset: 0; z-index: 70; display: grid; place-items: center; padding: 22px; background: rgba(24,37,31,.48); backdrop-filter: blur(4px); animation: lp-fade-in .18s ease both; }
        .lp-product-modal { position: relative; display: grid; grid-template-columns: 1fr 1fr; width: min(820px, 100%); max-height: min(570px, 92vh); overflow: auto; border-radius: 21px; background: var(--lp-cream); box-shadow: 0 28px 80px rgba(20,35,27,.2); animation: lp-rise-in .25s ease both; }
        .lp-modal-image { min-height: 430px; background: #e9dfd3; }
        .lp-modal-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lp-modal-copy { position: relative; display: flex; flex-direction: column; justify-content: center; padding: 46px; }
        .lp-modal-copy .lp-close { position: absolute; right: 17px; top: 17px; }
        .lp-modal-copy h2 { color: var(--lp-forest); font: 500 28px/1.25 Poppins,sans-serif; margin: 12px 0 8px; letter-spacing: -.04em; }
        .lp-modal-copy > p { color: #788078; font-size: 11px; line-height: 1.8; margin: 19px 0; }
        .lp-modal-price { color: var(--lp-forest); font-size: 21px; font-weight: 700; }
        .lp-modal-actions { display: flex; align-items: center; gap: 13px; margin-top: 23px; }
        .lp-modal-actions .lp-quantity { margin: 0; gap: 11px; }
        .lp-checkout { position: relative; display: flex; flex-direction: column; width: min(500px, 100%); height: 100%; background: var(--lp-cream); box-shadow: -15px 0 48px rgba(29,42,35,.16); animation: lp-slide-in .28s ease both; }
        .lp-checkout-form { padding: 21px 25px; }
        .lp-demo-notice { display: flex; gap: 10px; padding: 12px; margin: 0 0 19px; border: 1px solid #e8c9b8; border-radius: 11px; background: #f8e9df; color: #724f40; font-size: 9px; line-height: 1.65; }
        .lp-demo-notice svg { flex: none; width: 15px; height: 15px; margin-top: 1px; }
        .lp-checkout-form label { display: block; margin: 0 0 12px; color: #59685f; font-size: 9px; font-weight: 600; }
        .lp-checkout-form input { display: block; width: 100%; margin-top: 6px; padding: 11px 12px; border: 1px solid #ded8ce; border-radius: 9px; background: #fffdf9; color: var(--lp-ink); font-size: 10px; }
        .lp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
        .lp-checkout-summary { margin: 13px 0 18px; padding: 14px 0; border-top: 1px solid var(--lp-line); border-bottom: 1px solid var(--lp-line); }
        .lp-checkout-summary > div { display: flex; justify-content: space-between; margin: 5px 0; color: #6b756f; font-size: 10px; }
        .lp-checkout-summary > div:last-child { margin-top: 10px; color: var(--lp-forest); font-weight: 700; }
        .lp-back-cart { display: flex; align-items: center; gap: 8px; padding: 0 25px 22px; border: 0; background: transparent; color: var(--lp-forest); font-size: 10px; font-weight: 600; cursor: pointer; }
        .lp-back-cart svg { width: 14px; height: 14px; }
        .lp-success { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 35px; text-align: center; }
        .lp-success-mark { display: grid; place-items: center; width: 64px; height: 64px; margin-bottom: 20px; border-radius: 50%; background: #e5eee5; color: var(--lp-forest); }
        .lp-success-mark svg { width: 28px; height: 28px; }
        .lp-success h2 { margin: 0 0 10px; color: var(--lp-forest); font: 500 25px Poppins,sans-serif; }
        .lp-success p { max-width: 290px; margin: 0 0 22px; color: var(--lp-muted); font-size: 11px; line-height: 1.75; }
        .lp-toast { position: fixed; z-index: 90; left: 50%; bottom: 24px; transform: translateX(-50%); display: flex; align-items: center; gap: 9px; padding: 12px 17px; border-radius: 999px; background: var(--lp-forest); color: white; box-shadow: 0 9px 24px rgba(25,47,38,.2); font-size: 10px; animation: lp-rise-in .22s ease both; }
        .lp-toast svg { width: 15px; height: 15px; color: #e2b89c; }
        @keyframes lp-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lp-slide-in { from { transform: translateX(18px); opacity: .5; } to { transform: translateX(0); opacity: 1; } }
        @keyframes lp-rise-in { from { transform: translateY(9px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (max-width: 980px) {
          .lp-container { width: min(100% - 44px, 850px); }
          .lp-header nav { gap: 17px; }
          .lp-header-inner { gap: 15px; }
          .lp-category-grid { grid-template-columns: repeat(2,1fr); }
          .lp-category-card { height: 260px; }
          .lp-product-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .lp-product-image { height: 235px; }
          .lp-footer-grid { gap: 28px; grid-template-columns: 1.4fr 1fr 1fr; }
          .lp-footer-col:last-child { display: none; }
          .lp-stamp { right: 7%; }
        }
        @media (max-width: 680px) {
          .lp-container { width: calc(100% - 36px); }
          .lp-topline { min-height: 29px; font-size: 8px; }
          .lp-header-inner { height: 66px; }
          .lp-wordmark { font-size: 15px; }
          .lp-brand-mark { width: 33px; height: 33px; }
          .lp-header nav { display: none; }
          .lp-header-actions { gap: 2px; }
          .lp-icon-button { width: 35px; height: 35px; }
          .lp-menu-trigger { display: inline-flex; }
          .lp-mobile-nav { display: flex; flex-direction: column; gap: 0; padding: 3px 18px 14px; border-top: 1px solid var(--lp-line); background: var(--lp-cream); }
          .lp-mobile-nav button { padding: 12px 5px; border: 0; border-bottom: 1px solid #eee7df; background: transparent; color: var(--lp-forest); text-align: left; font-size: 12px; cursor: pointer; }
          .lp-search-pop { position: fixed; right: 16px; top: 108px; width: min(320px, calc(100vw - 32px)); }
          .lp-hero { min-height: 0; padding-top: 250px; background: var(--lp-cream); }
          .lp-hero-photo { height: 285px; object-position: center 68%; filter: none; }
          .lp-hero::after { bottom: auto; height: 285px; background: linear-gradient(180deg,rgba(255,248,240,0) 65%,var(--lp-cream) 100%); }
          .lp-hero-inner { min-height: 0; }
          .lp-hero-copy { padding: 16px 0 32px; max-width: 430px; }
          .lp-hero h1 { font-size: clamp(36px, 11vw, 50px); margin: 16px 0 12px; }
          .lp-hero-copy p { font-size: 12px; max-width: 330px; }
          .lp-hero-note { gap: 12px; margin-top: 25px; flex-wrap: wrap; }
          .lp-hero-note span { font-size: 9px; }
          .lp-stamp { right: 18px; top: 18px; bottom: auto; width: 64px; height: 64px; }
          .lp-stamp strong { font-size: 9px; }
          .lp-perk { padding: 14px 5px; gap: 6px; font-size: 8px; text-align: center; }
          .lp-perk svg { width: 13px; height: 13px; }
          .lp-section { padding: 60px 0; }
          .lp-section-heading { align-items: start; flex-direction: column; gap: 12px; margin-bottom: 22px; }
          .lp-section-heading h2 { font-size: 30px; }
          .lp-section-heading p { font-size: 11px; }
          .lp-category-grid { gap: 10px; }
          .lp-category-card { height: 215px; border-radius: 14px; }
          .lp-category-content { left: 13px; right: 10px; bottom: 13px; }
          .lp-category-content strong { font-size: 13px; }
          .lp-category-content small { font-size: 7px; }
          .lp-category-content span { font-size: 8px; }
          .lp-shop-section { padding-top: 58px; }
          .lp-filter-row { align-items: flex-start; flex-direction: column; margin: 22px 0 17px; }
          .lp-filter-pills { flex-wrap: nowrap; width: calc(100vw - 36px); overflow-x: auto; padding: 2px 0 8px; scrollbar-width: none; }
          .lp-filter-pills::-webkit-scrollbar { display: none; }
          .lp-filter-pill { flex: none; }
          .lp-filter-note { display: none; }
          .lp-product-grid { gap: 10px; }
          .lp-product-image { height: clamp(145px, 48vw, 210px); }
          .lp-product-info { padding: 11px 10px 12px; }
          .lp-product-title { font-size: 12px; min-height: 36px; }
          .lp-product-price { font-size: 17px; }
          .lp-rating { font-size: 8px; }
          .lp-card-add { font-size: 11px; min-height: 44px; padding: 8px; gap: 5px; }
          .lp-promo { padding-bottom: 58px; }
          .lp-promo-inner { min-height: 330px; align-items: flex-start; border-radius: 17px; }
          .lp-promo-copy { padding: 30px 25px; }
          .lp-promo h2 { max-width: 270px; font-size: 30px; }
          .lp-promo p { max-width: 260px; font-size: 10px; }
          .lp-promo-art { right: -12px; width: 135px; height: 137px; opacity: .58; }
          .lp-video-section { padding: 56px 0; }
          .lp-video-window { border-radius: 15px; }
          .lp-video-footer { align-items: stretch; flex-direction: column; gap: 13px; margin-top: 15px; }
          .lp-video-footer .lp-button { width: 100%; min-height: 46px; }
          .lp-about-section { padding: 60px 0; }
          .lp-about-grid { grid-template-columns: 1fr; gap: 28px; }
          .lp-about-image { height: 290px; }
          .lp-about-copy h2 { font-size: 34px; }
          .lp-testimonials { padding: 58px 0; }
          .lp-testimonial-grid { grid-template-columns: 1fr; gap: 10px; }
          .lp-testimonial { padding: 19px; }
          .lp-testimonial p { min-height: unset; margin-bottom: 15px; }
          .lp-newsletter { padding: 46px 0; }
          .lp-newsletter-inner { align-items: stretch; flex-direction: column; gap: 20px; }
          .lp-newsletter h2 { font-size: 25px; }
          .lp-newsletter-form { width: 100%; }
          .lp-footer { padding-top: 40px; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 28px 18px; }
          .lp-footer-brand { grid-column: 1/-1; }
          .lp-footer-col:last-child { display: block; }
          .lp-footer-bottom { align-items: flex-start; flex-direction: column; font-size: 7px; }
          .lp-product-modal { display: block; max-height: 92vh; overflow-y: auto; }
          .lp-modal-image { height: 260px; min-height: 0; }
          .lp-modal-copy { padding: 25px; }
          .lp-modal-copy h2 { font-size: 24px; }
          .lp-modal-copy .lp-close { right: 12px; top: -248px; background: rgba(255,248,240,.94); }
          .lp-modal-actions { flex-wrap: wrap; }
          .lp-modal-actions .lp-button { flex: 1; }
          .lp-panel-head { padding: 19px 18px 16px; }
          .lp-panel-scroll { padding: 12px 18px; }
          .lp-panel-bottom { padding: 17px 18px 22px; }
          .lp-checkout-form { padding: 16px 18px; }
          .lp-back-cart { padding-left: 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-root *, .lp-root *::before, .lp-root *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <style>{`
        .lp-topline { padding: 6px 18px; gap: 12px; }
        .lp-topline > span { text-align: center; }
        .lp-language-select { flex-shrink: 0; padding: 4px 7px; border: 1px solid #ffffff66; border-radius: 7px; background: #24483F; color: #FFF8F0; font: 500 11px Inter, 'Noto Sans Arabic', sans-serif; cursor: pointer; }
        .lp-root[dir=rtl] { font-family: 'Noto Sans Arabic', Inter, sans-serif; }
        .lp-root[dir=rtl] h1, .lp-root[dir=rtl] h2, .lp-root[dir=rtl] h3,
        .lp-root[dir=rtl] .lp-display, .lp-root[dir=rtl] .lp-about-mark { font-family: 'Noto Sans Arabic', Inter, sans-serif; letter-spacing: 0; }
        .lp-root[dir=rtl] .lp-eyebrow, .lp-root[dir=rtl] .lp-topline, .lp-root[dir=rtl] .lp-category-content small { letter-spacing: 0; }
        .lp-root[dir=rtl] .lp-display { line-height: 1.5; }
        .lp-root[dir=rtl] .lp-category-content strong { font-family: 'Noto Sans Arabic', sans-serif; letter-spacing: 0; }
        .lp-root[dir=rtl] .lp-modal-copy .lp-close { right: auto; left: 17px; }
        .lp-root[dir=rtl] .lp-hero-inner { direction: ltr; }
        .lp-root[dir=rtl] .lp-hero-copy { direction: rtl; }
        .lp-root[dir=rtl] .lp-mobile-nav button,
        .lp-root[dir=rtl] .lp-category-card { text-align: right; }
        .lp-root[dir=rtl] .lp-button > svg, .lp-root[dir=rtl] .lp-text-link > svg,
        .lp-root[dir=rtl] .lp-back-cart > svg { transform: scaleX(-1); }
        .lp-root[dir=rtl] .lp-wordmark, .lp-root[dir=rtl] input[type=email],
        .lp-root[dir=rtl] input[type=tel], .lp-root[dir=rtl] video { direction: ltr; }
        @media(max-width:680px) {
          .lp-topline { letter-spacing: .03em; font-size: 8px; line-height: 1.6; }
          .lp-language-select { font-size: 10px; }
          .lp-root[dir=rtl] .lp-hero h1 { font-size: 38px; line-height: 1.5; }
        }
      `}</style>
      <div className="lp-topline">
        <span>Free delivery on orders over KWD 25 · made for the ones you love</span>
        <select
          className="lp-language-select"
          aria-label="Choose language"
          data-testid="select-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as StoreLanguage)}
        >
          <option value="en" lang="en">English</option>
          <option value="ar" lang="ar">العربية</option>
        </select>
      </div>
      <header className="lp-header">
        <div className="lp-container lp-header-inner">
          <a href="#home" className="lp-logo" onClick={(event) => { event.preventDefault(); scrollTo("home"); }} aria-label="Lunapaws home">
            <BrandMark />
            <span className="lp-wordmark">LUNAPAWS</span>
          </a>
          <nav aria-label="Main navigation">
            {navLinks.map((link) => (
              <a className="lp-nav-link" key={link.target} href={`#${link.target}`} onClick={(event) => { event.preventDefault(); scrollTo(link.target); }}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="lp-header-actions">
            <div className="lp-search-wrap">
              <button className="lp-icon-button" aria-label={searchOpen ? "Close product search" : "Search products"} onClick={() => setSearchOpen((open) => !open)}>
                {searchOpen ? <X /> : <Search />}
              </button>
              {searchOpen && (
                <div className="lp-search-pop">
                  <input
                    autoFocus
                    aria-label="Search all products"
                    placeholder="Search thoughtful essentials..."
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveCategory("All");
                      setShowFavorites(false);
                    }}
                    onKeyDown={(event) => { if (event.key === "Enter") scrollTo("shop"); }}
                  />
                </div>
              )}
            </div>
            <button className="lp-icon-button" aria-label={`View favorites, ${favorites.length} items`} onClick={() => { setPanel("favorites"); setOrderPlaced(false); }}>
              <Heart />
              {favorites.length > 0 && <span className="lp-count">{favorites.length}</span>}
            </button>
            <button className="lp-icon-button" aria-label={`Open bag, ${cartCount} items`} onClick={() => setPanel("cart")}>
              <ShoppingBag />
              <span className="lp-count">{cartCount}</span>
            </button>
            <button className="lp-icon-button lp-menu-trigger" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} onClick={() => setMobileMenuOpen((open) => !open)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lp-mobile-nav">
            {navLinks.map((link) => <button key={link.target} onClick={() => scrollTo(link.target)}>{link.label}</button>)}
          </div>
        )}
      </header>

      <main>
        <section className="lp-hero" id="home">
          <SafeImage
            className="lp-hero-photo"
            src="/images/lunapaws-hero-british-shorthair.jpg"
            alt="A relaxed cat curled up in a sunlit, calm home"
            loading="eager"
          />
          <div className="lp-container lp-hero-inner">
            <div className="lp-hero-copy">
              <div className="lp-eyebrow">Made with a little more love</div>
              <h1 className="lp-display">Make Every Paw Feel <em>at Home.</em></h1>
              <p>Beautiful everyday essentials for your cat's comfort, play and care.</p>
              <button className="lp-button" onClick={() => scrollTo("shop")}>Shop Now <ArrowRight /></button>
              <div className="lp-hero-note">
                <span><ShieldCheck /> Gentle by design</span>
                <span><Sparkles /> Small details, big comfort</span>
              </div>
            </div>
          </div>
          <div className="lp-stamp"><strong>Little Paws<br />Big Love</strong></div>
        </section>

        <div className="lp-perks">
          <div className="lp-perk"><Truck /> Free delivery over KWD 25</div>
          <div className="lp-perk"><ShieldCheck /> Thoughtfully chosen materials</div>
          <div className="lp-perk"><Heart /> A little love in every order</div>
        </div>

        <section className="lp-section" id="categories">
          <div className="lp-container">
            <div className="lp-section-heading">
              <div>
                <div className="lp-eyebrow">A happy home starts here</div>
                <h2 className="lp-display">Find their new favourite.</h2>
                <p>Comfort, play and everyday care.</p>
              </div>
              <button className="lp-text-link" onClick={() => chooseCategory("All")}>Explore everything <ArrowRight /></button>
            </div>
            <div className="lp-category-grid">
              {CATEGORIES.map((category, index) => (
                <button key={category.name} className="lp-category-card" onClick={() => chooseCategory(category.name)} aria-label={`Shop ${category.name}`}>
                  <SafeImage src={category.image} alt={`${category.name} for cats`} />
                  <span className="lp-category-content">
                    <small dir="ltr">{String(index + 1).padStart(2, "0")}</small>
                    <strong>{category.name}</strong>
                    <span>{category.line}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-shop-section" id="shop">
          <div className="lp-container">
            <div className="lp-section-heading">
              <div>
                <div className="lp-eyebrow">{showFavorites ? "Saved with love" : "The considered collection"}</div>
                <h2 className="lp-display">{showFavorites ? "Your little wish list." : "Everyday, made lovely."}</h2>
                <p>{showFavorites ? "Your saved favourites, all together." : "Considered essentials. Happier cats."}</p>
              </div>
              <button className="lp-text-link" onClick={() => { setShowFavorites((show) => !show); setActiveCategory("All"); setQuery(""); }}>
                {showFavorites ? "Shop all pieces" : "View favourites"} <ArrowRight />
              </button>
            </div>
            <div className="lp-filter-row">
              <div className="lp-filter-pills" role="group" aria-label="Filter products by category">
                {(["All", ...CATEGORIES.map((item) => item.name)] as (Category | "All")[]).map((category) => (
                  <button className={`lp-filter-pill ${activeCategory === category ? "active" : ""}`} key={category} onClick={() => { setActiveCategory(category); setShowFavorites(false); }}>
                    {category === "All" ? "All essentials" : category}
                  </button>
                ))}
              </div>
              <div className="lp-filter-note">{visibleProducts.length} thoughtfully picked pieces</div>
            </div>
            <div className="lp-product-grid">
              {visibleProducts.length ? visibleProducts.map((product) => (
                <article className="lp-product-card" key={product.id} data-testid={`product-card-${product.id}`}>
                  <div className="lp-product-image">
                    <button className="lp-product-image-trigger" onClick={() => openProduct(product)} aria-label={`View ${product.name}`}>
                      <SafeImage src={product.image} alt={product.name} />
                    </button>
                    <button className={`lp-fav-button ${favorites.includes(product.id) ? "selected" : ""}`} aria-pressed={favorites.includes(product.id)} aria-label={favorites.includes(product.id) ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`} onClick={() => toggleFavorite(product.id)}>
                      <Heart fill={favorites.includes(product.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="lp-product-info">
                    <h3 className="lp-product-title"><button onClick={() => openProduct(product)}>{product.name}</button></h3>
                    <span className="lp-product-price">{formatPrice(product.price)}</span>
                    <AddToBagButton productId={product.id} productName={product.name} language={language} onAdd={() => addToCart(product)} />
                  </div>
                </article>
              )) : (
                <div className="lp-empty-products">
                  <Search />
                  <h3>Nothing here just yet.</h3>
                  <p>{showFavorites ? "Your favorites will find a home here when you save a piece." : "Try another search or browse all of our thoughtful essentials."}</p>
                  <button className="lp-button" onClick={() => { setQuery(""); setShowFavorites(false); setActiveCategory("All"); }}>See all essentials <ArrowRight /></button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="lp-promo">
          <div className="lp-container">
            <div className="lp-promo-inner">
              <div className="lp-promo-copy">
                <div className="lp-eyebrow">A softer kind of everyday</div>
                <h2 className="lp-display">Comfort, with a little character.</h2>
                <p>Soft places to nap. Thoughtful details for every day.</p>
                <button className="lp-button lp-button-light" onClick={() => chooseCategory("Cozy Beds")}>Make room for cozy <ArrowRight /></button>
              </div>
              <div className="lp-promo-art">
                <SafeImage src="https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=700" alt="A cat tucked into a soft, cozy bed" />
              </div>
            </div>
          </div>
        </section>

        <section className="lp-video-section" aria-labelledby="lp-video-title">
          <div className="lp-container">
            <div className="lp-section-heading">
              <div>
                <div className="lp-eyebrow">A little film from us</div>
                <h2 id="lp-video-title">Our Story in Motion</h2>
              </div>
              <p>A little world of comfort, joy and love for your cat.</p>
            </div>
            <div className="lp-video-window">
              <video
                controls
                playsInline
                preload="metadata"
                poster="/images/lunapaws-daybook-ad-poster.jpg"
                aria-label="LUNAPAWS advertisement video"
              >
                <source src={advertisementVideo} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            </div>
            <div className="lp-video-footer">
              <span className="lp-video-note">Little paws, big love — in every frame.</span>
              <button className="lp-button" onClick={() => scrollTo("shop")}>
                Explore Our Collection <ArrowRight />
              </button>
            </div>
          </div>
        </section>

        <section className="lp-about-section" id="about">
          <div className="lp-container lp-about-grid">
            <div className="lp-about-image">
              <SafeImage src="/images/lunapaws-hero-british-shorthair.jpg" alt="A loved gray British Shorthair sharing a quiet moment at home" />
              <div className="lp-about-mark">For the ones who make a house a home</div>
            </div>
            <div className="lp-about-copy">
              <div className="lp-eyebrow">A note from us</div>
              <h2 className="lp-display">Little Paws,<br />Big Love.</h2>
              <p>Everyday essentials, chosen with care. Soft fabrics, safer details and lasting quality — for the little paws that make your house a home.</p>
              <div className="lp-about-values">
                <div className="lp-about-value"><strong>01</strong><span>Considered materials</span></div>
                <div className="lp-about-value"><strong>02</strong><span>Made for real life</span></div>
                <div className="lp-about-value"><strong>03</strong><span>Always cat approved</span></div>
              </div>
              <button className="lp-text-link" onClick={() => scrollTo("newsletter")}>Come say hello <ArrowRight /></button>
            </div>
          </div>
        </section>

        <section className="lp-testimonials">
          <div className="lp-container">
            <div className="lp-section-heading">
              <div>
                <div className="lp-eyebrow">Notes from happy homes</div>
                <h2 className="lp-display">A little love, returned.</h2>
                <p>Good things are even better when they find the right paws.</p>
              </div>
              <span className="lp-text-link" aria-label="Rated 4.9 out of 5">Rated 4.9 by cat people <Star /></span>
            </div>
            <div className="lp-testimonial-grid">
              <article className="lp-testimonial primary">
                <div className="lp-quote-mark">“</div>
                <div className="lp-stars" aria-label="5 stars"><Star /><Star /><Star /><Star /><Star /></div>
                <p>Fig has been asleep in this beautiful bed since it arrived. It's officially her spot now.</p>
                <div className="lp-reviewer"><div className="lp-avatar">AM</div><div><strong>Amira M.</strong><span>Cat mum to Fig · Kuwait City</span></div></div>
              </article>
              <article className="lp-testimonial">
                <div className="lp-quote-mark">“</div>
                <div className="lp-stars" aria-label="5 stars"><Star /><Star /><Star /><Star /><Star /></div>
                <p>Beautiful bowls, a lovely glaze, and quality you can feel.</p>
                <div className="lp-reviewer"><div className="lp-avatar">SA</div><div><strong>Sarah A.</strong><span>Cat mum to Olive</span></div></div>
              </article>
              <article className="lp-testimonial">
                <div className="lp-quote-mark">“</div>
                <div className="lp-stars" aria-label="5 stars"><Star /><Star /><Star /><Star /><Star /></div>
                <p>Beautifully packed, delivered quickly, and a wonderfully soft collar. Will be back.</p>
                <div className="lp-reviewer"><div className="lp-avatar">NH</div><div><strong>Noor H.</strong><span>Cat mum to Miso</span></div></div>
              </article>
            </div>
          </div>
        </section>

        <section className="lp-newsletter" id="newsletter">
          <div className="lp-container lp-newsletter-inner">
            <div>
              <div className="lp-eyebrow">A letter for cat people</div>
              <h2 className="lp-display">Good things, once in a while.</h2>
              <p>New little joys, considered tips and a warm hello. No noise, promise.</p>
            </div>
            <form className="lp-newsletter-form" onSubmit={submitNewsletter}>
              <div className="lp-newsletter-controls">
                <input type="email" aria-label="Your email address" placeholder="Your email address" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} />
                <button type="submit">Count me in</button>
              </div>
              <div className="lp-newsletter-message" aria-live="polite">{newsletterMessage}</div>
            </form>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <a href="#home" className="lp-logo" onClick={(event) => { event.preventDefault(); scrollTo("home"); }} aria-label="Lunapaws home">
                <BrandMark light />
                <span className="lp-wordmark">LUNAPAWS</span>
              </a>
              <p>Thoughtful essentials for the little paws that make your whole world feel softer.</p>
              <div className="lp-socials">
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
                <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" aria-label="Pinterest"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21a9 9 0 1 0-3.8-.84M9.4 20.4c.7-1.9 1.5-4.2 1.9-5.7m-.7-3.2c0-2.8 3.8-3.2 3.8-.6 0 1.7-1.1 4.5-2.9 4.5-1.2 0-1.7-1.1-1.3-2.2" strokeLinecap="round"/></svg></a>
              </div>
            </div>
            <div className="lp-footer-col">
              <h3>Find your way</h3>
              <button onClick={() => scrollTo("home")}>Home</button>
              <button onClick={() => scrollTo("shop")}>Shop all</button>
              <button onClick={() => scrollTo("categories")}>Categories</button>
              <button onClick={() => scrollTo("about")}>Our story</button>
            </div>
            <div className="lp-footer-col">
              <h3>Here to help</h3>
              <a href="mailto:hello@lunapaws.example">Contact us</a>
              <a href="mailto:hello@lunapaws.example?subject=Shipping%20and%20returns">Shipping & returns</a>
              <a href="mailto:hello@lunapaws.example?subject=Care%20guide">Care guide</a>
              <a href="mailto:hello@lunapaws.example?subject=FAQs">FAQs</a>
            </div>
            <div className="lp-footer-col">
              <h3>Our little promise</h3>
              <p style={{ color: "rgba(255,248,240,.64)", fontSize: 9, lineHeight: 1.8, margin: 0 }}>Carefully chosen pieces. Honest details. A warmer, more thoughtful kind of everyday for you and your cat.</p>
            </div>
          </div>
          <div className="lp-footer-bottom"><span>© {new Date().getFullYear()} LUNAPAWS · Made for the ones you love.</span><span>LITTLE PAWS, BIG LOVE</span></div>
        </div>
      </footer>

      {panel && (
        <div className="lp-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(null); }}>
          {panel === "checkout" ? (
            <section className="lp-checkout" role="dialog" aria-modal="true" aria-labelledby="lp-checkout-title">
              <div className="lp-panel-head">
                <h2 id="lp-checkout-title">{orderPlaced ? "A little happy dance" : "Your details"}</h2>
                <button className="lp-close" aria-label="Close checkout" onClick={() => { setPanel(null); setOrderPlaced(false); }}><X /></button>
              </div>
              {orderPlaced ? (
                <div className="lp-success">
                  <div className="lp-success-mark"><Check /></div>
                  <h2>It's a demo order, but the love is real.</h2>
                  <p>Thanks, {contact.name || "friend"}. Your LUNAPAWS order has been placed in this prototype. No payment was taken.</p>
                  <button className="lp-button" onClick={() => { setPanel(null); setOrderPlaced(false); }}>Back to the good stuff <ArrowRight /></button>
                </div>
              ) : (
                <>
                  <form className="lp-panel-scroll lp-checkout-form" onSubmit={submitOrder}>
                    <div className="lp-demo-notice"><ShieldCheck /> <span><strong>Prototype checkout — no payment will be taken.</strong><br />This is a demo experience only. Your details stay in this browser session.</span></div>
                    <label>Full name<input required value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} placeholder="Your name" autoComplete="name" /></label>
                    <label>Email address<input required type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} placeholder="you@example.com" autoComplete="email" /></label>
                    <label>Delivery address<input required value={contact.address} onChange={(event) => setContact({ ...contact, address: event.target.value })} placeholder="Street and building" autoComplete="street-address" /></label>
                    <div className="lp-form-row">
                      <label>City<input required value={contact.city} onChange={(event) => setContact({ ...contact, city: event.target.value })} placeholder="Kuwait City" autoComplete="address-level2" /></label>
                      <label>Phone<input required type="tel" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} placeholder="+965" autoComplete="tel" /></label>
                    </div>
                    <div className="lp-checkout-summary">
                      <div><span>Items</span><span>{cartCount}</span></div>
                      <div><span>Delivery</span><span>{subtotal >= 25 ? "On us" : "KWD 1.500"}</span></div>
                      <div><span>Demo total</span><span>{formatPrice(subtotal + (subtotal >= 25 || subtotal === 0 ? 0 : 1.5))}</span></div>
                    </div>
                    <button className="lp-button lp-full-button" type="submit">Place demo order <ArrowRight /></button>
                  </form>
                  <button className="lp-back-cart" onClick={() => setPanel("cart")}><ArrowLeft /> Back to your bag</button>
                </>
              )}
            </section>
          ) : (
            <section className="lp-panel" role="dialog" aria-modal="true" aria-labelledby="lp-panel-title">
              <div className="lp-panel-head">
                <h2 id="lp-panel-title">{panel === "cart" ? `Your bag (${cartCount})` : `Saved pieces (${favorites.length})`}</h2>
                <button className="lp-close" aria-label="Close panel" onClick={() => setPanel(null)}><X /></button>
              </div>
              {panel === "cart" ? (
                cart.length ? (
                  <>
                    <div className="lp-panel-scroll">
                      {cart.map((item) => {
                        const product = PRODUCTS.find((entry) => entry.id === item.productId);
                        if (!product) return null;
                        return (
                          <div className="lp-cart-row" key={item.productId}>
                            <SafeImage src={product.image} alt={product.name} />
                            <div>
                              <h3>{product.name}</h3>
                              <p>{formatPrice(product.price)}</p>
                              <div className="lp-quantity">
                                <button aria-label={`Decrease ${product.name} quantity`} onClick={() => updateQuantity(product.id, -1)}><Minus /></button>
                                <span>{item.quantity}</span>
                                <button aria-label={`Increase ${product.name} quantity`} onClick={() => updateQuantity(product.id, 1)}><Plus /></button>
                              </div>
                            </div>
                            <button className="lp-remove" aria-label={`Remove ${product.name}`} onClick={() => setCart((current) => current.filter((entry) => entry.productId !== product.id))}><X /></button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="lp-panel-bottom">
                      <div className="lp-subtotal"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                      <small>Delivery calculated at checkout. Free delivery on orders over KWD 25.</small>
                      <button className="lp-button lp-full-button" onClick={() => { setOrderPlaced(false); setPanel("checkout"); }}>Continue to demo checkout <ArrowRight /></button>
                    </div>
                  </>
                ) : (
                  <div className="lp-empty-state"><ShoppingBag /><h3>Your bag is taking a nap.</h3><p>Find something soft, lovely or wonderfully practical for your favourite little person.</p><button className="lp-button" onClick={() => { setPanel(null); scrollTo("shop"); }}>Explore the shop <ArrowRight /></button></div>
                )
              ) : (
                favorites.length ? (
                  <>
                    <div className="lp-panel-scroll">
                      {PRODUCTS.filter((product) => favorites.includes(product.id)).map((product) => (
                        <div className="lp-cart-row" key={product.id}>
                          <SafeImage src={product.image} alt={product.name} />
                          <div><h3>{product.name}</h3><p>{formatPrice(product.price)}</p><AddToBagButton productId={product.id} productName={product.name} language={language} onAdd={() => addToCart(product)} /></div>
                          <button className="lp-remove" aria-label={`Remove ${product.name} from favorites`} onClick={() => toggleFavorite(product.id)}><Heart fill="currentColor" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="lp-panel-bottom"><button className="lp-button lp-full-button" onClick={() => { setPanel(null); setShowFavorites(true); scrollTo("shop"); }}>Browse your favorites <ArrowRight /></button></div>
                  </>
                ) : (
                  <div className="lp-empty-state"><Heart /><h3>Keep the good ones close.</h3><p>Tap the little heart on anything that feels just right for your cat.</p><button className="lp-button" onClick={() => { setPanel(null); scrollTo("shop"); }}>Find a favourite <ArrowRight /></button></div>
                )
              )}
            </section>
          )}
        </div>
      )}

      {selectedProduct && (
        <div className="lp-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section className="lp-product-modal" role="dialog" aria-modal="true" aria-labelledby="lp-product-modal-title">
            <div className="lp-modal-image"><SafeImage src={selectedProduct.image} alt={selectedProduct.name} loading="eager" /></div>
            <div className="lp-modal-copy">
              <button className="lp-close" aria-label="Close product details" onClick={() => setSelectedProduct(null)}><X /></button>
              <div className="lp-eyebrow">{selectedProduct.category}</div>
              <h2 id="lp-product-modal-title">{selectedProduct.name}</h2>
              <div className="lp-rating"><Star /> {selectedProduct.rating.toFixed(1)} <span>({selectedProduct.reviews} happy homes)</span></div>
              <p>{selectedProduct.description}</p>
              <div className="lp-modal-price">{formatPrice(selectedProduct.price)}</div>
              <div className="lp-modal-actions">
                <div className="lp-quantity">
                  <button aria-label="Decrease quantity" onClick={() => setDetailQuantity((quantity) => Math.max(1, quantity - 1))}><Minus /></button>
                  <span>{detailQuantity}</span>
                  <button aria-label="Increase quantity" onClick={() => setDetailQuantity((quantity) => quantity + 1)}><Plus /></button>
                </div>
                <button className="lp-button" onClick={() => { addToCart(selectedProduct, detailQuantity); setSelectedProduct(null); }}>Add to bag <ShoppingBag /></button>
              </div>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="lp-toast" role="status"><Check /> {toast}</div>}
    </div>
  ), language);
}
