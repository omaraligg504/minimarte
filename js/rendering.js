// Common rendering functions

// Render a grid of products
function renderProductGrid(products, container, options = {}) {
  const grid = document.createElement('div');
  grid.className = 'category-grid';
  
  if (options.centerItems) {
    grid.style.justifyContent = 'center';
  }
  
  grid.innerHTML = products.map(cardHTML).join("");
  
  // Add gap if specified
  if (options.gap) {
    grid.style.gap = `${options.gap}px`;
  }
  
  container.appendChild(grid);
  bindCardEvents();
  
  return grid;
}

// Render a category section with title
function renderCategorySection(category, products, container, options = {}) {
  const section = document.createElement('div');
  section.className = 'category-section';
  
  // Add title if specified
  if (options.showTitle) {
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = category.toUpperCase();
    
    if (options.titleClickable) {
      title.style.cursor = 'pointer';
      title.addEventListener('click', () => navigateToCategory(category));
    }
    
    section.appendChild(title);
  }
  
  // Create wrapper for carousel if needed
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';
  
  const grid = document.createElement('div');
  grid.className = 'category-grid';
  
  wrapper.appendChild(grid);
  section.appendChild(wrapper);
  
  // Calculate visible items
  const availableWidth = Math.floor(wrapper.clientWidth);
  const { visibleCount, gap } = getVisibleCountForWidth(availableWidth);
  
  grid.style.gap = `${gap}px`;
  grid.style.justifyContent = visibleCount === 1 ? "center" : "flex-start";
  
  // Handle carousel if needed
  // If COLLAPSE_TO_VISIBLE is enabled, we trim the list to visibleCount and
  // do not add carousel controls — this makes the page remove extra items
  // as the screen narrows (1-per-row behavior on small screens).
  if (window.COLLAPSE_TO_VISIBLE) {
    const displayItems = products.slice(0, visibleCount);
    grid.innerHTML = displayItems.map(cardHTML).join("");
    bindCardEvents();
  } else if (options.carousel && products.length > visibleCount) {
    let currentIndex = 0;
    
    const updateGrid = () => {
      const visibleItems = [];
      for (let i = 0; i < visibleCount; i++) {
        visibleItems.push(products[(currentIndex + i) % products.length]);
      }
      grid.innerHTML = visibleItems.map(cardHTML).join("");
      bindCardEvents();
    };
    
    // Add navigation buttons
    const leftBtn = document.createElement('button');
    leftBtn.className = 'carousel-btn left-btn';
    leftBtn.textContent = '◀';
    
    const rightBtn = document.createElement('button');
    rightBtn.className = 'carousel-btn right-btn';
    rightBtn.textContent = '▶';
    
    leftBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + products.length) % products.length;
      updateGrid();
    });
    
    rightBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % products.length;
      updateGrid();
    });
    
    section.appendChild(leftBtn);
    section.appendChild(rightBtn);
    
    // Initial render
    updateGrid();
  } else {
    // Regular grid
    grid.innerHTML = products.map(cardHTML).join("");
    bindCardEvents();
  }
  
  container.appendChild(section);
  return section;
}

// Render empty state
function renderEmptyState(container, message = "No products found") {
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.innerHTML = `
    <div class="empty-state-content">
      <i class="fa-solid fa-box-open"></i>
      <p>${message}</p>
    </div>
  `;
  container.appendChild(emptyState);
}

// Responsive grid handler
function handleResponsiveGrid(container) {
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const grid = entry.target.querySelector('.category-grid');
      if (grid) {
        const { visibleCount, gap } = getVisibleCountForWidth(entry.contentRect.width);
        grid.style.gap = `${gap}px`;
        grid.style.justifyContent = visibleCount === 1 ? "center" : "flex-start";
      }
    }
  });
  
  resizeObserver.observe(container);
  return resizeObserver;
}