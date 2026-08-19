/* ==========================================================================
   Gancique Store — cart.js
   Shopping cart + wishlist logic. Persists to localStorage so the cart
   survives a page reload or navigating between pages.
   ========================================================================== */

const CartStore = (() => {
  const CART_KEY = "gancique-cart";
  const WISHLIST_KEY = "gancique-wishlist";

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadges();
    renderDrawer();
  }
  function readWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch { return []; }
  }
  function writeWishlist(ids) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    updateBadges();
  }

  function addItem(product, qty = 1) {
    const items = readCart();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(20, existing.qty + qty);
    } else {
      items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
    }
    writeCart(items);
  }

  function updateQty(id, delta) {
    const items = readCart();
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(20, item.qty + delta));
    writeCart(items);
  }

  function removeItem(id) {
    writeCart(readCart().filter(i => i.id !== id));
  }

  function clearCart() { writeCart([]); }

  function getTotals() {
    const items = readCart();
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = items.length === 0 ? 0 : (subtotal >= 35 ? 0 : 4.99);
    const total = subtotal + shipping;
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    return { subtotal, shipping, total, count };
  }

  function toggleWishlist(id) {
    let ids = readWishlist();
    if (ids.includes(id)) ids = ids.filter(x => x !== id);
    else ids.push(id);
    writeWishlist(ids);
  }

  function isWishlisted(id) {
    return readWishlist().includes(id);
  }

  function updateBadges() {
    const { count } = getTotals();
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "grid" : "none";
    });
    const wishCount = readWishlist().length;
    document.querySelectorAll("[data-wishlist-count]").forEach(el => {
      el.textContent = wishCount;
      el.style.display = wishCount > 0 ? "grid" : "none";
    });
  }

  function openDrawer() {
    document.querySelector(".cart-overlay")?.classList.add("is-open");
    document.querySelector(".cart-drawer")?.classList.add("is-open");
    document.body.style.overflow = "hidden";
    renderDrawer();
  }
  function closeDrawer() {
    document.querySelector(".cart-overlay")?.classList.remove("is-open");
    document.querySelector(".cart-drawer")?.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function renderDrawer() {
    const itemsWrap = document.querySelector("[data-cart-items]");
    if (!itemsWrap) return;
    const items = readCart();
    const { subtotal, shipping, total } = getTotals();

    if (items.length === 0) {
      itemsWrap.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <p>Your cart is empty.</p>
          <a href="products.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Start Shopping</a>
        </div>`;
    } else {
      itemsWrap.innerHTML = items.map(i => `
        <div class="cart-item" data-cart-item="${i.id}">
          <img src="${i.image}" alt="${i.name}">
          <div>
            <div class="cart-item-name">${i.name}</div>
            <div class="cart-item-meta">$${i.price.toFixed(2)} each</div>
            <div class="qty-control">
              <button data-cart-minus="${i.id}" aria-label="Decrease quantity">−</button>
              <span>${i.qty}</span>
              <button data-cart-plus="${i.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <strong>$${(i.price * i.qty).toFixed(2)}</strong>
            <button class="remove-item" data-cart-remove="${i.id}">Remove</button>
          </div>
        </div>
      `).join("");
    }

    const footer = document.querySelector("[data-cart-footer]");
    if (footer) {
      footer.innerHTML = `
        <div class="cart-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="cart-row"><span>Shipping</span><span>${items.length ? (shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`) : "$0.00"}</span></div>
        <div class="cart-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        <button class="btn btn-primary btn-block" style="margin-top:12px;" ${items.length ? "" : "disabled"} data-checkout>Checkout</button>
      `;
    }
  }

  function init() {
    updateBadges();
    renderDrawer();

    document.addEventListener("click", (e) => {
      const addBtn = e.target.closest("[data-add-cart]");
      if (addBtn) {
        const product = window.PRODUCTS.find(p => p.id === addBtn.dataset.addCart);
        if (product) {
          addItem(product, 1);
          showToast(`${product.name} added to cart`);
        }
      }

      const favBtn = e.target.closest("[data-wishlist]");
      if (favBtn) {
        toggleWishlist(favBtn.dataset.wishlist);
        favBtn.classList.toggle("is-active");
      }

      if (e.target.closest("[data-cart-open]")) openDrawer();
      if (e.target.closest("[data-cart-close]") || e.target.closest(".cart-overlay")) closeDrawer();

      const minus = e.target.closest("[data-cart-minus]");
      if (minus) updateQty(minus.dataset.cartMinus, -1);
      const plus = e.target.closest("[data-cart-plus]");
      if (plus) updateQty(plus.dataset.cartPlus, 1);
      const remove = e.target.closest("[data-cart-remove]");
      if (remove) removeItem(remove.dataset.cartRemove);

      if (e.target.closest("[data-checkout]")) {
        checkoutFlow();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  /**
   * If the visitor is logged in (js/api.js loaded + valid session), push the
   * local cart to the server, place a real order via POST /api/orders/checkout,
   * and clear the local cart. Otherwise fall back to the original client-only
   * simulation so guests keep working exactly as before.
   */
  async function checkoutFlow() {
    const items = readCart();
    if (items.length === 0) return;

    if (window.Api && window.currentUser) {
      try {
        await Api.cart.merge(items.map(i => ({ productId: i.id, quantity: i.qty })));
        const { order } = await Api.orders.checkout();
        clearCart();
        closeDrawer();
        showToast(`Order #${order.id} placed! View it in your account's order history.`);
      } catch (err) {
        showToast(err.message || "Checkout failed. Please try again.");
      }
      return;
    }

    // Guest checkout simulation (no backend order is recorded).
    clearCart();
    closeDrawer();
    showToast("Order placed! Log in next time to save your order history.");
  }

  return { init, addItem, updateQty, removeItem, clearCart, getTotals, toggleWishlist, isWishlisted, updateBadges, openDrawer, closeDrawer, renderDrawer };
})();

window.CartStore = CartStore;
document.addEventListener("DOMContentLoaded", () => CartStore.init());
