/* ==========================================================================
   Gancique Store — main.js
   Product data, rendering, navigation, search, filters, UI interactions.
   ========================================================================== */

/* ---------------------------------------------------------------------- *
 * 1. PRODUCT DATA
 * A single source of truth used across the Home, Products, and
 * Product Detail pages. In a real deployment this would come from an
 * API — here it is static so the site works with zero backend.
 * ---------------------------------------------------------------------- */
const PRODUCTS = [
  { id: "kc-001", name: "Sakura Chibi Anime Keychain", category: "Anime", price: 8.99, oldPrice: null, rating: 4.8, reviews: 214, badge: "best", image: "images/produk/Computer Parts Keychain.jfif", colors: ["#2563EB", "#F97316", "#111827"], description: "A soft-enamel chibi charm inspired by classic anime heroines. Hand-painted details and a durable brass ring make this a favorite among collectors and cosplayers alike." },
  { id: "kc-002", name: "Pixel Gamepad Keychain", category: "Gaming", price: 7.49, oldPrice: 9.99, rating: 4.6, reviews: 158, badge: "sale", image: "images/produk/Computer Parts Keychain.jfif", colors: ["#2563EB", "#111827"], description: "A retro pixel-art gamepad charm cast in acrylic. Perfect for gamers who want a nostalgic nod to 8-bit consoles on their keys or backpack." },
  { id: "kc-003", name: "Custom Name Acrylic Keychain", category: "Custom Name", price: 11.99, oldPrice: null, rating: 4.9, reviews: 342, badge: "best", image: "images/produk/Computer Parts Keychain.jfif", colors: ["#F97316", "#2563EB", "#111827"], description: "Personalize a keychain with any name or short phrase, laser-engraved into premium acrylic. A thoughtful, made-to-order gift for any occasion." },
  { id: "kc-004", name: "Matching Couple Heart Keychains", category: "Couple", price: 14.99, oldPrice: 18.99, rating: 4.7, reviews: 189, badge: "sale", image: "images/produk/Computer Parts Keychain.jfif", colors: ["#F97316", "#111827"], description: "A set of two interlocking heart charms, sold together, so you and someone special can carry a piece of each other every day." },
  { id: "kc-005", name: "Retro Classic Car Keychain", category: "Cars", price: 9.99, oldPrice: null, rating: 4.5, reviews: 96, badge: "new", image: "images/produk/Computer Parts Keychain.jfif", colors: ["#111827", "#2563EB"], description: "A miniature die-cast style classic car silhouette, finished with a satin metal coat. Built for drivers who like their keys to match their garage." },
  { id: "kc-006", name: "Chopper Motorcycle Keychain", category: "Motorcycles", price: 10.49, oldPrice: null, rating: 4.6, reviews: 74, badge: null, image: "images/produk/Computer Parts Keychain.jfif", colors: ["#111827", "#F97316"], description: "A bold chopper-style motorcycle charm in brushed metal, designed for riders who want their keys to look as sharp as their bike." },
  { id: "kc-007", name: "Sleepy Panda Keychain", category: "Cute Animals", price: 6.99, oldPrice: null, rating: 4.9, reviews: 401, badge: "best", image: "https://placehold.co/600x600/F1F5F9/475569?text=Panda+Keychain", colors: ["#111827", "#2563EB", "#F97316"], description: "A round, soft-touch panda charm with a sleepy expression that's hard not to smile at. One of our most-loved everyday keychains." },
  { id: "kc-008", name: "Leather Keychain Strap", category: "Accessories", price: 5.49, oldPrice: null, rating: 4.4, reviews: 88, badge: null, image: "https://placehold.co/600x600/E2E8F0/334155?text=Leather+Strap", colors: ["#111827", "#78350F"], description: "A genuine leather wristlet strap that pairs with any charm in the shop, giving your keys a grip that's easy to find in a bag." },
  { id: "kc-009", name: "Ghost Anime Villain Keychain", category: "Anime", price: 9.49, oldPrice: null, rating: 4.7, reviews: 133, badge: "new", image: "https://placehold.co/600x600/EDE9FE/7C3AED?text=Anime+Villain", colors: ["#7C3AED", "#111827"], description: "A moody, detailed villain-inspired charm for fans who like their accessories with an edge. Glow-in-the-dark accents included." },
  { id: "kc-010", name: "Retro Joystick Keychain", category: "Gaming", price: 8.49, oldPrice: null, rating: 4.5, reviews: 61, badge: null, image: "https://placehold.co/600x600/CFFAFE/0E7490?text=Joystick", colors: ["#2563EB", "#111827"], description: "An arcade joystick charm with a satisfying rubberized top. A small tribute to the golden age of arcades, right on your keyring." },
  { id: "kc-011", name: "Custom Initial Letter Keychain", category: "Custom Name", price: 6.99, oldPrice: null, rating: 4.8, reviews: 276, badge: "best", image: "https://placehold.co/600x600/FFF7ED/EA580C?text=Initial+Charm", colors: ["#F97316", "#2563EB"], description: "A single bold initial in brushed acrylic, an understated way to personalize a bag, keyring, or gift with someone's own letter." },
  { id: "kc-012", name: "Couple Puzzle Piece Keychains", category: "Couple", price: 13.49, oldPrice: null, rating: 4.6, reviews: 142, badge: null, image: "https://placehold.co/600x600/FDF2F8/BE185D?text=Puzzle+Set", colors: ["#F97316", "#111827"], description: "Two interlocking puzzle-piece charms that only fit together correctly — a playful reminder for two people who complete each other." },
  { id: "kc-013", name: "Off-Road Truck Keychain", category: "Cars", price: 10.99, oldPrice: 12.99, rating: 4.4, reviews: 52, badge: "sale", image: "https://placehold.co/600x600/ECFDF5/059669?text=Truck+Keychain", colors: ["#111827", "#16A34A"], description: "A rugged off-road truck silhouette with knobby tires and a raised suspension, cast in weather-resistant metal alloy." },
  { id: "kc-014", name: "Sport Bike Keychain", category: "Motorcycles", price: 9.99, oldPrice: null, rating: 4.5, reviews: 47, badge: null, image: "https://placehold.co/600x600/FEF2F2/DC2626?text=Sport+Bike", colors: ["#DC2626", "#111827"], description: "A streamlined sport bike charm capturing the sleek lines of a racing motorcycle, finished in a glossy enamel coat." },
  { id: "kc-015", name: "Chubby Cat Keychain", category: "Cute Animals", price: 6.49, oldPrice: null, rating: 4.9, reviews: 355, badge: "best", image: "https://placehold.co/600x600/FFFBEB/D97706?text=Cat+Keychain", colors: ["#111827", "#F97316", "#2563EB"], description: "A pudgy, round-bellied cat charm with a cheerful expression — soft-touch coating makes it comfortable to hold." },
  { id: "kc-016", name: "Keychain Carabiner Clip", category: "Accessories", price: 4.99, oldPrice: null, rating: 4.3, reviews: 64, badge: "new", image: "https://placehold.co/600x600/F5F3FF/6D28D9?text=Carabiner+Clip", colors: ["#111827", "#2563EB", "#F97316"], description: "A lightweight aluminum carabiner clip for attaching your favorite charms to a backpack, belt loop, or bag with a secure snap." }
];

window.PRODUCTS = PRODUCTS;

/* Testimonials data */
const TESTIMONIALS = [
  { name: "Amelia R.", rating: 5, text: "The custom name keychain was even nicer in person than in the photos. Fast shipping too.", avatar: "https://i.pravatar.cc/80?img=32" },
  { name: "Diego M.", rating: 5, text: "Bought the couple set for my partner and I — great quality acrylic, no rough edges at all.", avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Priya K.", rating: 4, text: "Love the anime collection. Packaging was cute and the charm colors matched the listing exactly.", avatar: "https://i.pravatar.cc/80?img=47" }
];

/* FAQ data */
const FAQS = [
  { q: "How long does a custom order take to make?", a: "Custom name and initial keychains are typically handcrafted and shipped within 2–4 business days after your order is placed." },
  { q: "What material are the keychains made from?", a: "Most pieces are made from premium acrylic or a durable zinc-alloy metal, depending on the design — material is listed on each product page." },
  { q: "Do you offer international shipping?", a: "Yes, Gancique Store ships worldwide. Delivery estimates are shown at checkout based on your location." },
  { q: "Can I return or exchange a keychain?", a: "Non-custom items can be returned within 14 days of delivery in original condition. Custom pieces are final sale unless there's a defect." }
];

/* ---------------------------------------------------------------------- *
 * 2. UTILITIES
 * ---------------------------------------------------------------------- */
const formatPrice = (n) => `$${n.toFixed(2)}`;

const buildStars = (rating) => {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
};

const svgIcon = (name) => {
  const icons = {
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
    cart: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>`
  };
  return icons[name] || "";
};

/* ---------------------------------------------------------------------- *
 * 3. PAGE LOADER
 * ---------------------------------------------------------------------- */
window.addEventListener("load", () => {
  const loader = document.querySelector(".page-loader");
  if (loader) {
    setTimeout(() => loader.classList.add("is-hidden"), 250);
  }
});

/* ---------------------------------------------------------------------- *
 * 4. HEADER: sticky shadow, mobile menu, dark mode, search
 * ---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initMobileMenu();
  initThemeToggle();
  initSearch();
  initScrollProgress();
  initBackToTop();
  initRevealOnScroll();
  initFAQ();
  initNewsletterForm();
  initContactForm();
  initAuthNav();
  renderTestimonials();
  renderFAQs();
  renderHomeSections();
  renderProductsPage();
  renderProductDetailPage();
  window.CartStore && window.CartStore.updateBadges();
});

/**
 * Checks the backend session (if js/api.js is loaded on this page) and
 * swaps the Login/Register buttons for Account/Logout when the visitor
 * is signed in. Does nothing if api.js wasn't included on this page.
 */
window.currentUser = null;
async function initAuthNav() {
  if (!window.Api) return;
  try {
    const { user } = await Api.auth.me();
    window.currentUser = user;
    document.querySelectorAll("[data-auth-guest]").forEach(el => el.classList.add("is-hidden"));
    document.querySelectorAll("[data-auth-user]").forEach(el => el.classList.remove("is-hidden"));
  } catch {
    window.currentUser = null;
    document.querySelectorAll("[data-auth-guest]").forEach(el => el.classList.remove("is-hidden"));
    document.querySelectorAll("[data-auth-user]").forEach(el => el.classList.add("is-hidden"));
  }

  document.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-logout-btn]")) return;
    try { await Api.auth.logout(); } catch { /* ignore */ }
    window.currentUser = null;
    window.location.href = "index.html";
  });
}

function initHeaderScroll() {
  const header = document.querySelector(".header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".nav-menu");
  if (!hamburger || !menu) return;
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("is-active");
    menu.classList.toggle("is-open");
    hamburger.setAttribute("aria-expanded", menu.classList.contains("is-open"));
  });
}

function initThemeToggle() {
  const toggle = document.querySelector(".theme-toggle");
  const root = document.documentElement;
  const saved = localStorage.getItem("gancique-theme");
  if (saved === "dark") root.setAttribute("data-theme", "dark");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("gancique-theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("gancique-theme", "dark");
    }
  });
}

function initSearch() {
  const searchBtn = document.querySelector(".search-toggle");
  const panel = document.querySelector(".search-panel");
  const input = document.querySelector(".search-input");
  const resultsBox = document.querySelector(".search-results");
  if (!searchBtn || !panel) return;

  searchBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("is-open");
    if (panel.classList.contains("is-open")) input.focus();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !searchBtn.contains(e.target)) {
      panel.classList.remove("is-open");
    }
  });

  input?.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { resultsBox.innerHTML = ""; return; }
    const matches = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    ).slice(0, 6);

    if (matches.length === 0) {
      resultsBox.innerHTML = `<div class="search-empty">No keychains found for "${escapeHtml(input.value)}"</div>`;
      return;
    }
    resultsBox.innerHTML = matches.map(p => `
      <a href="product-detail.html?id=${p.id}" class="search-result-item">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div>
          <div class="sr-name">${p.name}</div>
          <div class="sr-price">${formatPrice(p.price)}</div>
        </div>
      </a>
    `).join("");
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = `${scrolled}%`;
  }, { passive: true });
}

function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initRevealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach(i => i.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(i => observer.observe(i));
}

function initFAQ() {
  document.addEventListener("click", (e) => {
    const q = e.target.closest(".faq-question");
    if (!q) return;
    q.closest(".faq-item").classList.toggle("is-open");
  });
}

function initNewsletterForm() {
  const form = document.querySelector(".newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const msg = form.parentElement.querySelector(".newsletter-msg");
    if (!input.value || !input.value.includes("@")) {
      if (msg) { msg.textContent = "Please enter a valid email address."; msg.style.color = "#FCA5A5"; }
      return;
    }
    if (msg) { msg.textContent = "Thanks for subscribing! Check your inbox for a welcome discount."; msg.style.color = "#BBF7D0"; }
    form.reset();
  });
}

function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach(field => {
      const errorEl = field.closest(".form-group")?.querySelector(".form-error");
      if (!field.value.trim()) {
        valid = false;
        if (errorEl) errorEl.textContent = "This field is required.";
      } else if (field.type === "email" && !field.value.includes("@")) {
        valid = false;
        if (errorEl) errorEl.textContent = "Please enter a valid email.";
      } else if (errorEl) {
        errorEl.textContent = "";
      }
    });
    if (!valid) return;
    showToast("Your message has been sent. We'll reply within 24 hours.");
    form.reset();
  });
}

function showToast(text) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("is-visible");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}
window.showToast = showToast;

/* ---------------------------------------------------------------------- *
 * 5. RENDER: Testimonials & FAQ (shared across pages that include them)
 * ---------------------------------------------------------------------- */
function renderTestimonials() {
  const grid = document.querySelector("[data-testimonials]");
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">${buildStars(t.rating)}</div>
      <p class="testimonial-text">"${escapeHtml(t.text)}"</p>
      <div class="testimonial-user">
        <img class="avatar" src="${t.avatar}" alt="${t.name}" loading="lazy">
        <div>
          <strong>${t.name}</strong>
          <span>Verified Buyer</span>
        </div>
      </div>
    </div>
  `).join("");
  initRevealOnScroll();
}

function renderFAQs() {
  const list = document.querySelector("[data-faq]");
  if (!list) return;
  list.innerHTML = FAQS.map(f => `
    <div class="faq-item">
      <button class="faq-question" aria-expanded="false">
        ${f.q}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <div class="faq-answer"><div class="faq-answer-inner">${f.a}</div></div>
    </div>
  `).join("");
}

/* ---------------------------------------------------------------------- *
 * 6. RENDER: Product card (shared markup used on Home & Products page)
 * ---------------------------------------------------------------------- */
function productCardHTML(p) {
  const badgeMap = { best: ["Best Seller", "badge-best"], new: ["New", "badge-new"], sale: ["Sale", "badge-sale"] };
  const badge = p.badge && badgeMap[p.badge]
    ? `<span class="product-badge ${badgeMap[p.badge][1]}">${badgeMap[p.badge][0]}</span>` : "";
  const oldPrice = p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : "";
  const isFav = window.CartStore?.isWishlisted(p.id);

  return `
    <div class="product-card reveal" data-id="${p.id}" data-category="${p.category}" data-price="${p.price}" data-rating="${p.rating}">
      <div class="product-thumb">
        ${badge}
        <button class="fav-btn ${isFav ? "is-active" : ""}" data-wishlist="${p.id}" aria-label="Add to wishlist">${svgIcon("heart")}</button>
        <a href="product-detail.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a>
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <a href="product-detail.html?id=${p.id}"><h3 class="product-name">${p.name}</h3></a>
        <div class="product-rating"><span class="stars">${buildStars(p.rating)}</span> (${p.reviews})</div>
        <div class="product-price-row">
          <span class="price">${formatPrice(p.price)}</span>
          ${oldPrice}
        </div>
        <button class="add-cart-btn" data-add-cart="${p.id}">${svgIcon("cart")} Add to Cart</button>
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------------- *
 * 7. HOME PAGE
 * ---------------------------------------------------------------------- */
function renderHomeSections() {
  const featuredGrid = document.querySelector("[data-featured-products]");
  if (featuredGrid) {
    const featured = PRODUCTS.filter(p => p.badge === "best" || p.badge === "new").slice(0, 8);
    featuredGrid.innerHTML = featured.map(productCardHTML).join("");
  }

  const catGrid = document.querySelector("[data-categories]");
  if (catGrid) {
    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    catGrid.innerHTML = categories.map(cat => {
      const count = PRODUCTS.filter(p => p.category === cat).length;
      return `
        <a href="products.html?category=${encodeURIComponent(cat)}" class="category-card reveal">
          <div class="category-icon">${categoryIcon(cat)}</div>
          <div class="category-name">${cat}</div>
          <div class="category-count">${count} designs</div>
        </a>
      `;
    }).join("");
  }
  initRevealOnScroll();
}

function categoryIcon(cat) {
  const icons = {
    "Anime": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M8 15c1.2 1 2.6 1.5 4 1.5s2.8-.5 4-1.5"/></svg>`,
    "Gaming": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 10v4M5 12h4M15.5 12h.01M18 10h.01"/></svg>`,
    "Custom Name": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    "Couple": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
    "Cars": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM3 17V9l2-5h14l2 5v8"/></svg>`,
    "Motorcycles": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M8 17h5l3-7h3M11 10 8 5H5"/></svg>`,
    "Cute Animals": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><path d="M8 6 6 2M16 6l2-4M9.5 13h.01M14.5 13h.01M9 16.5c1 .8 2 1 3 1s2-.2 3-1"/></svg>`,
    "Accessories": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M12 11v10M9 21h6"/></svg>`
  };
  return icons[cat] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>`;
}

/* ---------------------------------------------------------------------- *
 * 8. PRODUCTS (SHOP) PAGE — filtering, sorting, search params
 * ---------------------------------------------------------------------- */
function renderProductsPage() {
  const grid = document.querySelector("[data-shop-grid]");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const state = {
    category: params.get("category") || "all",
    maxPrice: 20,
    sort: "popularity",
    query: params.get("q") || ""
  };

  const categoryCheckboxes = document.querySelectorAll("[data-filter-category]");
  const priceSlider = document.querySelector("[data-filter-price]");
  const priceValueLabel = document.querySelector("[data-price-value]");
  const sortSelect = document.querySelector("[data-sort-select]");
  const resultCount = document.querySelector("[data-result-count]");

  if (state.category !== "all") {
    categoryCheckboxes.forEach(cb => { cb.checked = cb.value === state.category; });
  }

  function apply() {
    let list = [...PRODUCTS];

    const checkedCats = [...categoryCheckboxes].filter(cb => cb.checked).map(cb => cb.value);
    if (checkedCats.length > 0) {
      list = list.filter(p => checkedCats.includes(p.category));
    }

    if (priceSlider) {
      list = list.filter(p => p.price <= Number(priceSlider.value));
    }

    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    const sortBy = sortSelect ? sortSelect.value : "popularity";
    if (sortBy === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") list = list.filter(p => p.badge === "new").concat(list.filter(p => p.badge !== "new"));
    else list.sort((a, b) => b.reviews - a.reviews);

    if (resultCount) resultCount.textContent = `${list.length} product${list.length !== 1 ? "s" : ""} found`;

    grid.innerHTML = list.length
      ? list.map(productCardHTML).join("")
      : `<div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h3>No keychains match your filters</h3>
          <p>Try adjusting your category or price range.</p>
        </div>`;
    initRevealOnScroll();
    window.CartStore && window.CartStore.updateBadges();
  }

  categoryCheckboxes.forEach(cb => cb.addEventListener("change", apply));
  priceSlider?.addEventListener("input", () => {
    if (priceValueLabel) priceValueLabel.textContent = `$${priceSlider.value}`;
    apply();
  });
  sortSelect?.addEventListener("change", apply);

  const clearBtn = document.querySelector("[data-clear-filters]");
  clearBtn?.addEventListener("click", () => {
    categoryCheckboxes.forEach(cb => cb.checked = false);
    if (priceSlider) priceSlider.value = priceSlider.max;
    if (priceValueLabel) priceValueLabel.textContent = `$${priceSlider.max}`;
    if (sortSelect) sortSelect.value = "popularity";
    state.query = "";
    apply();
  });

  apply();
}

/* ---------------------------------------------------------------------- *
 * 9. PRODUCT DETAIL PAGE
 * ---------------------------------------------------------------------- */
function renderProductDetailPage() {
  const root = document.querySelector("[data-product-detail]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || PRODUCTS[0].id;
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  document.title = `${product.name} — Gancique Store`;

  root.querySelector("[data-pd-main-img]").src = product.image;
  root.querySelector("[data-pd-main-img]").alt = product.name;
  root.querySelectorAll("[data-pd-cat]").forEach(el => el.textContent = product.category);
  root.querySelector("[data-pd-title]").textContent = product.name;
  root.querySelector("[data-pd-stars]").textContent = buildStars(product.rating);
  root.querySelector("[data-pd-reviews]").textContent = `${product.rating} (${product.reviews} reviews)`;
  root.querySelector("[data-pd-price]").textContent = formatPrice(product.price);
  root.querySelector("[data-pd-desc]").textContent = product.description;

  const thumbsWrap = root.querySelector("[data-pd-thumbs]");
  thumbsWrap.innerHTML = [product.image, product.image, product.image].map((img, i) => `
    <div class="pd-thumb ${i === 0 ? "is-active" : ""}" data-thumb-src="${img}">
      <img src="${img}" alt="${product.name} view ${i + 1}" loading="lazy">
    </div>
  `).join("");
  thumbsWrap.querySelectorAll(".pd-thumb").forEach(t => {
    t.addEventListener("click", () => {
      thumbsWrap.querySelectorAll(".pd-thumb").forEach(x => x.classList.remove("is-active"));
      t.classList.add("is-active");
      root.querySelector("[data-pd-main-img]").src = t.dataset.thumbSrc;
    });
  });

  const colorsWrap = root.querySelector("[data-pd-colors]");
  colorsWrap.innerHTML = product.colors.map((c, i) => `
    <button class="color-swatch ${i === 0 ? "is-selected" : ""}" style="background:${c}" aria-label="Color option ${i + 1}"></button>
  `).join("");
  colorsWrap.querySelectorAll(".color-swatch").forEach(s => {
    s.addEventListener("click", () => {
      colorsWrap.querySelectorAll(".color-swatch").forEach(x => x.classList.remove("is-selected"));
      s.classList.add("is-selected");
    });
  });

  const qtyWrap = root.querySelector("[data-pd-qty]");
  let qty = 1;
  const qtyLabel = qtyWrap.querySelector("[data-qty-value]");
  qtyWrap.querySelector("[data-qty-minus]").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyLabel.textContent = qty;
  });
  qtyWrap.querySelector("[data-qty-plus]").addEventListener("click", () => {
    qty = Math.min(20, qty + 1);
    qtyLabel.textContent = qty;
  });

  root.querySelector("[data-pd-add-cart]").addEventListener("click", () => {
    window.CartStore.addItem(product, qty);
    showToast(`${product.name} added to cart`);
  });
  root.querySelector("[data-pd-buy-now]").addEventListener("click", () => {
    window.CartStore.addItem(product, qty);
    window.CartStore.openDrawer();
  });

  const favBtn = root.querySelector("[data-pd-fav]");
  if (window.CartStore.isWishlisted(product.id)) favBtn.classList.add("is-active");
  favBtn.addEventListener("click", () => {
    window.CartStore.toggleWishlist(product.id);
    favBtn.classList.toggle("is-active");
  });

  const relatedGrid = root.querySelector("[data-pd-related]");
  if (relatedGrid) {
    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    relatedGrid.innerHTML = (related.length ? related : PRODUCTS.filter(p => p.id !== product.id).slice(0, 4)).map(productCardHTML).join("");
  }

  const fbtRow = root.querySelector("[data-pd-fbt]");
  if (fbtRow) {
    const accessory = PRODUCTS.find(p => p.category === "Accessories" && p.id !== product.id);
    const extra = PRODUCTS.find(p => p.id !== product.id && p.id !== accessory?.id);
    const bundle = [product, accessory, extra].filter(Boolean);
    fbtRow.querySelector("[data-fbt-items]").innerHTML = bundle.map((p, i) => `
      ${i > 0 ? '<span class="fbt-plus">+</span>' : ""}
      <div class="fbt-item"><img src="${p.image}" alt="${p.name}"><span>${p.name}</span><strong>${formatPrice(p.price)}</strong></div>
    `).join("");
    const total = bundle.reduce((sum, p) => sum + p.price, 0);
    fbtRow.querySelector("[data-fbt-total-price]").textContent = formatPrice(total);
    fbtRow.querySelector("[data-fbt-add-all]").addEventListener("click", () => {
      bundle.forEach(p => window.CartStore.addItem(p, 1));
      showToast("Bundle added to cart");
    });
  }

  initRevealOnScroll();
}
