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
// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const categoriesMenu = document.querySelector('.categories-menu');
    const submenuParents = document.querySelectorAll('.has-submenu');

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the click from bubbling up
        categoriesMenu.classList.toggle('active');
    });

    // Handle submenu toggles on mobile
    submenuParents.forEach(parent => {
        const categoryBtn = parent.querySelector('.category-btn');
        categoryBtn.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                // Close other open submenus
                submenuParents.forEach(p => {
                    if (p !== parent) p.classList.remove('active');
                });
                parent.classList.toggle('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.categories-menu') && !e.target.closest('.mobile-menu-btn')) {
            categoriesMenu.classList.remove('active');
            submenuParents.forEach(parent => parent.classList.remove('active'));
        }
    });

    // Prevent clicks inside menu from closing it
    categoriesMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
// function render(){
//   mode = "all";
//   selectedCategory=null;
//   selectedSubCategory=null;
//   container.removerClass("category-only");
//   container.innerHTML="";
//   const searchTerm=(searchInput?.value || "").trim().toLowerCase();
//   const categpries={}
//   products.forEach((p)=>{
//     if(searchTerm && !p.title.toLowerCase().includes(searchTerm)) return;
//     if(categories[p.category]) categories[p.category]=[];
//     categories[p.category].push(p);
//   }
//   Object.entries(categories).forEach(([category,items])=>{
//     if(!categoryIndices[category])categoryIndices[category]=0;
//     cateforyIndices[category]=categoryIndices[category]%items.length;
//     const section=document.createElement("div");
//     section.className="category-section";
//     const title=document.createEelement("h2");
//     title.className="category-title";
//     title.textContent=category.toUpperCase();
//     title.style.cursor="pointer";
//     title.addEventListener("click",()=>{
//       if(category==="clothing" || category==="clothes"){
//         renderSubset(["men's clothing", "womenclothing"]);
//       }else{
//         renderCategoryOnly(category);
//       }
//   })
//   const grid=document.createElement("div");
//   const wrapper=document.createElement("div");
//   section.appendChild(title);
//   wrapper.className="carousel-wrapper";
//   grid.className="category-grid";
//   wrapper.appendChild(grid);
//   section.appendChild(wrapper);
//   container.appendChild(section);
//   const availableWidth=container.clientWidth || window.innerWidth;
// }



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

    const availableWidth = container.clientWidth || window.innerWidth;
    const { visibleCount, gap, exactWidth } = getVisibleCountForWidth(availableWidth);
    console.log(`[${category}] availableWidth: ${availableWidth}px, visibleCount: ${visibleCount}, exactWidth: ${exactWidth}px`);
    wrapper.style.setProperty('--gap', `${gap}px`);
    wrapper.style.setProperty('--exact-width', `${exactWidth}px`);
    // Preserve current start index when visibleCount changes: clamp it so
    // the same first-visible item remains visible where possible.
    const prevVisible = categoryVisibleCount[category] ?? visibleCount;
    const maxStart = Math.max(0, items.length - visibleCount);
    categoryIndices[category] = Math.min(categoryIndices[category], maxStart);
    categoryVisibleCount[category] = visibleCount;

    grid.style.gap = `${gap}px`;
    grid.style.justifyContent = visibleCount === 1 ? "center" : "flex-start";

    const start = categoryIndices[category];
    const showCount = Math.min(visibleCount, items.length);
    let visibleItems = [];
    for (let i = 0; i < showCount; i++) {
      visibleItems.push(items[(start + i) % items.length]);
    }

    // Render the visible items
    grid.innerHTML = visibleItems.map(cardHTML).join("");

    // Add navigation buttons if there are more items than visible
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
  if (!products.length) {
    fetchProducts().then(() => showCategoryProducts(category));
    return;
  }
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
  console.log(products);
  let filtered = products.filter((p) => p.category === category);
  if (subCategory) {
    // FIX: filter by subCategory property, not category
    filtered = filtered.filter((p) => p.subCategory === subCategory);
  }
  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.title.toLowerCase().includes(searchTerm)
    );
  }

  grid.innerHTML = filtered.map(cardHTML).join("");
  grid.style.justifyContent = "center";

  section.appendChild(grid);
  container.appendChild(section);
  console.log(`[${category}] Rendering ${filtered.length} items`);
  bindCardEvents();
}

// Render a subset of categories
function renderSubset(categoriesToShow) {
  if (!products.length) {
    fetchProducts().then(() => showCategoryProducts(category));
    return;
  }
  mode = "all";
  selectedCategory = null;
  container.classList.remove("category-only");
  container.innerHTML = "";

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();
let filtered = products.filter((p) => p.category === category);
if (subCategory) {
  filtered = filtered.filter((p) => p.category === subCategory);
}
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

  // Preserve start index on resize by clamping it to available range
  const maxStart2 = Math.max(0, items.length - visibleCount);
  categoryIndices[category] = Math.min(categoryIndices[category], maxStart2);

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

// Add resize handler to update layout when window size changes
let resizeTimeout;
let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
  const currentWidth = window.innerWidth;
  
  // Debounce but also check if width crossed a breakpoint threshold
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (mode === 'all') {
      renderPage();
    } else if (mode === 'category' && selectedCategory) {
      renderCategoryOnly(selectedCategory, selectedSubCategory);
    }
    lastWidth = currentWidth;
  }, 50); // Reduced to 50ms for faster response
});

// Initialize
fetchProducts().then(() => renderPage());