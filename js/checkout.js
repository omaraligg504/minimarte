// checkout.js - render checkout page and handle form submission
import './common.js';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.updateNavCounts === 'function') window.updateNavCounts();
  const checkoutItemsContainer = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('subtotal-amount');
  const totalEl = document.getElementById('total-amount');
  const checkoutForm = document.getElementById('checkout-form');

  // read cart from localStorage (prefer the checkout_cart saved by Proceed button)
  const rawCheckout = JSON.parse(localStorage.getItem('checkout_cart') || 'null');
  const rawCart = rawCheckout || getStorage('cart') || [];
  // normalize to objects { productId, quantity }
  let cartItems = [];
  if (rawCart.length && typeof rawCart[0] === 'object' && rawCart[0].productId !== undefined) {
    cartItems = rawCart.map(it => ({ productId: it.productId, quantity: it.quantity || 1 }));
  } else {
    cartItems = rawCart.map(id => ({ productId: id, quantity: 1 }));
  }

  // fetch product details from shared products array if available, otherwise fetch
  const ensureProducts = async () => {
    if (!window.products || window.products.length === 0) {
      await fetchProducts();
    }
    return window.products;
  };

  function render() {
    ensureProducts().then((products) => {
      const ids = cartItems.map(it => it.productId);
      const items = products.filter(p => ids.includes(p.id));
      checkoutItemsContainer.innerHTML = '';
      let subtotal = 0;
      items.forEach(p => {
        const ci = cartItems.find(it => it.productId === p.id) || { quantity: 1 };
        subtotal += p.price * (ci.quantity || 1);
        const el = document.createElement('div');
        el.className = 'checkout-item';
        el.innerHTML = `
          <img src="${p.image}" alt="${escapeHtml(p.title)}">
          <div class="item-details">
            <h3>${escapeHtml(p.title)}</h3>
            <div class="price">$${p.price.toFixed(2)}</div>
            <div class="quantity">Quantity: ${ci.quantity || 1}</div>
          </div>
        `;
        checkoutItemsContainer.appendChild(el);
      });
      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      // for now no shipping/tax calculation
      totalEl.textContent = `$${subtotal.toFixed(2)}`;
    });
  }

  // Prefill form fields if saved previously
  const savedForm = JSON.parse(localStorage.getItem('checkout_form') || 'null');
  if (savedForm) {
    ['fullName','email','phone','address','city','zipCode'].forEach(k => {
      const el = document.getElementById(k);
      if (el && savedForm[k]) el.value = savedForm[k];
    });
  }

  // Simple helper to show inline error
  function showFieldError(el, msg) {
    el.classList.add('input-error');
    let err = el.nextElementSibling;
    if (!err || !err.classList || !err.classList.contains('field-error')) {
      err = document.createElement('div');
      err.className = 'field-error';
      el.parentNode.insertBefore(err, el.nextSibling);
    }
    err.textContent = msg;
  }

  function clearFieldError(el) {
    el.classList.remove('input-error');
    const err = el.parentNode.querySelector('.field-error');
    if (err) err.remove();
  }

  render();

  // handle form submit
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(checkoutForm);
    // basic validation
    let valid = true;
    ['fullName','email','phone','address','city','zipCode'].forEach(k => {
      const el = document.getElementById(k);
      clearFieldError(el);
      if (!el || !el.value.trim()) {
        showFieldError(el, 'This field is required');
        valid = false;
      }
    });
    // simple email pattern
    const emailEl = document.getElementById('email');
    if (emailEl && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      showFieldError(emailEl, 'Enter a valid email');
      valid = false;
    }
    if (!valid) return;

    const order = {
      fullName: form.get('fullName'),
      email: form.get('email'),
      phone: form.get('phone'),
      address: form.get('address'),
      city: form.get('city'),
      zipCode: form.get('zipCode'),
      items: cartItems,
      placedAt: new Date().toISOString(),
    };

    // simulate order placement: clear cart and show success
    setStorage('cart', []);
    localStorage.removeItem('checkout_cart');
    // persist the filled form so user can come back later
    localStorage.setItem('checkout_form', JSON.stringify({
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      zipCode: order.zipCode
    }));
    // update nav counts
    if (typeof window.updateNavCounts === 'function') window.updateNavCounts();

    const main = document.querySelector('main.checkout-container');
    main.innerHTML = `
      <div class="success-message">
        <i class="fa-solid fa-circle-check"></i>
        <h2>Order placed successfully!</h2>
        <p>Thank you, ${escapeHtml(order.fullName)}. Your order has been received.</p>
      </div>
    `;
  });
});
