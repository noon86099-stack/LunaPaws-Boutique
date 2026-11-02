import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, Heart, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import advertisementVideo from "../../../../../../attached_assets/0_LunaPaws_Ad_1793645838002.mp4";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  note: string;
};

const products: Product[] = [
  { id: 1, name: "The Sunday Cloud Bed", category: "Rest", price: 28.5, image: "/__mockup/images/lunapaws-product-sunday-cloud-bed.jpg", note: "For the serious afternoon napper." },
  { id: 2, name: "Moss & Mellow Cushion", category: "Rest", price: 22.75, image: "/__mockup/images/lunapaws-product-moss-cushion.jpg", note: "A soft landing, wherever they roam." },
  { id: 3, name: "Little Orbit Play Set", category: "Play", price: 8.9, image: "/__mockup/images/lunapaws-product-orbit-play-set.jpg", note: "Three small things. A whole lot of chase." },
  { id: 4, name: "Tumbleweed Scratcher", category: "Play", price: 16.25, image: "/__mockup/images/lunapaws-product-tumbleweed-scratcher.jpg", note: "A good scratch, in a good-looking shape." },
  { id: 5, name: "The Dune Everyday Collar", category: "Out & about", price: 6.75, image: "/__mockup/images/lunapaws-product-dune-collar.jpg", note: "Easy on, easy off, every day." },
  { id: 6, name: "Poppy Bow Collar", category: "Out & about", price: 7.5, image: "/__mockup/images/lunapaws-product-poppy-bow-collar.jpg", note: "A little dressed up. Still very much a cat." },
  { id: 7, name: "Pebble Ceramic Bowl", category: "Mealtime", price: 11.25, image: "/__mockup/images/lunapaws-product-pebble-ceramic-bowl.jpg", note: "A quieter kind of everyday ritual." },
  { id: 8, name: "Sage Slow-Supper Bowl", category: "Mealtime", price: 13.4, image: "/__mockup/images/lunapaws-product-sage-slow-bowl.jpg", note: "For the enthusiastic little eater." },
];

const rituals = [
  { id: "morning", time: "08:15", title: "The slow morning", cue: "A little stretch. A long look out the window.", productIds: [5, 1], label: "START SOFTLY", tint: "#e9e5d7" },
  { id: "play", time: "11:40", title: "The pounce hour", cue: "That sudden burst of absolutely nowhere to be.", productIds: [3, 4], label: "LET IT OUT", tint: "#e6ddcf" },
  { id: "nap", time: "14:20", title: "The sunbeam shift", cue: "Follow the light. Claim the warmest square.", productIds: [1, 2], label: "NAP, PROPERLY", tint: "#e9e2da" },
  { id: "supper", time: "18:05", title: "Supper, unhurried", cue: "A small ceremony for the very important bowl.", productIds: [7, 8], label: "DINNER IS SERVED", tint: "#dfe7df" },
];

const money = (n: number) => `KWD ${n.toFixed(3)}`;

export function LunapawsDaybook() {
  const [activeRitual, setActiveRitual] = useState(rituals[0].id);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [category, setCategory] = useState("Everything");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const ritual = rituals.find((item) => item.id === activeRitual) ?? rituals[0];
  const featured = products.find((item) => item.id === ritual.productIds[0])!;
  const recommended = ritual.productIds.map((id) => products.find((item) => item.id === id)!);
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const subtotal = products.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0);
  const filtered = useMemo(() => products.filter((item) => {
    const matchesCategory = category === "Everything" || item.category === category;
    const matchesQuery = `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const add = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    setNotice(`${product.name} is in your bag`);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const changeQty = (id: number, change: number) => {
    setCart((current) => {
      const next = { ...current, [id]: Math.max(0, (current[id] ?? 0) + change) };
      if (!next[id]) delete next[id];
      return next;
    });
  };
  const toggleFavorite = (id: number) => setFavorites((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);

  return (
    <main className="ldb">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap');
        .ldb{--paper:#f8f5ee;--ink:#293d35;--moss:#355348;--clay:#c97f62;--muted:#80877d;--line:#e5dfd4;--cream:#fffdf7;min-height:100vh;background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif;overflow:hidden}
        .ldb *{box-sizing:border-box}.ldb button,.ldb input{font:inherit}.ldb button{color:inherit}
        .ldb button:focus-visible,.ldb input:focus-visible{outline:2px solid var(--clay);outline-offset:3px}
        .ldb-top{height:32px;background:var(--moss);color:#f8f5ee;display:flex;align-items:center;justify-content:center;font:10px 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase}
        .ldb-nav{height:72px;padding:0 clamp(20px,6vw,86px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);background:var(--paper)}
        .ldb-brand{display:flex;align-items:center;gap:10px;color:var(--moss);font-size:14px;letter-spacing:.2em;font-weight:700}
        .ldb-moon{height:29px;width:29px;border:1px solid var(--clay);border-radius:50%;display:grid;place-items:center;font:18px 'Playfair Display',serif;color:var(--clay)}
        .ldb-navnote{font:10px 'DM Mono',monospace;letter-spacing:.1em;color:var(--muted);text-transform:uppercase}
        .ldb-nav-actions{display:flex;align-items:center;gap:8px}
        .ldb-icon{width:40px;height:40px;display:grid;place-items:center;border:0;background:transparent;cursor:pointer;position:relative}
        .ldb-icon svg{width:18px;height:18px;stroke-width:1.5}.ldb-count{position:absolute;top:2px;right:0;background:var(--clay);color:white;min-width:16px;height:16px;border-radius:20px;display:grid;place-items:center;font:9px 'DM Mono',monospace;padding:0 4px}
        .ldb-wrap{width:min(1280px,calc(100% - 64px));margin:0 auto}
        .ldb-intro{display:flex;align-items:end;justify-content:space-between;padding:45px 0 26px;gap:30px}
        .ldb-kicker{display:flex;align-items:center;gap:9px;font:10px 'DM Mono',monospace;letter-spacing:.14em;color:var(--clay);text-transform:uppercase}
        .ldb-kicker:before{content:'';width:22px;height:1px;background:currentColor}
        .ldb-intro h1{font:500 clamp(34px,5vw,58px)/1.02 'Playfair Display',serif;letter-spacing:-.035em;margin:13px 0 0;color:var(--moss)}
        .ldb-intro h1 em{font-weight:500;color:var(--clay)}
        .ldb-intro-aside{max-width:270px;color:var(--muted);font-size:12px;line-height:1.75;padding-bottom:3px}
        .ldb-daybook{display:grid;grid-template-columns:276px minmax(0,1fr);border:1px solid var(--line);background:var(--cream);min-height:464px}
        .ldb-rail{padding:25px 20px;border-right:1px solid var(--line);background:#f5f1e9}
        .ldb-rail-head{display:flex;align-items:center;justify-content:space-between;margin:0 0 19px;font:10px 'DM Mono',monospace;letter-spacing:.09em;color:var(--muted);text-transform:uppercase}
        .ldb-rail-head span:last-child{color:var(--clay)}
        .ldb-ritual{display:grid;grid-template-columns:49px 1fr;gap:10px;position:relative;width:100%;text-align:left;padding:12px 10px 14px;border:0;border-left:1px solid #d8d0c5;background:transparent;cursor:pointer;transition:background .2s}
        .ldb-ritual:before{content:'';position:absolute;left:-4px;top:17px;width:7px;height:7px;border-radius:50%;background:#c5bbae;transition:background .2s}
        .ldb-ritual.active{background:#fffaf1;border-left:1px solid var(--clay)}
        .ldb-ritual.active:before{background:var(--clay)}
        .ldb-time{font:10px 'DM Mono',monospace;color:#a09c91;padding-top:3px}
        .ldb-ritual strong{display:block;font:500 14px 'Playfair Display',serif;color:var(--moss)}
        .ldb-ritual small{display:block;margin-top:5px;color:#888b80;font-size:10px;line-height:1.45}
        .ldb-ritual.active strong{color:var(--clay)}
        .ldb-rail-foot{display:flex;gap:8px;align-items:center;margin:23px 0 0;padding-top:17px;border-top:1px solid var(--line);font:9px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
        .ldb-rail-foot svg{color:var(--clay);width:14px;height:14px}
        .ldb-feature{display:grid;grid-template-columns:minmax(0,1fr) 42%;min-height:464px}
        .ldb-feature-copy{padding:clamp(27px,5vw,62px) clamp(25px,5vw,67px);display:flex;flex-direction:column;align-items:flex-start;justify-content:center}
        .ldb-feature-label{font:10px 'DM Mono',monospace;letter-spacing:.14em;color:var(--clay)}
        .ldb-feature h2{font:500 clamp(32px,4vw,49px)/1.03 'Playfair Display',serif;letter-spacing:-.035em;color:var(--moss);margin:15px 0 12px}
        .ldb-feature-copy>p{font-size:13px;line-height:1.75;color:var(--muted);max-width:325px;margin:0}
        .ldb-feature-product{margin-top:25px;padding-top:18px;border-top:1px solid var(--line);width:min(100%,360px);display:flex;align-items:center;justify-content:space-between;gap:15px}
        .ldb-feature-product small{display:block;font:9px 'DM Mono',monospace;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;margin-bottom:5px}
        .ldb-feature-product strong{font:500 16px 'Playfair Display',serif;color:var(--moss)}
        .ldb-feature-product .price{display:block;margin-top:5px;color:var(--clay);font:10px 'DM Mono',monospace}
        .ldb-add{display:flex;align-items:center;gap:8px;border:1px solid var(--moss);background:var(--moss);color:#fffdf7!important;padding:12px 16px;cursor:pointer;font-size:10px;font-weight:600;transition:background .2s}
        .ldb-add:hover{background:#223b31}.ldb-add svg{width:14px;height:14px}
        .ldb-image{position:relative;min-height:100%;overflow:hidden;background:#e9dfd3}
        .ldb-image img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover;transition:opacity .3s,transform .8s}
        .ldb-image:hover img{transform:scale(1.025)}
        .ldb-image-caption{position:absolute;right:17px;bottom:17px;padding:8px 11px;background:rgba(255,253,247,.9);font:9px 'DM Mono',monospace;letter-spacing:.08em;color:var(--moss);text-transform:uppercase}
        .ldb-recommend{padding:25px 0 54px}
        .ldb-rec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
        .ldb-rec-head span{font:10px 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
        .ldb-rec-head b{font-weight:500;color:var(--moss)}
        .ldb-rec-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .ldb-rec-card{display:flex;align-items:center;gap:14px;padding:10px 14px 10px 10px;background:#f2ede4;border:1px solid transparent;transition:border .2s}
        .ldb-rec-card:hover{border-color:#d8cbb9}
        .ldb-rec-thumb{width:76px;height:72px;flex:none;object-fit:cover;background:#e6ddd1}
        .ldb-rec-detail{min-width:0;flex:1}
        .ldb-rec-detail small{font:9px 'DM Mono',monospace;color:var(--clay);text-transform:uppercase;letter-spacing:.08em}
        .ldb-rec-detail strong{display:block;margin:4px 0;font:500 15px 'Playfair Display',serif;color:var(--moss)}
        .ldb-rec-detail span{font-size:10px;color:var(--muted)}
        .ldb-rec-add{border:0;background:transparent;padding:8px;cursor:pointer;color:var(--moss)}
        .ldb-rec-add svg{width:17px;height:17px}
        .ldb-shop{background:#eee9df;padding:66px 0 76px}
        .ldb-shop-top{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:25px}
        .ldb-shop-top h2{font:500 clamp(29px,4vw,40px)/1.1 'Playfair Display',serif;color:var(--moss);margin:10px 0 0}
        .ldb-shop-top p{font-size:11px;color:var(--muted);margin:8px 0 0}
        .ldb-search{width:min(270px,100%);display:flex;border-bottom:1px solid #c8c0b3;align-items:center}
        .ldb-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        .ldb-search svg{width:15px;height:15px;color:var(--muted)}
        .ldb-search input{width:100%;border:0;background:transparent;padding:10px;color:var(--ink);font-size:11px;outline:none}
        .ldb-filters{display:flex;gap:7px;overflow:auto;margin-bottom:22px;padding-bottom:4px}
        .ldb-filter{white-space:nowrap;border:1px solid #d7d0c5;background:transparent;color:#737970;padding:8px 12px;font:9px 'DM Mono',monospace;cursor:pointer;transition:all .2s}
        .ldb-filter.active,.ldb-filter:hover{background:var(--moss);border-color:var(--moss);color:#fffdf7}
        .ldb-product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}
        .ldb-product{background:var(--cream);position:relative}
        .ldb-product-photo{height:200px;position:relative;overflow:hidden;background:#e6ddd1}
        .ldb-product-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s}
        .ldb-product:hover .ldb-product-photo img{transform:scale(1.04)}
        .ldb-heart{position:absolute;right:10px;top:10px;width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,253,247,.92);display:grid;place-items:center;cursor:pointer}
        .ldb-heart svg{width:15px;height:15px;stroke-width:1.5}.ldb-heart.liked{color:var(--clay)}
        .ldb-product-info{padding:13px 14px 15px}
        .ldb-product-info small{font:9px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em;color:#99978b}
        .ldb-product-line{display:flex;justify-content:space-between;gap:8px;margin:7px 0 5px}
        .ldb-product-line strong{font:500 15px 'Playfair Display',serif;color:var(--moss)}
        .ldb-product-line span{font:9px 'DM Mono',monospace;color:var(--clay);white-space:nowrap;padding-top:3px}
        .ldb-product-info p{margin:0;min-height:31px;font-size:10px;color:var(--muted);line-height:1.5}
        .ldb-product-info .ldb-add{width:100%;justify-content:center;margin-top:12px;padding:10px;font-size:9px}
        .ldb-empty{grid-column:1/-1;text-align:center;padding:50px 20px;color:var(--muted);border:1px dashed #c8c0b3}
        .ldb-empty strong{display:block;font:500 22px 'Playfair Display',serif;color:var(--moss);margin-bottom:7px}
        .ldb-story{padding:57px 0 62px;background:var(--moss);color:#f8f5ee}
        .ldb-story-inner{display:flex;align-items:center;justify-content:space-between;gap:35px}
        .ldb-story .ldb-kicker{color:#e3b295}
        .ldb-story h2{font:500 clamp(28px,4vw,42px)/1.1 'Playfair Display',serif;margin:13px 0 8px}
        .ldb-story p{max-width:450px;color:#d1d5c9;font-size:11px;line-height:1.8;margin:0}
        .ldb-story-mark{font:italic 500 44px 'Playfair Display',serif;color:#e3b295;white-space:nowrap}
        .ldb-film{padding:20px 0 60px;background:var(--paper)}
        .ldb-film-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:22px}
        .ldb-film-head h2{font:500 clamp(30px,4vw,42px)/1.08 'Playfair Display',serif;letter-spacing:-.03em;color:var(--moss);margin:11px 0 0}
        .ldb-film-head p{max-width:370px;color:var(--muted);font-size:12px;line-height:1.7;margin:0 0 3px}
        .ldb-film-window{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:18px;background:var(--moss);box-shadow:0 18px 48px rgba(41,61,53,.12)}
        .ldb-film-window video{display:block;width:100%;height:100%;object-fit:contain;background:var(--moss)}
        .ldb-film-foot{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:20px}
        .ldb-film-note{font:9px 'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
        .ldb-film-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--moss);background:var(--moss);color:#fffdf7!important;padding:13px 17px;cursor:pointer;font-size:10px;font-weight:600;transition:background .2s,transform .2s}
        .ldb-film-cta:hover{background:#223b31;transform:translateY(-1px)}
        .ldb-film-cta svg{width:14px;height:14px}
        .ldb-footer{padding:22px clamp(20px,6vw,86px);display:flex;justify-content:space-between;align-items:center;color:#878b80;font:9px 'DM Mono',monospace;letter-spacing:.07em}
        .ldb-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:10;background:var(--moss);color:#fffdf7;padding:12px 18px;font-size:11px;box-shadow:0 8px 25px #293d3526;animation:ldb-in .2s ease-out}
        @keyframes ldb-in{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
        .ldb-overlay{position:fixed;inset:0;background:#1e302c70;z-index:20;display:flex;justify-content:flex-end}
        .ldb-drawer{width:min(420px,100%);height:100%;background:var(--paper);padding:25px;display:flex;flex-direction:column;animation:ldb-drawer-in .25s ease-out}
        @keyframes ldb-drawer-in{from{opacity:.5;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
        .ldb-drawer-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:1px solid var(--line)}
        .ldb-drawer-head h2{font:500 28px 'Playfair Display',serif;margin:0;color:var(--moss)}
        .ldb-close{border:0;background:transparent;width:36px;height:36px;cursor:pointer;display:grid;place-items:center}
        .ldb-cart-list{overflow:auto;flex:1}
        .ldb-cart-row{display:flex;align-items:center;gap:13px;padding:17px 0;border-bottom:1px solid var(--line)}
        .ldb-cart-row img{width:66px;height:66px;object-fit:cover}
        .ldb-cart-item{flex:1}.ldb-cart-item strong{display:block;font:500 14px 'Playfair Display',serif;color:var(--moss)}
        .ldb-cart-item small{display:block;margin-top:5px;font:9px 'DM Mono',monospace;color:var(--clay)}
        .ldb-qty{display:flex;align-items:center;gap:8px;font:10px 'DM Mono',monospace}
        .ldb-qty button{width:24px;height:24px;border:1px solid var(--line);background:transparent;display:grid;place-items:center;cursor:pointer}
        .ldb-qty svg{width:12px;height:12px}
        .ldb-cart-empty{margin:auto;text-align:center;color:var(--muted);font-size:12px;line-height:1.7}
        .ldb-cart-empty svg{display:block;margin:0 auto 14px;color:var(--clay)}
        .ldb-cart-empty strong{display:block;font:500 22px 'Playfair Display',serif;color:var(--moss)}
        .ldb-cart-foot{padding-top:18px;border-top:1px solid var(--line)}
        .ldb-total{display:flex;justify-content:space-between;font:12px 'DM Mono',monospace;color:var(--moss);margin-bottom:14px}
        .ldb-checkout{width:100%;justify-content:center}
        @media(max-width:900px){.ldb-wrap{width:min(100% - 40px,720px)}.ldb-daybook{grid-template-columns:220px 1fr}.ldb-feature{grid-template-columns:1fr 40%}.ldb-rail{padding:22px 14px}.ldb-ritual{grid-template-columns:42px 1fr;padding-inline:8px}.ldb-product-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ldb-product-photo{height:230px}}
         @media(max-width:640px){.ldb-top{font-size:8px}.ldb-nav{height:62px;padding:0 17px}.ldb-navnote{display:none}.ldb-brand{font-size:12px}.ldb-wrap{width:calc(100% - 32px)}.ldb-intro{padding:33px 0 19px;display:block}.ldb-intro h1{font-size:40px}.ldb-intro-aside{margin-top:12px;font-size:11px}.ldb-daybook{display:flex;flex-direction:column}.ldb-rail{order:2;border:0;border-top:1px solid var(--line);padding:15px 12px}.ldb-rail-head{margin:0 0 10px}.ldb-rituals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.ldb-ritual{grid-template-columns:38px 1fr;padding:10px 6px}.ldb-ritual small{font-size:9px}.ldb-rail-foot{margin-top:10px;padding-top:10px}.ldb-feature{display:flex;flex-direction:column-reverse;min-height:0}.ldb-image{height:270px;min-height:270px}.ldb-feature-copy{padding:24px 21px 25px}.ldb-feature h2{font-size:37px;margin:11px 0 8px}.ldb-feature-copy>p{font-size:12px}.ldb-feature-product{margin-top:18px;padding-top:14px}.ldb-rec-grid{grid-template-columns:1fr}.ldb-recommend{padding:20px 0 42px}.ldb-rec-card{padding:9px}.ldb-rec-thumb{width:65px;height:62px}.ldb-shop{padding:45px 0 52px}.ldb-shop-top{display:block}.ldb-search{margin-top:17px;width:100%}.ldb-product-grid{gap:9px}.ldb-product-photo{height:clamp(140px,43vw,220px)}.ldb-product-info{padding:10px}.ldb-product-line{display:block;margin:6px 0}.ldb-product-line span{display:block}.ldb-product-info p{font-size:9px}.ldb-product-info .ldb-add{margin-top:9px}.ldb-film{padding:4px 0 42px}.ldb-film-head{display:block;margin-bottom:14px}.ldb-film-head h2{font-size:34px}.ldb-film-head p{margin-top:10px;font-size:11px}.ldb-film-window{border-radius:12px}.ldb-film-foot{align-items:stretch;flex-direction:column;margin-top:14px}.ldb-film-note{font-size:8px}.ldb-film-cta{width:100%;min-height:44px}.ldb-story{padding:39px 0}.ldb-story-inner{display:block}.ldb-story-mark{display:block;margin-top:25px;font-size:35px}.ldb-footer{padding:18px;gap:12px;flex-wrap:wrap;font-size:8px}}
        @media(prefers-reduced-motion:reduce){.ldb *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
      `}</style>

      <div className="ldb-top">Free delivery on orders over KWD 25 <span style={{ margin: "0 10px", opacity: .45 }}>·</span> A little extra joy, on us</div>
      <header className="ldb-nav">
        <div className="ldb-brand"><span className="ldb-moon">☾</span> LUNAPAWS</div>
        <div className="ldb-navnote">A day, made softer</div>
        <div className="ldb-nav-actions">
          <button className="ldb-icon" aria-label="Open shopping bag" onClick={() => setCartOpen(true)}><ShoppingBag />{count > 0 && <span className="ldb-count">{count}</span>}</button>
        </div>
      </header>

      <div className="ldb-wrap">
        <section className="ldb-intro">
          <div><div className="ldb-kicker">The LUNAPAWS daybook</div><h1>Little rituals.<br /><em>Better cat days.</em></h1></div>
          <div className="ldb-intro-aside">A day with a cat is made of small, important things. Find the one that feels like right now.</div>
        </section>

        <section className="ldb-daybook" aria-label="Explore products by daily ritual">
          <aside className="ldb-rail">
            <div className="ldb-rail-head"><span>Pick a moment</span><span>01 — 04</span></div>
            <div className="ldb-rituals">
              {rituals.map((item) => (
                <button key={item.id} className={`ldb-ritual ${activeRitual === item.id ? "active" : ""}`} onClick={() => setActiveRitual(item.id)}>
                  <span className="ldb-time">{item.time}</span><span><strong>{item.title}</strong><small>{item.cue}</small></span>
                </button>
              ))}
            </div>
            <div className="ldb-rail-foot"><Sparkles />Thoughtful things for the in-between</div>
          </aside>
          <div className="ldb-feature">
            <div className="ldb-feature-copy">
              <div className="ldb-feature-label">{ritual.label} · {ritual.time}</div>
              <h2>{ritual.title}</h2>
              <p>{ritual.cue} We found a few small comforts for this particular part of the day.</p>
              <div className="ldb-feature-product">
                <div><small>Today's little essential</small><strong>{featured.name}</strong><span className="price">{money(featured.price)}</span></div>
                <button className="ldb-add" onClick={() => add(featured)}>Add <Plus /></button>
              </div>
            </div>
            <div className="ldb-image" style={{ backgroundColor: ritual.tint }} key={featured.id}>
              <img src={featured.image} alt={featured.name} />
              <div className="ldb-image-caption">A small joy, chosen for {ritual.title.toLowerCase()}</div>
            </div>
          </div>
        </section>

        <section className="ldb-recommend">
          <div className="ldb-rec-head"><span>For this moment</span><span><b>02 thoughtful finds</b> · chosen by the daybook</span></div>
          <div className="ldb-rec-grid">
            {recommended.map((item) => (
              <article className="ldb-rec-card" key={item.id}>
                <img className="ldb-rec-thumb" src={item.image} alt="" />
                <div className="ldb-rec-detail"><small>{item.category}</small><strong>{item.name}</strong><span>{money(item.price)}</span></div>
                <button className="ldb-rec-add" aria-label={`Add ${item.name} to bag`} onClick={() => add(item)}><Plus /></button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="ldb-shop" id="collection">
        <div className="ldb-wrap">
          <div className="ldb-shop-top">
            <div><div className="ldb-kicker">The whole little world</div><h2>Good things for every day.</h2><p>Made for curious paws, long naps and the people who love them.</p></div>
            <label className="ldb-search"><span className="ldb-sr-only">Search the collection</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find something lovely…" /></label>
          </div>
          <div className="ldb-filters">
            {["Everything", "Rest", "Play", "Out & about", "Mealtime"].map((item) => <button key={item} className={`ldb-filter ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="ldb-product-grid">
            {filtered.length ? filtered.map((item) => (
              <article className="ldb-product" key={item.id}>
                <div className="ldb-product-photo"><img src={item.image} alt={item.name} /><button aria-label={`${favorites.includes(item.id) ? "Remove" : "Save"} ${item.name} ${favorites.includes(item.id) ? "from" : "to"} favorites`} className={`ldb-heart ${favorites.includes(item.id) ? "liked" : ""}`} onClick={() => toggleFavorite(item.id)}><Heart fill={favorites.includes(item.id) ? "currentColor" : "none"} /></button></div>
                <div className="ldb-product-info"><small>{item.category}</small><div className="ldb-product-line"><strong>{item.name}</strong><span>{money(item.price)}</span></div><p>{item.note}</p><button className="ldb-add" onClick={() => add(item)}>Add to bag <ArrowRight /></button></div>
              </article>
            )) : <div className="ldb-empty"><strong>Nothing in this little corner.</strong>Try another search or choose a different moment.</div>}
          </div>
        </div>
      </section>

      <section className="ldb-film" aria-labelledby="ldb-film-title">
        <div className="ldb-wrap">
          <div className="ldb-film-head">
            <div>
              <div className="ldb-kicker">A little film from us</div>
              <h2 id="ldb-film-title">Our Story in Motion</h2>
            </div>
            <p>A little world of comfort, joy and love for your cat.</p>
          </div>
          <div className="ldb-film-window">
            <video controls playsInline preload="none" poster="/__mockup/images/lunapaws-daybook-ad-poster.jpg" aria-label="LUNAPAWS advertisement video">
              <source src={advertisementVideo} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
          <div className="ldb-film-foot">
            <span className="ldb-film-note">Little paws, big love — in every frame.</span>
            <button className="ldb-film-cta" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Explore Our Collection <ArrowDown />
            </button>
          </div>
        </div>
      </section>

      <section className="ldb-story">
        <div className="ldb-wrap ldb-story-inner">
          <div><div className="ldb-kicker">A note from us</div><h2>Small comforts. Big, quiet love.</h2><p>We make everyday essentials with a softer touch: considered materials, useful details, and room for the lovely oddness of being a cat.</p></div>
          <div className="ldb-story-mark">For the moonlit ones.</div>
        </div>
      </section>
      <footer className="ldb-footer"><span>© LUNAPAWS · MADE FOR LIFE TOGETHER</span><span>KUWAIT CITY · KWD</span></footer>

      {notice && <div className="ldb-toast" role="status"><Check size={14} style={{ verticalAlign: "middle", marginRight: 7 }} />{notice}</div>}
      {cartOpen && <div className="ldb-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <aside className="ldb-drawer" aria-label="Shopping bag">
          <div className="ldb-drawer-head"><h2>Your little bag <span style={{ color: "var(--clay)" }}>({count})</span></h2><button className="ldb-close" onClick={() => setCartOpen(false)} aria-label="Close bag"><X /></button></div>
          <div className="ldb-cart-list">
            {count ? products.filter((item) => cart[item.id]).map((item) => (
              <div className="ldb-cart-row" key={item.id}><img src={item.image} alt="" /><div className="ldb-cart-item"><strong>{item.name}</strong><small>{money(item.price)}</small></div><div className="ldb-qty"><button aria-label="Remove one" onClick={() => changeQty(item.id, -1)}><Minus /></button><span>{cart[item.id]}</span><button aria-label="Add one" onClick={() => changeQty(item.id, 1)}><Plus /></button></div></div>
            )) : <div className="ldb-cart-empty"><ShoppingBag size={25} /><strong>Room for a little joy.</strong>Your bag is waiting for its first good thing.</div>}
          </div>
          {count > 0 && <div className="ldb-cart-foot"><div className="ldb-total"><span>Subtotal</span><span>{money(subtotal)}</span></div><button className="ldb-add ldb-checkout" onClick={() => { setCart({}); setCartOpen(false); setNotice("Your order is all set. Thank you!"); window.setTimeout(() => setNotice(""), 2600); }}>Continue to checkout <ArrowDown /></button></div>}
        </aside>
      </div>}
    </main>
  );
}
