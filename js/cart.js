// Cart page specific functionality
const container = window.container;
function renderCartPage() {
  const cart = getStorage("cart") || [];
  let cartItems = [];
  if (
    cart.length &&
    typeof cart[0] === "object" &&
    cart[0].productId !== undefined
  ) {
    cartItems = cart.map((it) => ({
      productId: it.productId,
      quantity: it.quantity || 1,
    }));
  } else {
    cartItems = cart.map((id) => ({ productId: id, quantity: 1 }));
  }
  const ids = cartItems.map((it) => it.productId);
  const filtered = products.filter((p) => ids.includes(p.id));
  const total = filtered
    .reduce((sum, p) => {
      const ci = cartItems.find((it) => it.productId === p.id) || {
        quantity: 1,
      };
      return sum + p.price * (ci.quantity || 1);
    }, 0)
    .toFixed(2);
  container.innerHTML = `
    <div class="category-section">
      <h2 class="category-title">MY CART</h2>
      <div class="category-grid">
        ${filtered
          .map((p) => {
            const ci = cartItems.find((it) => it.productId === p.id) || {
              quantity: 1,
            };
            const itemTotal = (p.price * (ci.quantity || 1)).toFixed(2);
            return `
          <div class="product-card" data-id="${p.id}">
            <img src="${p.image}" class="product-image">
            <h3>${escapeHtml(p.title)}</h3>
            <p class="unit-price">Unit: $${p.price.toFixed(2)}</p>
            <div class="card-actions">
              <div class="quantity-controls">
                <button class="qty-btn minus" data-id="${p.id}">-</button>
                <span class="qty-value" data-id="${p.id}">${
              ci.quantity || 1
            }</span>
                <button class="qty-btn plus" data-id="${p.id}">+</button>
              </div>
              <div class="item-total" data-id="${p.id}">$${itemTotal}</div>
            </div>
          </div>
        `;
          })
          .join("")}
      </div>
      <div id="cart-stats" style="text-align:center; margin:2em; font-size:1.2rem; font-weight:bold;">
        Items: ${cartItems.reduce(
          (s, it) => s + (it.quantity || 1),
          0
        )} | Total: $${total}
      </div>
      <div style="text-align:center; margin-bottom:2em;">
        <button id="proceed-checkout" class="checkout-button" ${
          filtered.length === 0 ? "disabled" : ""
        }>Proceed to Checkout</button>
      </div>
    </div>
  `;
  bindCardEvents();
  document.querySelectorAll(".qty-btn.plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      changeQuantity(id, 1);
    });
  });
  document.querySelectorAll(".qty-btn.minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      changeQuantity(id, -1);
    });
  });
  const proceedBtn = document.getElementById("proceed-checkout");
  if (proceedBtn) {
    proceedBtn.addEventListener("click", () => {
      const rawCart = getStorage("cart") || [];
      let cartForCheckout = [];
      if (
        rawCart.length &&
        typeof rawCart[0] === "object" &&
        rawCart[0].productId !== undefined
      ) {
        cartForCheckout = rawCart.map((it) => ({
          productId: it.productId,
          quantity: it.quantity || 1,
        }));
      } else {
        cartForCheckout = rawCart.map((id) => ({ productId: id, quantity: 1 }));
      }
      localStorage.setItem("checkout_cart", JSON.stringify(cartForCheckout));
      window.location.href = "checkout.html";
    });
  }
}
function changeQuantity(productId, delta) {
  let cart = getStorage("cart") || [];
  if (
    !(
      cart.length &&
      typeof cart[0] === "object" &&
      cart[0].productId !== undefined
    )
  ) {
    cart = cart.map((id) => ({ productId: id, quantity: 1 }));
  }
  const idx = cart.findIndex((it) => it.productId === productId);
  if (idx === -1 && delta > 0) {
    cart.push({ productId, quantity: delta });
  } else if (idx !== -1) {
    cart[idx].quantity = (cart[idx].quantity || 1) + delta;
    if (cart[idx].quantity <= 0) {
      cart.splice(idx, 1);
    }
  }
  setStorage("cart", cart);
  localStorage.setItem("checkout_cart", JSON.stringify(cart));
  renderCartPage();
}
fetchProducts().then(() => renderCartPage());
