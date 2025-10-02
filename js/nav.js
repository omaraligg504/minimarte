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