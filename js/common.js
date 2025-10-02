// Common functions and variables used across multiple pages

// Constants
const CARD_MIN_WIDTH = 280; // px - the card minimum width used for fit calculation
const MIN_GAP = 8; // px - minimum allowed gap between items
const MAX_GAP = 24; // px - maximum reasonable gap
const MAX_VISIBLE = 4; // maximum items to show on wide screens

// Shared variables
let products = [];
const searchInput = document.getElementById("search");
// Share a single DOM reference for the main products container to avoid
// duplicate top-level declarations across multiple script files which
// can cause "Identifier ... has already been declared" errors.
window.container = window.container || document.getElementById('products-container');

// Utility functions
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getVisibleCountForWidth(availableWidth) {
  const GAP = 24; // Fixed gap size
  
  // Calculate widths for different numbers of items
  const width4 = (CARD_MIN_WIDTH * 4) + (GAP * 3); // 4 items + 3 gaps
  const width3 = (CARD_MIN_WIDTH * 3) + (GAP * 2); // 3 items + 2 gaps
  const width2 = (CARD_MIN_WIDTH * 2) + GAP;       // 2 items + 1 gap
  const width1 = CARD_MIN_WIDTH;                    // 1 item, no gaps
  
  // Return exact fits based on available width
  if (availableWidth >= width4) {
    return {
      visibleCount: 4,
      gap: GAP,
      exactWidth: width4
    };
  } else if (availableWidth >= width3) {
    return {
      visibleCount: 3,
      gap: GAP,
      exactWidth: width3
    };
  } else if (availableWidth >= width2) {
    return {
      visibleCount: 2,
      gap: GAP,
      exactWidth: width2
    };
  } else {
    return {
      visibleCount: 1,
      gap: 0,
      exactWidth: width1
    };
  }
}

// Create HTML string for a product card
function cardHTML(p) {
  let wishlist = getStorage("wishlist");
  let cart = getStorage("cart");

  // wishlist/cart might be stored as array of ids (legacy) or
  // array of objects { productId, quantity }. Handle both formats.
  const inWishlist = Array.isArray(wishlist) && wishlist.length && typeof wishlist[0] === 'object'
    ? wishlist.some(it => it.productId === p.id)
    : wishlist.includes(p.id);

  const inCart = Array.isArray(cart) && cart.length && typeof cart[0] === 'object'
    ? cart.some(it => it.productId === p.id)
    : cart.includes(p.id);

  return `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.image}" alt="${escapeHtml(p.title)}" class="product-image">
      <h3 class="product-title">${escapeHtml(p.title)}</h3>
      <p class="product-price">$${p.price}</p>
      <div class="card-actions">
        <button class="icon-btn heart-btn ${inWishlist ? "active" : ""}" data-id="${p.id}">
          <i class="fa-regular fa-heart"></i>
        </button>
        <button class="icon-btn cart-btn ${inCart ? "active" : ""}" data-id="${p.id}">
          <i class="fa-solid fa-cart-shopping"></i>
        </button>
      </div>
    </div>
  `;
}

// Local storage functions
function getStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Event binding function
function bindCardEvents() {
  document.querySelectorAll(".heart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.dataset.id);
      if (typeof window.toggleWishlist === 'function') {
        window.toggleWishlist(id);
      } else {
        console.warn('toggleWishlist is not defined. Make sure cart-wishlist.js is loaded before page scripts.');
      }
    });
  });

  document.querySelectorAll(".cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.dataset.id);
      if (typeof window.toggleCart === 'function') {
        window.toggleCart(id);
      } else {
        console.warn('toggleCart is not defined. Make sure cart-wishlist.js is loaded before page scripts.');
      }
    });
  });
}

// Fetch products function
async function fetchProducts() {
  const res = await fetch("https://fakestoreapi.com/products");
  products = await res.json();
  // expose on window for modules that expect window.products
  try { window.products = products; } catch (e) { /* ignore */ }
  return products;
}

// Grid update function
function updateSectionGrid(grid, items, startIndex, visibleCount, gap) {
  grid.style.transition = "opacity 150ms ease";
  grid.style.opacity = "0.6";
  setTimeout(() => {
    const showCount = Math.min(visibleCount, items.length);
    const visibleItems = [];
    for (let i = 0; i < showCount; i++) {
      visibleItems.push(items[(startIndex + i) % items.length]);
    }
    grid.style.gap = `${gap}px`;
    grid.style.justifyContent = visibleCount === 1 ? "center" : "flex-start";
    grid.innerHTML = visibleItems.map(cardHTML).join("");
    grid.style.opacity = "1";
  }, 80);
}
// Navigation state
let currentCategory = null;
let currentSubCategory = null;
let searchTerm = "";

// Navigation functions
function navigateToCategory(category) {
  if (category === "clothes") {
    showClothingCategories();
  } else {
    showCategoryProducts(category);
  }
}

function navigateToSubCategory(category, subCategory) {
  currentCategory = category;
  currentSubCategory = subCategory;
  if (window.location.pathname.endsWith("index.html")) {
    showCategoryProducts(subCategory);
  } else {
    window.location.href = `index.html?category=${subCategory}`;
  }
}

function showClothingCategories() {
  if (window.location.pathname.endsWith("index.html")) {
    renderSubset(["men's clothing", "women's clothing"]);
  } else {
    window.location.href = "index.html?category=clothes";
  }
}

function showCategoryProducts(category) {
  if (window.location.pathname.endsWith("index.html")) {
    renderCategoryOnly(category);
  } else {
    window.location.href = `index.html?category=${category}`;
  }
}

// Navigation event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Cart and Wishlist navigation
  document.getElementById("nav-heart")?.addEventListener("click", () => {
    window.location.href = "mywishlist.html";
  });
  document.getElementById("nav-cart")?.addEventListener("click", () => {
    window.location.href = "mycart.html";
  });
  document.getElementById("logo")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Category navigation
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category || btn.textContent.trim().toLowerCase();
      navigateToCategory(category);
    });
  });

  // Subcategory navigation
  document.querySelectorAll(".subcategory-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category || "clothing";
      const subCategory = btn.dataset.subcategory;
      navigateToSubCategory(category, subCategory);
    });
  });

  // Handle URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    if (categoryParam === 'clothes') {
      showClothingCategories();
    } else {
      showCategoryProducts(categoryParam);
    }
  }
});

// Search functionality
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    handleSearch();
  });
}

function handleSearch() {
  if (window.location.pathname.endsWith("index.html")) {
    if (currentCategory) {
      showCategoryProducts(currentCategory);
    } else {
      renderPage();
    }
  }
}
