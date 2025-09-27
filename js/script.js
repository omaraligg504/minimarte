// script.js - responsive category carousels with subcategories + centered items

const container = document.getElementById("products-container");
const searchInput = document.getElementById("search");
const logo = document.querySelector(".logo");

let products = [];
let categoryIndices = {}; // start index per category for carousel
let mode = "all"; // 'all' or 'category'
let selectedCategory = null;
let selectedSubCategory = null;

const CARD_MIN_WIDTH = 280; // px - the card minimum width used for fit calculation
const MIN_GAP = 8; // px - minimum allowed gap between items
const MAX_GAP = 24; // px - maximum reasonable gap
const MAX_VISIBLE = 4; // maximum items to show on wide screens

// fetch products and render initial page
async function fetchProducts() {
  const res = await fetch("https://fakestoreapi.com/products");
  products = await res.json();
  renderPage();
}

function getVisibleCountForWidth(availableWidth) {
  for (let k = MAX_VISIBLE; k >= 1; k--) {
    if (k === 1) {
      if (CARD_MIN_WIDTH <= availableWidth) return { visibleCount: 1, gap: 0 };
      continue;
    }
    const gap = (availableWidth - k * CARD_MIN_WIDTH) / (k - 1);
    if (gap >= MIN_GAP) {
      return { visibleCount: k, gap: Math.min(gap, MAX_GAP) };
    }
  }
  return { visibleCount: 1, gap: 0 };
}

// create HTML string for a product card
function cardHTML(p) {
  let wishlist = getStorage("wishlist");
  let cart = getStorage("cart");

  const inWishlist = wishlist.includes(p.id);
  const inCart = cart.includes(p.id);

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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Normal multi-category page (carousels) ---------- */
function renderPage() {
  mode = "all";
  selectedCategory = null;
  selectedSubCategory = null;
  container.classList.remove("category-only");
  container.innerHTML = "";

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();

  const categories = {};
  products.forEach((p) => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm)) return;
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  Object.entries(categories).forEach(([category, items]) => {
    if (!(category in categoryIndices)) categoryIndices[category] = 0;
    categoryIndices[category] = categoryIndices[category] % items.length;

    const section = document.createElement("div");
    section.className = "category-section";

    const title = document.createElement("h2");
    title.className = "category-title";
    title.textContent = category.toUpperCase();

    // Make category titles clickable, like nav buttons
    title.style.cursor = "pointer";
    title.addEventListener("click", () => {
      if (category === "clothing" || category === "clothes") {
        renderSubset(["men's clothing", "women's clothing"]);
      } else if (
        category === "men's clothing" ||
        category === "women's clothing"
      ) {
        renderCategoryOnly(category);
      } else {
        renderCategoryOnly(category);
      }
    });

    section.appendChild(title);

    const wrapper = document.createElement("div");
    wrapper.className = "carousel-wrapper";

    const grid = document.createElement("div");
    grid.className = "category-grid";

    wrapper.appendChild(grid);
    section.appendChild(wrapper);
    container.appendChild(section);

    const availableWidth = Math.floor(wrapper.clientWidth);
    const { visibleCount, gap } = getVisibleCountForWidth(availableWidth);

    grid.style.gap = `${gap}px`;
    grid.style.justifyContent = visibleCount === 1 ? "center" : "flex-start";

    const start = categoryIndices[category];
    const showCount = Math.min(visibleCount, items.length);
    let visibleItems = [];
    for (let i = 0; i < showCount; i++) {
      visibleItems.push(items[(start + i) % items.length]);
    }

    grid.innerHTML = visibleItems.map(cardHTML).join("");
    grid.querySelectorAll(".wishlist-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        toggleWishlist(parseInt(btn.dataset.id))
      );
    });
    grid.querySelectorAll(".cart-btn").forEach((btn) => {
      btn.addEventListener("click", () => toggleCart(parseInt(btn.dataset.id)));
    });

    if (items.length > visibleCount) {
      const leftBtn = document.createElement("button");
      leftBtn.className = "carousel-btn left-btn";
      leftBtn.textContent = "◀";

      const rightBtn = document.createElement("button");
      rightBtn.className = "carousel-btn right-btn";
      rightBtn.textContent = "▶";

      section.appendChild(leftBtn);
      section.appendChild(rightBtn);

      // Left button should show the previous visible set (move right visually)
      // Left button (◀) → go backwards
      rightBtn.addEventListener("click", () => {
        categoryIndices[category] =
          (categoryIndices[category] - 1 + items.length) % items.length;
        updateSectionGrid(
          grid,
          items,
          categoryIndices[category],
          visibleCount,
          gap
        );
      });

      // Right button (▶) → go forwards
      leftBtn.addEventListener("click", () => {
        categoryIndices[category] =
          (categoryIndices[category] + 1) % items.length;
        updateSectionGrid(
          grid,
          items,
          categoryIndices[category],
          visibleCount,
          gap
        );
      });
    }
    
  });  bindCardEvents();
}
function renderCartPage() {
  const cart = getStorage("cart");
  const filtered = products.filter((p) => cart.includes(p.id));
  const total = filtered.reduce((sum, p) => sum + p.price, 0).toFixed(2);

  container.innerHTML = `
    <div class="category-section">
      <h2 class="category-title">MY CART</h2>
      <div class="category-grid">
        ${filtered.map((p) => `
          <div class="product-card" data-id="${p.id}">
            <img src="${p.image}" class="product-image">
            <h3>${escapeHtml(p.title)}</h3>
            <p>$${p.price}</p>
            <div class="card-actions">
              <button class="icon-btn cart-btn active" data-id="${p.id}">
                <i class="fa-solid fa-cart-shopping"></i>
              </button>
            </div>
          </div>
        `).join("")}
      </div>
      <div id="cart-stats" style="text-align:center; margin:2em; font-size:1.2rem; font-weight:bold;">
        Items: ${filtered.length} | Total: $${total}
      </div>
    </div>
  `;

  bindCardEvents();
}

function renderWishlistPage() {
  const wishlist = getStorage("wishlist");
  const filtered = products.filter((p) => wishlist.includes(p.id));

  container.innerHTML = filtered.map((p) => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.image}" class="product-image">
      <h3>${escapeHtml(p.title)}</h3>
      <p>$${p.price}</p>
      <div class="card-actions">
        <button class="icon-btn heart-btn active" data-id="${p.id}">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>
    </div>
  `).join("");

  bindCardEvents();
}

// update a given grid DOM node with new visible items
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

/* ---------- Category-only view (grid, no carousel) ---------- */
function renderCategoryOnly(category, subCategory = null) {
  mode = "category";
  selectedCategory = category;
  selectedSubCategory = subCategory;
  container.classList.add("category-only");
  container.innerHTML = "";

  const section = document.createElement("div");
  section.className = "category-section";

  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = subCategory
    ? subCategory.toUpperCase()
    : category.toUpperCase();
  title.style.textAlign = "center";
  section.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "category-grid";

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();
  let filtered = products.filter((p) => p.category === category);
  if (subCategory) {
    filtered = filtered.filter((p) => p.subCategory === subCategory);
  }
  if (searchTerm)
    filtered = filtered.filter((p) =>
      p.title.toLowerCase().includes(searchTerm)
    );

  grid.innerHTML = filtered.map(cardHTML).join("");
  grid.style.justifyContent = "center"; // ✅ force center

  section.appendChild(grid);
  container.appendChild(section);
  grid.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      toggleWishlist(parseInt(btn.dataset.id))
    );
  });
  grid.querySelectorAll(".cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleCart(parseInt(btn.dataset.id)));
  });indCardEvents()
  bindCardEvents();
}
/* ---------- Render a subset of categories, same as normal page ---------- */
function renderSubset(categoriesToShow) {
  mode = "all";
  selectedCategory = null;
  container.classList.remove("category-only");
  container.innerHTML = "";

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();

  const categories = {};
  products.forEach((p) => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm)) return;
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  // Only keep categories we want
  const filteredCategories = Object.fromEntries(
    Object.entries(categories).filter(([cat]) => categoriesToShow.includes(cat))
  );

  Object.entries(filteredCategories).forEach(([category, items]) => {
    if (!(category in categoryIndices)) categoryIndices[category] = 0;
    categoryIndices[category] = categoryIndices[category] % items.length;

    const section = document.createElement("div");
    section.className = "category-section";

    const title = document.createElement("h2");
    title.className = "category-title";
    title.textContent = category.toUpperCase();

    // Make category titles clickable, like nav buttons
    title.style.cursor = "pointer";
    title.addEventListener("click", () => {
      if (category === "clothing" || category === "clothes") {
        renderSubset(["men's clothing", "women's clothing"]);
      } else if (
        category === "men's clothing" ||
        category === "women's clothing"
      ) {
        renderCategoryOnly(category);
      } else {
        renderCategoryOnly(category);
      }
    });

    section.appendChild(title);

    const wrapper = document.createElement("div");
    wrapper.className = "carousel-wrapper";

    const grid = document.createElement("div");
    grid.className = "category-grid";

    wrapper.appendChild(grid);
    section.appendChild(wrapper);
    container.appendChild(section);

    const availableWidth = Math.floor(wrapper.clientWidth);
    const { visibleCount, gap } = getVisibleCountForWidth(availableWidth);

    grid.style.gap = `${gap}px`;
    grid.style.justifyContent = visibleCount === 1 ? "center" : "flex-start";

    const start = categoryIndices[category];
    const showCount = Math.min(visibleCount, items.length);
    let visibleItems = [];
    for (let i = 0; i < showCount; i++) {
      visibleItems.push(items[(start + i) % items.length]);
    }

    grid.innerHTML = visibleItems.map(cardHTML).join("");
    
    if (items.length > visibleCount) {
      const leftBtn = document.createElement("button");
      leftBtn.className = "carousel-btn left-btn";
      leftBtn.textContent = "◀";

      const rightBtn = document.createElement("button");
      rightBtn.className = "carousel-btn right-btn";
      rightBtn.textContent = "▶";

      section.appendChild(leftBtn);
      section.appendChild(rightBtn);

      leftBtn.addEventListener("click", () => {
        categoryIndices[category] =
          (categoryIndices[category] - 1 + items.length) % items.length;
        updateSectionGrid(
          grid,
          items,
          categoryIndices[category],
          visibleCount,
          gap
        );
      });

      rightBtn.addEventListener("click", () => {
        categoryIndices[category] =
          (categoryIndices[category] + 1) % items.length;
        updateSectionGrid(
          grid,
          items,
          categoryIndices[category],
          visibleCount,
          gap
        );
      });
    }
    bindCardEvents();
  });
}
function bindCardEvents() {
  document.querySelectorAll(".heart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.dataset.id);
      toggleWishlist(id);
    });
  });

  document.querySelectorAll(".cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.dataset.id);
      toggleCart(id);
    });
  });
}

/* ---------- helpers & events ---------- */

// nav category buttons
document.querySelectorAll(".category-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const data = btn.dataset.category;
    const cat = data || btn.textContent.trim().toLowerCase();

    if (cat === "clothes") {
      // show only men + women clothes, but keep normal layout
      renderSubset(["men's clothing", "women's clothing"]);
    } else {
      renderCategoryOnly(cat);
    }
  });
});

// subcategory buttons
document.querySelectorAll(".subcategory-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.category;
    const sub = btn.dataset.subcategory;
    renderCategoryOnly(cat, sub);
  });
});

// logo resets to all view
if (logo) {
  logo.addEventListener("click", () => {
    renderPage();
  });
}

// search input
if (searchInput) {
  searchInput.addEventListener("input", () => {
    if (mode === "all") renderPage();
    else if (mode === "category" && selectedCategory)
      renderCategoryOnly(selectedCategory, selectedSubCategory);
  });
}

// resize recalculations
window.addEventListener("resize", () => {
  if (mode === "all") renderPage();
  else if (mode === "category" && selectedCategory)
    renderCategoryOnly(selectedCategory, selectedSubCategory);
});

fetchProducts();
/* ========== Wishlist & Cart Logic ========== */
function getStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function toggleWishlist(productId) {
  let wishlist = getStorage("wishlist");
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
  } else {
    wishlist.push(productId);
  }
  setStorage("wishlist", wishlist);
  renderPage();
}

function toggleCart(productId) {
  let cart = getStorage("cart");
  if (cart.includes(productId)) {
    cart = cart.filter((id) => id !== productId);
  } else {
    cart.push(productId);
  }
  setStorage("cart", cart);
  renderPage();
}
// Navbar redirections
document.getElementById("nav-cart").addEventListener("click", () => {
  window.location.href = "mycart.html";
});

document.getElementById("nav-heart").addEventListener("click", () => {
  window.location.href = "mywishlist.html";
});

// Example: saving product data to localStorage
