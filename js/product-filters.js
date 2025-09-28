// Add this right after the searchTerm declaration in common.js

// Product filtering functions
function filterProducts(options = {}) {
  let filtered = [...products];
  
  // Apply search filter
  if (options.searchTerm) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(options.searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(options.searchTerm.toLowerCase())
    );
  }
  
  // Apply category filter
  if (options.category) {
    filtered = filtered.filter(p => p.category === options.category);
  }
  
  // Apply subcategory filter
  if (options.subCategory) {
    filtered = filtered.filter(p => p.subCategory === options.subCategory);
  }
  
  return filtered;
}

// Get products by category
function getProductsByCategory(category) {
  return products.filter(p => p.category === category);
}

// Group products by category
function groupProductsByCategory(productsToGroup = products) {
  const categories = {};
  productsToGroup.forEach((p) => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });
  return categories;
}

// Get unique categories
function getUniqueCategories() {
  return [...new Set(products.map(p => p.category))];
}

// Get subcategories for a category
function getSubCategories(category) {
  const categoryProducts = getProductsByCategory(category);
  return [...new Set(categoryProducts.map(p => p.subCategory).filter(Boolean))];
}

// Filter and sort products
function filterAndSortProducts(options = {}) {
  let filtered = filterProducts(options);
  
  // Apply sorting
  if (options.sortBy) {
    filtered.sort((a, b) => {
      switch(options.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }
  
  return filtered;
}