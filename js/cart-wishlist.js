// Add after the storage functions in common.js

// Helper: Toggle icon classes for heart/cart
function toggleIconClasses(icon, isActive, baseClass) {
  if (!icon) return;
  icon.classList.toggle('fa-solid', isActive);
  icon.classList.toggle('fa-regular', !isActive);
  if (!icon.classList.contains(baseClass)) icon.classList.add(baseClass);
}

// Helper: Get current page
function getPage() {
  const path = window.location.pathname;
  if (path.endsWith("mywishlist.html")) return "wishlist";
  if (path.endsWith("mycart.html")) return "cart";
  if (path.endsWith("index.html") || path.endsWith('/')) return "home";
  return "";
}

// Cart and Wishlist functions
function toggleWishlist(productId) {
  const wishlist = getStorage("wishlist");
  const idx = wishlist.indexOf(productId);
  idx === -1 ? wishlist.push(productId) : wishlist.splice(idx, 1);
  setStorage("wishlist", wishlist);
  updateWishlistUI(productId);
  updateNavCounts();
  const page = getPage();
  if (page === "wishlist") renderWishlistPage();
  else if (page === "cart") renderCartPage();
  else if (page === "home") updateProductCard(productId);
}

function toggleCart(productId) {
  const cart = getStorage("cart");
  const idx = cart.indexOf(productId);
  idx === -1 ? cart.push(productId) : cart.splice(idx, 1);
  setStorage("cart", cart);
  updateCartUI(productId);
  updateNavCounts();
  const page = getPage();
  if (page === "cart") renderCartPage();
  else if (page === "wishlist") renderWishlistPage();
  else if (page === "home") updateProductCard(productId);
}

// UI Update functions
function updateWishlistUI(productId) {
  const wishlist = getStorage("wishlist");
  document.querySelectorAll(`.heart-btn[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle("active", wishlist.includes(productId));
    toggleIconClasses(btn.querySelector('i'), wishlist.includes(productId), 'fa-heart');
  });
}

function updateCartUI(productId) {
  const cart = getStorage("cart");
  const inCart = Array.isArray(cart) && cart.length && typeof cart[0] === 'object'
    ? cart.some(it => it.productId === productId)
    : cart.includes(productId);
  document.querySelectorAll(`.cart-btn[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle("active", inCart);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.add('fa-cart-shopping', 'fa-solid');
      icon.classList.remove('fa-regular');
    }
  });
}

// Update a single product card
function updateProductCard(productId) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (!card) return;
  const wishlist = getStorage("wishlist");
  const cart = getStorage("cart");
  const heartBtn = card.querySelector('.heart-btn');
  const cartBtn = card.querySelector('.cart-btn');
  if (heartBtn) {
    heartBtn.classList.toggle("active", wishlist.includes(productId));
    toggleIconClasses(heartBtn.querySelector('i'), wishlist.includes(productId), 'fa-heart');
  }
  if (cartBtn) {
    cartBtn.classList.toggle("active", cart.includes(productId));
    const icon = cartBtn.querySelector('i');
    if (icon) {
      icon.classList.add('fa-cart-shopping', 'fa-solid');
      icon.classList.remove('fa-regular');
    }
  }
}

// Get cart/wishlist counts
function getCartCount() {
  const cart = getStorage('cart');
  if (!cart || !Array.isArray(cart)) return 0;
  
  return cart.length;
}
function getWishlistCount() {
  return getStorage("wishlist").length;
}

// Update navigation icons with counts and styles
function updateNavCounts() {
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();
  const cartIcon = document.getElementById("nav-cart");
  const wishlistIcon = document.getElementById("nav-heart");
  if (cartIcon) {
    cartIcon.setAttribute('data-count', cartCount);
    cartIcon.classList.toggle('has-items', cartCount > 0);
    const i = cartIcon.tagName.toLowerCase() === 'i' ? cartIcon : cartIcon.querySelector('i');
    if (i) i.classList.add('fa-cart-shopping', 'fa-solid');
  }
  if (wishlistIcon) {
    wishlistIcon.setAttribute('data-count', wishlistCount);
    wishlistIcon.classList.toggle('has-items', wishlistCount > 0);
    const i = wishlistIcon.tagName.toLowerCase() === 'i' ? wishlistIcon : wishlistIcon.querySelector('i');
    if (i) {
      i.classList.toggle('fa-solid', wishlistCount > 0);
      i.classList.toggle('fa-regular', wishlistCount === 0);
    }
  }
}

function initializeCartWishlist() {
  document.querySelectorAll('.product-card').forEach(card => {
    updateProductCard(parseInt(card.dataset.id));
  });
  updateNavCounts();
}
document.addEventListener('DOMContentLoaded', initializeCartWishlist);

Object.assign(window, {
  toggleWishlist,
  toggleCart,
  updateNavCounts,
  updateProductCard
});

