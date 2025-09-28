// Wishlist page specific functionality
const container = window.container;

function renderWishlistPage() {
  const wishlist = getStorage("wishlist");
  const filtered = products.filter((p) => wishlist.includes(p.id));

  container.innerHTML = `
    <div class="category-section">
      <h2 class="category-title">MY WISHLIST</h2>
      <div class="category-grid">
        ${filtered.map((p) => `
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
        `).join("")}
      </div>
    </div>
  `;

  bindCardEvents();
}

// Toggle wishlist functionality
// Initialize
fetchProducts().then(() => renderWishlistPage());