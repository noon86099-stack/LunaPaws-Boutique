import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  type: string;
  price: string;
  image: string;
  note: string;
  category: string;
};

const products: Product[] = [
  { id: 1, name: "The Sunday Cloud Bed", type: "Soft landing", price: "28.500", image: "/__mockup/images/lunapaws-stillroom-bed.png", note: "Bouclé · oat milk", category: "Rest" },
  { id: 2, name: "Pebble Ceramic Bowl", type: "Daily ritual", price: "11.250", image: "/__mockup/images/lunapaws-stillroom-bowl.png", note: "Hand-glazed stoneware", category: "Ritual" },
  { id: 3, name: "Little Orbit Play Set", type: "Bright idea", price: "8.900", image: "/__mockup/images/lunapaws-stillroom-toy.png", note: "Felted wool · 3 pieces", category: "Play" },
  { id: 4, name: "The Dune Everyday Collar", type: "Out and about", price: "6.750", image: "/__mockup/images/lunapaws-stillroom-collar.png", note: "Cotton webbing · brass", category: "Wear" },
];

function MoonPaw({ inverse = false }: { inverse?: boolean }) {
  const fill = inverse ? "#fff8ef" : "#24483f";
  return (
    <svg aria-hidden="true" viewBox="0 0 44 44" fill="none" className="sr-mark">
      <path d="M29.4 4.9A17.2 17.2 0 1 0 40 33.7 15.8 15.8 0 0 1 29.4 4.9Z" stroke={fill} strokeWidth="2" strokeLinecap="round" />
      <circle cx="16.2" cy="26" r="2.7" fill={fill} /><circle cx="23.1" cy="26" r="2.7" fill={fill} />
      <circle cx="14.3" cy="20.3" r="1.9" fill={fill} /><circle cx="20" cy="18.4" r="1.9" fill={fill} />
      <path d="M15.9 30.5c.3-2 2-3.4 3.8-3.4s3.5 1.4 3.8 3.4c.2 1.1-.9 1.8-2 1.3l-1.8-.7-1.8.7c-1.1.5-2.2-.2-2-1.3Z" fill={fill} />
    </svg>
  );
}

export function LunapawsStillroom() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Everything");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const count = Object.values(cart).reduce((sum, n) => sum + n, 0);
  const shown = useMemo(() => products.filter((product) =>
    (category === "Everything" || product.category === category) &&
    `${product.name} ${product.category} ${product.note}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);
  const add = (id: number) => {
    setCart((old) => ({ ...old, [id]: (old[id] || 0) + 1 }));
    const product = products.find((item) => item.id === id);
    setNotice(`${product?.name} is in your bag`);
    window.setTimeout(() => setNotice(""), 2300);
  };
  const changeQty = (id: number, delta: number) => setCart((old) => {
    const next = { ...old, [id]: (old[id] || 0) + delta };
    if (next[id] <= 0) delete next[id];
    return next;
  });
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNav(false);
  };

  return (
    <div className="stillroom">
      <style>{`
        .stillroom {
          --sr-forest:#24483f; --sr-cream:#fff8ef; --sr-paper:#f6eee4; --sr-peach:#d99578;
          --sr-ink:#263c35; --sr-muted:#777d73; --sr-sage:#e7e9df; --sr-line:rgba(36,72,63,.16);
          min-height:100vh; color:var(--sr-ink); background:var(--sr-cream);
          font-family:'DM Sans',sans-serif; overflow:hidden;
        }
        .stillroom *{box-sizing:border-box}
        .stillroom button,.stillroom input{font:inherit}
        .stillroom button{color:inherit}
        .stillroom a{color:inherit;text-decoration:none}
        .stillroom button:focus-visible,.stillroom a:focus-visible,.stillroom input:focus-visible{outline:2px solid var(--sr-peach);outline-offset:3px}
        .sr-wrap{width:min(1320px,calc(100% - 88px));margin:0 auto}
        .sr-banner{height:31px;display:flex;justify-content:center;align-items:center;background:var(--sr-forest);color:#fff8ef;font-size:9px;letter-spacing:.19em;text-transform:uppercase}
        .sr-banner span{opacity:.75;margin:0 9px}
        .sr-head{height:82px;display:flex;align-items:center;justify-content:space-between;gap:28px;background:var(--sr-cream);position:relative;z-index:5;padding:0 max(44px,calc((100% - 1320px)/2))}
        .sr-logo{display:flex;align-items:center;gap:9px;color:var(--sr-forest);flex-shrink:0}
        .sr-mark{width:38px;height:38px}
        .sr-wordmark{font-size:16px;letter-spacing:.19em;font-weight:700}
        .sr-nav{display:flex;align-items:center;gap:36px}
        .sr-nav a{font-size:11px;color:#58675f;transition:color .2s}
        .sr-nav a:hover{color:var(--sr-peach)}
        .sr-actions{display:flex;align-items:center;gap:9px}
        .sr-icon{position:relative;width:39px;height:39px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;cursor:pointer}
        .sr-icon:hover{background:#f0e8de}
        .sr-icon svg{width:18px;height:18px;stroke-width:1.6}
        .sr-count{position:absolute;right:0;top:0;width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:var(--sr-peach);color:white;font-size:9px}
        .sr-mobile-toggle{display:none}
        .sr-hero{position:relative;min-height:610px;background:#e8e0d5;isolation:isolate}
        .sr-hero-photo{position:absolute;z-index:-2;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 48%}
        .sr-hero:after{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,rgba(255,248,239,.97) 0%,rgba(255,248,239,.9) 28%,rgba(255,248,239,.35) 51%,rgba(255,248,239,0) 76%)}
        .sr-hero-inner{min-height:610px;display:flex;align-items:center}
        .sr-hero-copy{max-width:540px;padding:50px 0 54px}
        .sr-kicker{display:flex;align-items:center;gap:11px;color:var(--sr-forest);font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
        .sr-kicker:before{content:"";width:27px;height:1px;background:var(--sr-peach)}
        .sr-hero h1{font:500 clamp(55px,7.2vw,95px)/.99 'Playfair Display',Georgia,serif;letter-spacing:-.055em;color:var(--sr-forest);margin:27px 0 22px}
        .sr-hero h1 em{font-weight:500;color:#b96e56}
        .sr-hero-copy>p{font-size:13px;line-height:1.9;color:#647069;max-width:350px;margin:0}
        .sr-cta{display:inline-flex;align-items:center;justify-content:center;gap:16px;min-height:49px;padding:0 23px;border:1px solid var(--sr-forest);border-radius:99px;background:var(--sr-forest);color:var(--sr-cream)!important;font-size:10px;font-weight:600;letter-spacing:.08em;cursor:pointer;transition:transform .2s,background .2s}
        .sr-cta:hover{transform:translateY(-2px);background:#31594e}
        .sr-cta svg{width:15px;height:15px}
        .sr-hero .sr-cta{margin-top:26px}
        .sr-hero-caption{position:absolute;right:42px;bottom:26px;color:#fff8ef;font-size:9px;letter-spacing:.18em;text-transform:uppercase;text-shadow:0 1px 8px #273e35}
        .sr-hero-sticker{position:absolute;right:7.3%;top:13%;width:99px;height:99px;border:1px solid rgba(255,248,239,.8);border-radius:50%;display:grid;place-items:center;color:#fff8ef;background:rgba(36,72,63,.18);backdrop-filter:blur(7px);text-align:center;transform:rotate(9deg)}
        .sr-hero-sticker span{font:italic 14px/1.2 'Playfair Display',serif}
        .sr-trust{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--sr-line);background:#fffaf4}
        .sr-trust div{padding:17px;text-align:center;color:var(--sr-forest);font-size:9px;letter-spacing:.11em;text-transform:uppercase}
        .sr-trust div+div{border-left:1px solid var(--sr-line)}
        .sr-trust b{font-weight:500;color:var(--sr-peach);margin-right:8px}
        .sr-intro{padding:100px 0 81px}
        .sr-intro-grid{display:grid;grid-template-columns:1fr .83fr;align-items:end;gap:70px}
        .sr-intro h2,.sr-heading h2,.sr-letter h2{font:500 clamp(38px,5vw,66px)/1.04 'Playfair Display',Georgia,serif;letter-spacing:-.045em;color:var(--sr-forest);margin:17px 0 0}
        .sr-intro h2 em,.sr-letter h2 em{color:#b96e56}
        .sr-intro-copy{font-size:13px;line-height:1.9;color:var(--sr-muted);max-width:410px;margin-bottom:7px}
        .sr-intro-copy a{display:inline-flex;align-items:center;gap:9px;margin-top:18px;color:var(--sr-forest);font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}
        .sr-intro-copy svg{width:14px;height:14px}
        .sr-collection{padding:15px 0 93px}
        .sr-collection-head{display:flex;align-items:end;justify-content:space-between;margin-bottom:24px}
        .sr-heading h2{font-size:clamp(31px,4vw,47px);margin-top:12px}
        .sr-collection-head>span{font-size:10px;color:#8c9188;letter-spacing:.12em;text-transform:uppercase}
        .sr-tiles{display:grid;grid-template-columns:1.15fr .9fr .9fr 1.15fr;gap:12px}
        .sr-tile{height:364px;position:relative;overflow:hidden;background:#e5e3d8;cursor:pointer;border:0;padding:0;text-align:left}
        .sr-tile:nth-child(2),.sr-tile:nth-child(4){margin-top:38px}
        .sr-tile img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
        .sr-tile:hover img{transform:scale(1.045)}
        .sr-tile:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(25,43,35,.7))}
        .sr-tile-copy{position:absolute;z-index:1;left:19px;right:16px;bottom:18px;color:#fff8ef}
        .sr-tile-copy small{font-size:8px;letter-spacing:.17em;text-transform:uppercase;opacity:.8}
        .sr-tile-copy strong{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font:500 20px 'Playfair Display',serif}
        .sr-tile-copy svg{width:17px;height:17px}
        .sr-products{background:#f3ece2;padding:86px 0 99px}
        .sr-shop-head{display:flex;align-items:end;justify-content:space-between;gap:20px}
        .sr-shop-head .sr-heading>p{font-size:11px;color:var(--sr-muted);margin:11px 0 0}
        .sr-shop-tools{display:flex;align-items:center;gap:10px}
        .sr-search{width:37px;height:37px;border-radius:50%;border:1px solid var(--sr-line);display:grid;place-items:center;background:transparent;cursor:pointer}
        .sr-search svg{width:15px;height:15px}
        .sr-search-field{width:190px;border:1px solid var(--sr-line);border-radius:99px;background:#fffaf4;padding:10px 14px;font-size:10px}
        .sr-filters{display:flex;gap:7px;margin:29px 0 23px;flex-wrap:wrap}
        .sr-filter{border:1px solid #d9d2c8;border-radius:99px;background:transparent;padding:9px 14px;font-size:9px;color:#707970;cursor:pointer;transition:all .2s}
        .sr-filter.active,.sr-filter:hover{background:var(--sr-forest);border-color:var(--sr-forest);color:#fff8ef}
        .sr-product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:17px}
        .sr-product{min-width:0;background:#fffaf4;position:relative}
        .sr-product-image{height:280px;overflow:hidden;position:relative;background:#e4e3da}
        .sr-product-image img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
        .sr-product:hover .sr-product-image img{transform:scale(1.04)}
        .sr-product-label{position:absolute;top:13px;left:13px;padding:7px 9px;background:rgba(255,248,239,.94);font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--sr-forest)}
        .sr-heart{position:absolute;top:10px;right:10px;display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,248,239,.94);cursor:pointer;color:var(--sr-forest)}
        .sr-heart svg{width:16px;height:16px;stroke-width:1.6}
        .sr-heart.selected{color:#bc7057}
        .sr-product-meta{display:flex;justify-content:space-between;align-items:center;padding:15px 15px 0;color:#92948c;font-size:8px;letter-spacing:.12em;text-transform:uppercase}
        .sr-product-meta span:last-child{display:flex;align-items:center;gap:4px;color:#8b7056;letter-spacing:0}
        .sr-product-meta svg{width:11px;height:11px;fill:#d5a060;stroke:#d5a060}
        .sr-product-info{padding:7px 15px 16px}
        .sr-product-info h3{font:500 17px 'Playfair Display',Georgia,serif;color:var(--sr-forest);margin:0}
        .sr-product-info p{color:#92948c;font-size:9px;margin:6px 0 13px}
        .sr-product-bottom{display:flex;align-items:center;justify-content:space-between}
        .sr-price{font-size:10px;color:var(--sr-forest);font-weight:700;letter-spacing:.04em}
        .sr-add{border:0;background:none;color:var(--sr-forest);font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:flex;gap:7px;align-items:center}
        .sr-add svg{width:14px;height:14px}
        .sr-empty{grid-column:1/-1;padding:45px;text-align:center;border:1px dashed #cfc7ba;color:var(--sr-muted);font-size:12px}
        .sr-note{background:var(--sr-forest);color:var(--sr-cream);padding:76px 0}
        .sr-note-inner{display:flex;align-items:center;justify-content:space-between;gap:50px}
        .sr-note .sr-kicker{color:#f0d7c4}
        .sr-note h2{color:var(--sr-cream);font-size:clamp(34px,4vw,52px);margin:16px 0 9px}
        .sr-note p{color:rgba(255,248,239,.65);font-size:11px;margin:0}
        .sr-form{width:min(410px,100%);border-bottom:1px solid rgba(255,248,239,.46);display:flex;align-items:center}
        .sr-form input{width:100%;padding:14px 2px;border:0;background:transparent;color:#fff8ef;font-size:11px;outline:0}
        .sr-form input::placeholder{color:rgba(255,248,239,.53)}
        .sr-form button{border:0;background:none;color:#fff8ef;cursor:pointer;padding:12px 0 12px 13px}
        .sr-form button svg{width:17px;height:17px}
        .sr-success{min-height:36px;padding-top:10px;color:#f0d7c4;font-size:10px}
        .sr-footer{background:#1e3e36;color:#fff8ef;padding:55px 0 24px}
        .sr-footer-main{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:50px;padding-bottom:50px}
        .sr-footer-brand p{max-width:260px;color:rgba(255,248,239,.58);font-size:10px;line-height:1.8;margin:18px 0}
        .sr-footer h3{font-size:9px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;margin:5px 0 17px}
        .sr-footer a,.sr-footer button{display:block;width:max-content;margin:0 0 12px;border:0;padding:0;background:transparent;color:rgba(255,248,239,.66);font-size:10px;cursor:pointer}
        .sr-footer a:hover,.sr-footer button:hover{color:#fff8ef}
        .sr-footer-bottom{border-top:1px solid rgba(255,248,239,.16);padding-top:18px;display:flex;justify-content:space-between;color:rgba(255,248,239,.47);font-size:8px;letter-spacing:.12em;text-transform:uppercase}
        .sr-cart-scrim{position:fixed;inset:0;z-index:20;background:rgba(22,38,31,.4);display:flex;justify-content:flex-end}
        .sr-cart{width:min(430px,100%);height:100%;background:var(--sr-cream);padding:28px;display:flex;flex-direction:column;box-shadow:-18px 0 50px rgba(22,38,31,.15)}
        .sr-cart-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:1px solid var(--sr-line)}
        .sr-cart-head h2{font:500 28px 'Playfair Display',serif;color:var(--sr-forest);margin:0}
        .sr-cart-close{width:36px;height:36px;border:0;background:transparent;cursor:pointer}
        .sr-cart-close svg{width:19px}
        .sr-cart-items{overflow:auto;flex:1;padding:14px 0}
        .sr-cart-item{display:grid;grid-template-columns:76px 1fr auto;gap:13px;padding:13px 0;border-bottom:1px solid var(--sr-line);align-items:center}
        .sr-cart-item img{width:76px;height:76px;object-fit:cover}
        .sr-cart-item strong{font:500 15px 'Playfair Display',serif;color:var(--sr-forest)}
        .sr-cart-item small{display:block;color:var(--sr-muted);font-size:9px;margin-top:5px}
        .sr-qty{display:flex;align-items:center;gap:9px;margin-top:9px}
        .sr-qty button{width:23px;height:23px;border:1px solid var(--sr-line);border-radius:50%;display:grid;place-items:center;background:transparent;cursor:pointer}
        .sr-qty svg{width:11px;height:11px}
        .sr-qty span{font-size:10px}
        .sr-cart-price{font-size:10px;font-weight:700}
        .sr-cart-empty{margin:auto;text-align:center;color:var(--sr-muted);max-width:240px}
        .sr-cart-empty svg{width:28px;height:28px;color:var(--sr-peach)}
        .sr-cart-empty h3{font:500 24px 'Playfair Display',serif;color:var(--sr-forest);margin:14px 0 8px}
        .sr-cart-empty p{font-size:11px;line-height:1.7}
        .sr-cart-foot{border-top:1px solid var(--sr-line);padding-top:18px}
        .sr-cart-total{display:flex;justify-content:space-between;font-size:11px;color:var(--sr-forest);margin-bottom:15px}
        .sr-cart-foot .sr-cta{width:100%}
        .sr-toast{position:fixed;z-index:22;left:50%;bottom:25px;transform:translateX(-50%);background:var(--sr-forest);color:var(--sr-cream);padding:12px 18px;border-radius:99px;font-size:10px;box-shadow:0 8px 25px rgba(36,72,63,.2);animation:sr-in .25s ease-out}
        @keyframes sr-in{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
        @media(max-width:900px){
          .sr-wrap{width:calc(100% - 48px)}.sr-head{padding:0 24px}.sr-nav{gap:19px}
          .sr-hero,.sr-hero-inner{min-height:550px}.sr-hero-sticker{right:5%;top:8%}
          .sr-tile{height:300px}.sr-product-image{height:220px}
          .sr-story-grid{gap:7%}.sr-story-photo{height:410px}
        }
        @media(max-width:680px){
          .sr-wrap{width:calc(100% - 38px)}.sr-banner{font-size:8px;height:29px}
          .sr-head{height:69px;padding:0 19px}.sr-mark{width:33px;height:33px}.sr-wordmark{font-size:14px}
          .sr-mobile-toggle{display:grid}.sr-nav{display:none;position:absolute;top:69px;left:0;right:0;padding:18px 22px 23px;background:var(--sr-cream);border-top:1px solid var(--sr-line);box-shadow:0 15px 22px rgba(36,72,63,.08)}
          .sr-nav.open{display:flex;flex-direction:column;align-items:flex-start;gap:20px}
          .sr-nav a{font-size:13px}.sr-actions{gap:0}.sr-icon{width:35px;height:35px}
          .sr-hero,.sr-hero-inner{min-height:630px}.sr-hero-photo{object-position:60% center}
          .sr-hero:after{background:linear-gradient(90deg,rgba(255,248,239,.96),rgba(255,248,239,.77) 62%,rgba(255,248,239,.18))}
          .sr-hero-inner{align-items:flex-end;padding-bottom:40px}.sr-hero-copy{padding:0 0 18px}.sr-hero h1{font-size:clamp(53px,15vw,78px);margin:20px 0 16px}
          .sr-hero-copy>p{max-width:300px;font-size:12px}.sr-hero-sticker{width:77px;height:77px;right:7%;top:8%}.sr-hero-sticker span{font-size:11px}
          .sr-hero-caption{right:13px;bottom:12px;font-size:7px}.sr-trust div{padding:13px 6px;font-size:7px;letter-spacing:.07em}.sr-trust b{margin-right:4px}
          .sr-intro{padding:69px 0 54px}.sr-intro-grid{grid-template-columns:1fr;gap:21px}.sr-intro h2{font-size:46px}
          .sr-intro-copy{font-size:12px}.sr-collection{padding:10px 0 65px}.sr-collection-head{align-items:end}
          .sr-collection-head>span{font-size:8px}.sr-tiles{grid-template-columns:1fr 1fr;gap:9px}.sr-tile{height:250px}.sr-tile:nth-child(2),.sr-tile:nth-child(4){margin-top:0}
          .sr-tile-copy{left:12px;bottom:12px}.sr-tile-copy strong{font-size:16px}.sr-tile-copy small{font-size:7px}
          .sr-products{padding:64px 0}.sr-shop-head{align-items:flex-end}.sr-shop-head .sr-heading>p{max-width:230px;line-height:1.6}
          .sr-shop-head .sr-heading h2{font-size:34px}.sr-shop-tools{gap:5px}.sr-search-field{width:130px;padding:9px 10px;font-size:9px}
          .sr-filters{margin:22px 0 17px;gap:6px}.sr-filter{padding:8px 11px;font-size:8px}
          .sr-product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sr-product-image{height:clamp(160px,48vw,240px)}
          .sr-product-meta{padding:11px 10px 0;font-size:7px}.sr-product-info{padding:6px 10px 12px}.sr-product-info h3{font-size:15px}.sr-product-info p{font-size:8px}
          .sr-add{font-size:8px}
          .sr-note{padding:57px 0}.sr-note-inner{align-items:flex-start;flex-direction:column;gap:28px}.sr-note h2{font-size:38px}
          .sr-footer{padding:42px 0 20px}.sr-footer-main{grid-template-columns:1fr 1fr;gap:31px 20px;padding-bottom:35px}.sr-footer-brand{grid-column:1/-1}
          .sr-footer-bottom{font-size:7px;gap:10px;letter-spacing:.06em}
          .sr-cart{padding:22px}.sr-toast{width:max-content;max-width:calc(100% - 30px);text-align:center}
        }
      `}</style>

      <div className="sr-banner">A softer life for little paws <span>·</span> Complimentary delivery over KWD 25</div>
      <header className="sr-head">
        <a className="sr-logo" href="#top" aria-label="LUNAPAWS home" onClick={(event) => { event.preventDefault(); scrollTo("top"); }}>
          <MoonPaw /><span className="sr-wordmark">LUNAPAWS</span>
        </a>
        <nav className={`sr-nav ${mobileNav ? "open" : ""}`} aria-label="Main navigation">
          <a href="#collection" onClick={(e) => { e.preventDefault(); scrollTo("collection"); }}>The collection</a>
          <a href="#shop" onClick={(e) => { e.preventDefault(); scrollTo("shop"); }}>Shop all</a>
          <a href="#letter" onClick={(e) => { e.preventDefault(); scrollTo("letter"); }}>The good letter</a>
        </nav>
        <div className="sr-actions">
          <button className="sr-icon sr-mobile-toggle" aria-label={mobileNav ? "Close menu" : "Open menu"} onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button>
          <button className="sr-icon" aria-label={searchOpen ? "Close search" : "Search"} onClick={() => setSearchOpen(!searchOpen)}><Search /></button>
          <button className="sr-icon" aria-label="Open shopping bag" onClick={() => setCartOpen(true)}><ShoppingBag /><span className="sr-count">{count}</span></button>
        </div>
      </header>

      <main id="top">
        <section className="sr-hero">
          <img className="sr-hero-photo" src="/__mockup/images/lunapaws-stillroom-hero.png" alt="A sleepy cat curled into a forest-green LUNAPAWS bed in the afternoon light" />
          <div className="sr-wrap sr-hero-inner"><div className="sr-hero-copy">
            <div className="sr-kicker">Objects for the ones we adore</div>
            <h1>Home, made<br />for <em>their</em> kind<br />of living.</h1>
            <p>Small comforts, considered from whisker to tail. For the sunbeam chasers and late-night companions.</p>
            <button className="sr-cta" onClick={() => scrollTo("shop")}>Meet the collection <ArrowRight /></button>
          </div></div>
          <div className="sr-hero-sticker"><span>Little paws<br />big love</span></div>
          <div className="sr-hero-caption">At home with Fig · Kuwait City</div>
        </section>

        <div className="sr-trust">
          <div><b>01</b> Small-batch, thoughtfully chosen</div>
          <div><b>02</b> Made for everyday rituals</div>
          <div><b>03</b> Approved by the house cat</div>
        </div>

        <section className="sr-intro">
          <div className="sr-wrap sr-intro-grid">
            <div><div className="sr-kicker">Good things for good company</div><h2>Not just for cats.<br /><em>For cat people.</em></h2></div>
            <div className="sr-intro-copy">A thoughtful little edit of the pieces that make shared spaces feel more like home. Textures you want to touch. Details that earn their place. And always, room for one more nap.<br /><a href="#collection" onClick={(e) => { e.preventDefault(); scrollTo("collection"); }}>Find your little something <ArrowDownRight /></a></div>
          </div>
        </section>

        <section className="sr-collection" id="collection">
          <div className="sr-wrap">
            <div className="sr-collection-head"><div className="sr-heading"><div className="sr-kicker">Shop by their sort of day</div><h2>A place for every little mood.</h2></div><span>Four ways to feel at home</span></div>
            <div className="sr-tiles">
              {[
                { label: "Rest", subtitle: "Longer afternoons", image: "/__mockup/images/lunapaws-stillroom-bed.png", cat: "Rest" },
                { label: "Ritual", subtitle: "The daily good stuff", image: "/__mockup/images/lunapaws-stillroom-bowl.png", cat: "Ritual" },
                { label: "Play", subtitle: "A little more curious", image: "/__mockup/images/lunapaws-stillroom-toy.png", cat: "Play" },
                { label: "Wear", subtitle: "Out in the world", image: "/__mockup/images/lunapaws-stillroom-collar.png", cat: "Wear" },
              ].map((tile) => <button className="sr-tile" key={tile.cat} onClick={() => { setCategory(tile.cat); scrollTo("shop"); }}>
                <img src={tile.image} alt={`${tile.label} essentials, photographed in the LUNAPAWS Stillroom`} loading="lazy" />
                <span className="sr-tile-copy"><small>{tile.subtitle}</small><strong>{tile.label}<ArrowRight /></strong></span>
              </button>)}
            </div>
          </div>
        </section>

        <section className="sr-products" id="shop">
          <div className="sr-wrap">
            <div className="sr-shop-head"><div className="sr-heading"><div className="sr-kicker">The little things</div><h2>Keepers, all of them.</h2><p>Our current favourites, photographed in their best light.</p></div>
              <div className="sr-shop-tools">{searchOpen && <input className="sr-search-field" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a little something" aria-label="Search products" />}
                <button className="sr-search" aria-label="Search products" onClick={() => setSearchOpen(!searchOpen)}><Search /></button>
              </div>
            </div>
            <div className="sr-filters" aria-label="Filter collection">
              {["Everything", "Rest", "Ritual", "Play", "Wear"].map((item) => <button key={item} className={`sr-filter ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <div className="sr-product-grid">
              {shown.length ? shown.map((product, index) => <article className="sr-product" key={product.id}>
                <div className="sr-product-image"><img src={product.image} alt={`${product.name} in a sunlit LUNAPAWS product still-life`} loading="lazy" />
                  <span className="sr-product-label">{index === 0 && category === "Everything" ? "A house favourite" : product.type}</span>
                  <button className={`sr-heart ${saved.includes(product.id) ? "selected" : ""}`} aria-label={saved.includes(product.id) ? `Remove ${product.name} from saved items` : `Save ${product.name}`} onClick={() => setSaved((old) => old.includes(product.id) ? old.filter((id) => id !== product.id) : [...old, product.id])}><Heart fill={saved.includes(product.id) ? "currentColor" : "none"} /></button>
                </div>
                <div className="sr-product-meta"><span>{product.category}</span><span><Star /> 4.9</span></div>
                <div className="sr-product-info"><h3>{product.name}</h3><p>{product.note}</p>
                  <div className="sr-product-bottom"><span className="sr-price">KWD {product.price}</span><button className="sr-add" onClick={() => add(product.id)}>Add to bag <Plus /></button></div>
                </div>
              </article>) : <div className="sr-empty">Nothing in this little corner yet. Try another search or category.</div>}
            </div>
          </div>
        </section>

        <section className="sr-note" id="letter">
          <div className="sr-wrap sr-note-inner"><div><div className="sr-kicker">A little note, now and then</div><h2>Good things.<br /><em>In good company.</em></h2><p>New little joys, considered tips and a warm hello. No noise, promise.</p></div>
            <form className="sr-form" onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSubscribed(true); }}>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Your email address" />
              <button type="submit" aria-label="Subscribe"><ArrowRight /></button>
            </form>
            <div className="sr-success" aria-live="polite">{subscribed ? <><Check /> You’re on the list. Speak soon.</> : ""}</div>
          </div>
        </section>
      </main>

      <footer className="sr-footer"><div className="sr-wrap">
        <div className="sr-footer-main">
          <div className="sr-footer-brand"><a className="sr-logo" href="#top" onClick={(e) => { e.preventDefault(); scrollTo("top"); }}><MoonPaw inverse /><span className="sr-wordmark" style={{ color: "#fff8ef" }}>LUNAPAWS</span></a><p>Thoughtful essentials for the little paws that make your whole world feel softer.</p></div>
          <div><h3>Find your way</h3><button onClick={() => scrollTo("collection")}>The collection</button><button onClick={() => scrollTo("shop")}>Shop all</button></div>
          <div><h3>Here to help</h3><a href="mailto:hello@lunapaws.example">Contact us</a><a href="mailto:hello@lunapaws.example?subject=Shipping">Shipping & returns</a><a href="mailto:hello@lunapaws.example?subject=Care">Care guide</a></div>
          <div><h3>Our little promise</h3><p style={{ color: "rgba(255,248,239,.58)", fontSize: 10, lineHeight: 1.8, margin: 0 }}>Considered materials. Honest details. A warmer kind of everyday for you and your cat.</p></div>
        </div>
        <div className="sr-footer-bottom"><span>© {new Date().getFullYear()} LUNAPAWS · Made for the ones you love</span><span>Little paws, big love</span></div>
      </div></footer>

      {cartOpen && <div className="sr-cart-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <aside className="sr-cart" role="dialog" aria-modal="true" aria-labelledby="sr-cart-title">
          <div className="sr-cart-head"><h2 id="sr-cart-title">Your little bag ({count})</h2><button className="sr-cart-close" aria-label="Close bag" onClick={() => setCartOpen(false)}><X /></button></div>
          {count ? <><div className="sr-cart-items">{Object.entries(cart).map(([key, quantity]) => {
            const product = products.find((item) => item.id === Number(key));
            if (!product) return null;
            return <div className="sr-cart-item" key={key}><img src={product.image} alt="" /><div><strong>{product.name}</strong><small>KWD {product.price}</small><div className="sr-qty"><button aria-label={`Remove one ${product.name}`} onClick={() => changeQty(product.id, -1)}><Minus /></button><span>{quantity}</span><button aria-label={`Add one ${product.name}`} onClick={() => changeQty(product.id, 1)}><Plus /></button></div></div><span className="sr-cart-price">KWD {(Number(product.price) * quantity).toFixed(3)}</span></div>;
          })}</div><div className="sr-cart-foot"><div className="sr-cart-total"><span>Subtotal</span><strong>KWD {Object.entries(cart).reduce((sum, [key, qty]) => sum + Number(products.find((p) => p.id === Number(key))?.price || 0) * qty, 0).toFixed(3)}</strong></div><button className="sr-cta" onClick={() => { setCartOpen(false); setNotice("This is a preview — no checkout just yet."); window.setTimeout(() => setNotice(""), 2500); }}>Continue to checkout <ArrowRight /></button></div></>
            : <div className="sr-cart-empty"><ShoppingBag /><h3>A little room for something lovely.</h3><p>Your bag is taking a quiet moment. Find a new favourite?</p><button className="sr-cta" onClick={() => { setCartOpen(false); scrollTo("shop"); }}>Explore the collection <ArrowRight /></button></div>}
        </aside>
      </div>}
      {notice && <div className="sr-toast" role="status"><Sparkles size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />{notice}</div>}
    </div>
  );
}
