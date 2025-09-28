// Add after the storage functions in common.js

// Cart and Wishlist functions
function toggleWishlist(productId) {
  const wishlist = getStorage("wishlist");
  const index = wishlist.indexOf(productId);
  
  if (index === -1) {
    wishlist.push(productId);
  } else {
    wishlist.splice(index, 1);
  }
  
  setStorage("wishlist", wishlist);
  
  // Update UI based on current page
  updateWishlistUI(productId);
  updateNavCounts();
  
  // Update the page based on current location
  if (window.location.pathname.endsWith("mywishlist.html")) {
    renderWishlistPage();
  } else if (window.location.pathname.endsWith("mycart.html")) {
    renderCartPage();
  } else if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith('/')) {
    updateProductCard(productId);
  }
}

function toggleCart(productId) {
  const cart = getStorage("cart");
  const index = cart.indexOf(productId);
  
  if (index === -1) {
    cart.push(productId);
  } else {
    cart.splice(index, 1);
  }
  
  setStorage("cart", cart);
  
  // Update UI based on current page
  updateCartUI(productId);
  updateNavCounts();
  
  // Update the page based on current location
  if (window.location.pathname.endsWith("mycart.html")) {
    renderCartPage();
  } else if (window.location.pathname.endsWith("mywishlist.html")) {
    renderWishlistPage();
  } else if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith('/')) {
    updateProductCard(productId);
  }
}

// UI Update functions
function updateWishlistUI(productId) {
  const wishlist = getStorage("wishlist");
  document.querySelectorAll(`.heart-btn[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle("active", wishlist.includes(productId));
    // Update the icon to show filled/unfilled heart using classList toggles
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-solid', wishlist.includes(productId));
      icon.classList.toggle('fa-regular', !wishlist.includes(productId));
      // ensure heart class exists
      if (!icon.classList.contains('fa-heart')) icon.classList.add('fa-heart');
    }
  });
}

function updateCartUI(productId) {
  const cart = getStorage("cart");
  const inCart = Array.isArray(cart) && cart.length && typeof cart[0] === 'object'
    ? cart.some(it => it.productId === productId)
    : cart.includes(productId);
  document.querySelectorAll(`.cart-btn[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle("active", inCart);
    // Update the icon to show solid cart using classList
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.add('fa-cart-shopping');
      icon.classList.add('fa-solid');
      icon.classList.remove('fa-regular');
    }
  });
}

// Function to update a single product card
function updateProductCard(productId) {
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (!card) return;

  const wishlist = getStorage("wishlist");
  const cart = getStorage("cart");

  const heartBtn = card.querySelector('.heart-btn');
  const cartBtn = card.querySelector('.cart-btn');

  if (heartBtn) {
    heartBtn.classList.toggle("active", wishlist.includes(productId));
    const icon = heartBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-solid', wishlist.includes(productId));
      icon.classList.toggle('fa-regular', !wishlist.includes(productId));
      if (!icon.classList.contains('fa-heart')) icon.classList.add('fa-heart');
    }
  }

  if (cartBtn) {
    cartBtn.classList.toggle("active", cart.includes(productId));
    const icon = cartBtn.querySelector('i');
    if (icon) {
      icon.classList.add('fa-cart-shopping');
      icon.classList.add('fa-solid');
      icon.classList.remove('fa-regular');
      cartBtn.classList.toggle('active', cart.includes(productId));
    }
  }
}

// Get cart/wishlist counts
function getCartCount() {
  const cart = getStorage('cart');
  if (!cart || !Array.isArray(cart)) return 0;
  if (cart.length && typeof cart[0] === 'object' && cart[0].productId !== undefined) {
    return cart.reduce((s, it) => s + (it.quantity || 0), 0);
  }
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
    // Update child <i> if present, otherwise toggle class on the element itself
    if (cartIcon.tagName.toLowerCase() === 'i') {
      cartIcon.classList.add('fa-cart-shopping');
      cartIcon.classList.add('fa-solid');
      cartIcon.classList.toggle('has-items', cartCount > 0);
    } else {
      const i = cartIcon.querySelector('i');
      if (i) {
        i.classList.add('fa-cart-shopping');
        i.classList.add('fa-solid');
        i.classList.toggle('has-items', cartCount > 0);
      }
    }
  }

  if (wishlistIcon) {
    wishlistIcon.setAttribute('data-count', wishlistCount);
    wishlistIcon.classList.toggle('has-items', wishlistCount > 0);
    if (wishlistIcon.tagName.toLowerCase() === 'i') {
      wishlistIcon.classList.toggle('fa-solid', wishlistCount > 0);
      wishlistIcon.classList.toggle('fa-regular', wishlistCount === 0);
      wishlistIcon.classList.toggle('has-items', wishlistCount > 0);
    } else {
      const i = wishlistIcon.querySelector('i');
      if (i) {
        i.classList.toggle('fa-solid', wishlistCount > 0);
        i.classList.toggle('fa-regular', wishlistCount === 0);
        i.classList.toggle('has-items', wishlistCount > 0);
      }
    }
  }
}

// Initialize the page
function initializeCartWishlist() {
  // Update all product cards on the page
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = parseInt(card.dataset.id);
    updateProductCard(productId);
  });
  
  // Update navigation icons
  updateNavCounts();
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', initializeCartWishlist);

// Make functions available globally
window.toggleWishlist = toggleWishlist;
window.toggleCart = toggleCart;
window.updateNavCounts = updateNavCounts;
window.updateProductCard = updateProductCard;

// Debug: confirm functions are exposed
document.addEventListener('DOMContentLoaded', () => {
  console.info('cart-wishlist loaded:', {
    toggleWishlist: typeof window.toggleWishlist,
    toggleCart: typeof window.toggleCart,
    updateNavCounts: typeof window.updateNavCounts,
  });
});