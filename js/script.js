// script.js - responsive category carousels with subcategories + centered items

const container = window.container;
// Track last visible count per category so we can rotate items when narrowing
const categoryVisibleCount = {};

// All of these functions are now in common.js and rendering.js


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

    // Rotate start index forward when visibleCount decreased so items shift
    const prevVisible = categoryVisibleCount[category] ?? visibleCount;
    if (visibleCount < prevVisible) {
      const delta = prevVisible - visibleCount;
      categoryIndices[category] = (categoryIndices[category] + delta) % items.length;
    }
    categoryVisibleCount[category] = visibleCount;

    grid.style.gap = `${gap}px`;
    grid.style.justifyContent = visibleCount === 1 ? "center" : "flex-start";

    const start = categoryIndices[category];
    const showCount = Math.min(visibleCount, items.length);
    let visibleItems = [];
    for (let i = 0; i < showCount; i++) {
      visibleItems.push(items[(start + i) % items.length]);
    }

    grid.innerHTML = visibleItems.map(cardHTML).join("");
    // heart buttons are rendered with class .heart-btn
    grid.querySelectorAll(".heart-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        if (typeof window.toggleWishlist === 'function') window.toggleWishlist(id);
        else console.warn('toggleWishlist missing');
      });
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
        // keep visible-count map in sync
        categoryVisibleCount[category] = visibleCount;
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
        // keep visible-count map in sync
        categoryVisibleCount[category] = visibleCount;
      });
    }
    
  });  bindCardEvents();
}
function renderCartPage() {
  const cart = getStorage("cart") || [];

  // Normalize cart into list of { productId, quantity }
  let cartItems = [];
  if (cart.length && typeof cart[0] === 'object' && cart[0].productId !== undefined) {
    cartItems = cart.map((it) => ({ productId: it.productId, quantity: it.quantity || 1 }));
  } else {
    cartItems = cart.map((id) => ({ productId: id, quantity: 1 }));
  }

  const ids = cartItems.map((it) => it.productId);

  const filtered = products.filter((p) => ids.includes(p.id));

  // compute total respecting quantities
  const total = filtered.reduce((sum, p) => {
    const ci = cartItems.find((it) => it.productId === p.id) || { quantity: 1 };
    return sum + p.price * (ci.quantity || 1);
  }, 0).toFixed(2);

  container.innerHTML = `
    <div class="category-section">
      <h2 class="category-title">MY CART</h2>
      <div class="category-grid">
        ${filtered.map((p) => {
          const ci = cartItems.find((it) => it.productId === p.id) || { quantity: 1 };
          return `
          <div class="product-card" data-id="${p.id}">
            <img src="${p.image}" class="product-image">
            <h3>${escapeHtml(p.title)}</h3>
            <p>$${p.price} ${ci.quantity && ci.quantity > 1 ? ` x ${ci.quantity}` : ''}</p>
            <div class="card-actions">
              <button class="icon-btn cart-btn active" data-id="${p.id}">
                <i class="fa-solid fa-cart-shopping"></i>
              </button>
            </div>
          </div>
        `}).join("")}
      </div>
      <div id="cart-stats" style="text-align:center; margin:2em; font-size:1.2rem; font-weight:bold;">
        Items: ${cartItems.reduce((s, it) => s + (it.quantity || 1), 0)} | Total: $${total}
      </div>
    </div>
  `;

  bindCardEvents();
}

function renderWishlistPage() {
  const wishlist = getStorage("wishlist");
  const filtered = products.filter((p) => wishlist.includes(p.id));
  console.log(filtered);
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
    console.log(subCategory);   
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
  grid.querySelectorAll(".heart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      if (typeof window.toggleWishlist === 'function') window.toggleWishlist(id);
      else console.warn('toggleWishlist missing');
    });
  });
  grid.querySelectorAll(".cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      if (typeof window.toggleCart === 'function') window.toggleCart(id);
      else console.warn('toggleCart missing');
    });
  });
  bindCardEvents();
}
/* ---------- Render a subset of categories, same as normal page ---------- */

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
    const cat = btn.dataset.category||"clothing";
    const sub = btn.dataset.subcategory;
    console.log(cat, sub);
    renderSubset([sub]);
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
/* These functions are now in cart-wishlist.js and navigation.js */
