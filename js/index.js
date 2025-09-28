// Main page specific functionality
const container = window.container;
// share a single logo reference to avoid duplicate declarations
window.logo = window.logo || document.querySelector('.logo');
const logo = window.logo;

let categoryIndices = {}; // start index per category for carousel
let mode = "all"; // 'all' or 'category'
let selectedCategory = null;
let selectedSubCategory = null;
// Track last visible count per category so we can rotate items when narrowing
const categoryVisibleCount = {};

// Render the main page with category carousels
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

    if (items.length > visibleCount) {
      const leftBtn = document.createElement("button");
      leftBtn.className = "carousel-btn left-btn";
      leftBtn.textContent = "◀";

      const rightBtn = document.createElement("button");
      rightBtn.className = "carousel-btn right-btn";
      rightBtn.textContent = "▶";

      section.appendChild(leftBtn);
      section.appendChild(rightBtn);

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
        categoryVisibleCount[category] = visibleCount;
      });

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
        categoryVisibleCount[category] = visibleCount;
      });
    }
  });
  bindCardEvents();
}

// Render category-only view
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
  grid.style.justifyContent = "center";

  section.appendChild(grid);
  container.appendChild(section);
  bindCardEvents();
}

// Render a subset of categories
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

// Event listeners

// Initialize
fetchProducts().then(() => renderPage());