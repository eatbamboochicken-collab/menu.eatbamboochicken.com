/**
 * Bamboo Chicken - Interactive Digital Menu Script (Phase 2A)
 * Vanilla JavaScript (ES6+)
 * Brand: Fun, Modern, Bright, Family Friendly, Premium Fast Food
 */

const API_BASE = "https://bamboo-orders-api.warstreett.workers.dev";

// Global Menu Database
const MENU_DATA = [
  // 🍗 CHICKEN & MORE
  {
    id: "bamboo-chicken",
    category: "chicken-and-more",
    name: "Bamboo Chicken",
    price: 2.00,
    description: "Chicken served on a bamboo stick.",
    comboIncludes: ["Grilled Bamboo Chicken Stick"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Bamboo%20chicken.jpg",
    details: "Chicken served on a bamboo stick."
  },
  {
    id: "bamboo-chicken-chips",
    category: "chicken-and-more",
    name: "Bamboo Chicken with Small Chips",
    price: 2.50,
    description: "Bamboo Chicken stick served with a portion of small crispy chips.",
    comboIncludes: ["Grilled Bamboo Chicken Stick", "Small Crispy Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Bamboo%20chicken.jpg",
    details: "Bamboo Chicken stick served with a portion of small crispy chips."
  },
  {
    id: "chicken-more-1-piecer",
    category: "chicken-and-more",
    name: "1 Piecer",
    price: 2.50,
    description: "1 piece of fried chicken served with chips.",
    comboIncludes: ["1 Piece Fried Chicken", "Small Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/1%20piecer.jpg",
    details: "1 piece of fried chicken served with chips."
  },
  {
    id: "chicken-bones",
    category: "chicken-and-more",
    name: "Chicken Bones",
    price: 1.00,
    description: "Seasoned chicken wing pieces and riblets.",
    comboIncludes: ["Seasoned Wing Pieces & Riblets"],
    image: "https://images.unsplash.com/photo-1585325701165-351af916e5ec?auto=format&fit=crop&w=600&q=80",
    details: "Seasoned chicken wing pieces and riblets."
  },
  {
    id: "bamboo-pie",
    category: "chicken-and-more",
    name: "Bamboo Pie",
    price: 1.50,
    description: "A savoury baked pie.",
    comboIncludes: ["Chicken & Mushroom Baked Pie"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/bamboo_pie_3.webp",
    details: "A savoury baked pie filled with chicken and mushroom."
  },
  {
    id: "chicken-fillet",
    category: "chicken-and-more",
    name: "Chicken Fillet",
    price: 3.00,
    description: "Chicken breast fillet.",
    comboIncludes: ["Grilled Chicken Breast Fillet"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Chicken%20fillet.jpg",
    details: "Chicken breast fillet."
  },
  {
    id: "chicken-wrap",
    category: "chicken-and-more",
    name: "Chicken Wrap",
    price: 3.00,
    description: "Chicken strips, lettuce, tomatoes and dressing wrapped in a tortilla.",
    comboIncludes: ["Chicken Strips", "Lettuce & Tomatoes", "Dressing", "Tortilla Wrap"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Chicken%20wrape.jpeg",
    details: "Chicken strips, lettuce, tomatoes and dressing wrapped in a tortilla."
  },
  {
    id: "shawarma",
    category: "chicken-and-more",
    name: "Shawarma",
    price: 3.00,
    description: "Sliced chicken wrapped in pita bread with garlic sauce.",
    comboIncludes: ["Sliced Roasted Chicken", "Garlic Sauce", "Pita Bread"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Chicken%20wrape.jpeg",
    details: "Sliced chicken wrapped in pita bread with garlic sauce."
  },
  {
    id: "chicken-burger",
    category: "chicken-and-more",
    name: "Chicken Burger",
    price: 3.00,
    description: "Chicken patty with lettuce and mayonnaise on a bun.",
    comboIncludes: ["Chicken Patty", "Lettuce", "Mayonnaise", "Burger Bun"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Chicken%20burger.jpg",
    details: "Chicken patty with lettuce and mayonnaise on a bun."
  },
  {
    id: "boss-burger",
    category: "chicken-and-more",
    name: "Boss Burger",
    price: 5.50,
    description: "Double chicken fillet burger with cheese, lettuce and sauce.",
    comboIncludes: ["2 Chicken Fillets", "Cheese", "Lettuce", "Boss Sauce", "Burger Bun"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Boss%20burger.jpg",
    details: "Double chicken fillet burger with cheese, lettuce and sauce."
  },

  // 🍱 MEALS
  {
    id: "sadza-beef",
    category: "meals",
    name: "Sadza Beef",
    price: 3.00,
    description: "Sadza served with beef stew and fresh vegetables.",
    comboIncludes: ["Hot Fluffy Sadza", "Beef Stew", "Fresh Vegetables"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/bamboo_sadza_beef.webp",
    details: "Sadza served with beef stew and fresh vegetables."
  },
  {
    id: "sadza-chicken",
    category: "meals",
    name: "Sadza Chicken",
    price: 3.00,
    description: "Sadza served with chicken stew and fresh vegetables.",
    comboIncludes: ["Hot Fluffy Sadza", "Chicken Stew", "Fresh Vegetables"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Sadza%20and%20chicken.jpg",
    details: "Sadza served with chicken stew and fresh vegetables."
  },
  {
    id: "fried-rice",
    category: "meals",
    name: "Fried Rice",
    price: 3.00,
    description: "Seasoned fried rice served with chicken and coleslaw.",
    comboIncludes: ["Seasoned Fried Rice", "Chicken", "Coleslaw"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Fried%20rice.jpg",
    details: "Seasoned fried rice served with chicken and coleslaw."
  },

  // 🍗 CHICKEN PIECES
  {
    id: "chicken-pieces-1-piecer",
    category: "chicken-pieces",
    name: "1 Piecer",
    price: 2.50,
    description: "1 piece of fried chicken served with chips.",
    comboIncludes: ["1 Piece Fried Chicken", "Small Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/1%20piecer.jpg",
    details: "1 piece of fried chicken served with chips."
  },
  {
    id: "chicken-pieces-2-piecer",
    category: "chicken-pieces",
    name: "2 Piecer",
    price: 3.50,
    description: "2 pieces of fried chicken served with chips.",
    comboIncludes: ["2 Pieces Fried Chicken", "Small Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/2%20piecer.jpg",
    details: "2 pieces of fried chicken served with chips."
  },
  {
    id: "chicken-pieces-3-piecer",
    category: "chicken-pieces",
    name: "3 Piecer",
    price: 4.50,
    description: "3 pieces of fried chicken served with chips.",
    comboIncludes: ["3 Pieces Fried Chicken", "Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/3%20piecer.jpg",
    details: "3 pieces of fried chicken served with chips."
  },
  {
    id: "chicken-pieces-8-piece-bucket",
    category: "chicken-pieces",
    name: "8 Piece Bucket",
    price: 9.00,
    description: "8 pieces of fried chicken. Chicken only.",
    comboIncludes: ["8 Pieces Fried Chicken"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/8%20piecer%20bucket.jpg",
    details: "8 pieces of fried chicken. Chicken only."
  },

  // 🥗 SALADS
  {
    id: "garden-salad",
    category: "salads",
    name: "Garden Salad",
    price: 1.50,
    description: "Mixed greens, cucumbers and tomatoes with dressing.",
    comboIncludes: ["Mixed Greens", "Cucumbers & Tomatoes", "Salad Dressing"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    details: "Mixed greens, cucumbers and tomatoes with dressing."
  },
  {
    id: "coleslaw",
    category: "salads",
    name: "Coleslaw",
    price: 0.50,
    description: "Fresh shredded cabbage and carrots in creamy dressing.",
    comboIncludes: ["Shredded Cabbage & Carrots", "Creamy Dressing"],
    image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=600&q=80",
    details: "Fresh shredded cabbage and carrots in creamy dressing."
  },
  {
    id: "chicken-salad",
    category: "salads",
    name: "Chicken Salad",
    price: 3.00,
    description: "Tender chicken strips served on a bed of fresh garden salad.",
    comboIncludes: ["Tender Chicken Strips", "Fresh Garden Greens", "Salad Dressing"],
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80",
    details: "Tender chicken strips served on a bed of fresh garden salad."
  },

  // 🍟 SIDES
  {
    id: "plain-chips-small",
    category: "sides",
    name: "Plain Chips (Small)",
    price: 1.00,
    description: "A small portion of golden seasoned potato chips.",
    comboIncludes: ["Small Portion Seasoned Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Snall%20chips.jpg",
    details: "A small portion of golden seasoned potato chips."
  },
  {
    id: "mega-chips",
    category: "sides",
    name: "Mega Chips",
    price: 2.00,
    description: "A large portion of golden seasoned potato chips.",
    comboIncludes: ["Large Portion Seasoned Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Mega%20chips.jpeg",
    details: "A large portion of golden seasoned potato chips."
  },

  // 🥤 DRINKS
  {
    id: "coca-cola-300ml",
    category: "drinks",
    name: "Coca-Cola — 300ml",
    price: 0.50,
    description: "Chilled Coca-Cola 300ml bottle.",
    comboIncludes: ["Coca-Cola 300ml"],
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Coca-Cola 300ml bottle."
  },
  {
    id: "coca-cola-500ml",
    category: "drinks",
    name: "Coca-Cola — 500ml",
    price: 1.00,
    description: "Chilled Coca-Cola 500ml bottle.",
    comboIncludes: ["Coca-Cola 500ml"],
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Coca-Cola 500ml bottle."
  },
  {
    id: "fanta-300ml",
    category: "drinks",
    name: "Fanta — 300ml",
    price: 0.50,
    description: "Chilled Fanta Orange 300ml bottle.",
    comboIncludes: ["Fanta Orange 300ml"],
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Fanta Orange 300ml bottle."
  },
  {
    id: "fanta-500ml",
    category: "drinks",
    name: "Fanta — 500ml",
    price: 1.00,
    description: "Chilled Fanta Orange 500ml bottle.",
    comboIncludes: ["Fanta Orange 500ml"],
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Fanta Orange 500ml bottle."
  },
  {
    id: "sprite-300ml",
    category: "drinks",
    name: "Sprite — 300ml",
    price: 0.50,
    description: "Chilled Sprite 300ml bottle.",
    comboIncludes: ["Sprite 300ml"],
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Sprite 300ml bottle."
  },
  {
    id: "sprite-500ml",
    category: "drinks",
    name: "Sprite — 500ml",
    price: 1.00,
    description: "Chilled Sprite 500ml bottle.",
    comboIncludes: ["Sprite 500ml"],
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Sprite 500ml bottle."
  },
  {
    id: "fruit-yogurt",
    category: "drinks",
    name: "Fruit Yogurt",
    price: 2.50,
    description: "Chilled, creamy fruit yogurt.",
    comboIncludes: ["Chilled Fruit Yogurt"],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    details: "Chilled, creamy fruit yogurt drink."
  },
  {
    id: "aloe-vera",
    category: "drinks",
    name: "Aloe Vera",
    price: 2.50,
    description: "Refreshing Aloe Vera drink with natural pulp.",
    comboIncludes: ["Refreshing Aloe Vera"],
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
    details: "Refreshing Aloe Vera drink with natural pulp."
  },
  {
    id: "ice-tea",
    category: "drinks",
    name: "Ice Tea",
    price: 1.50,
    description: "Chilled lemon iced tea.",
    comboIncludes: ["Chilled Lemon Ice Tea"],
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    details: "Chilled lemon iced tea."
  },
  {
    id: "minute-maid-delight",
    category: "drinks",
    name: "Minute Maid Delight",
    price: 1.00,
    description: "Refreshing Minute Maid fruit juice.",
    comboIncludes: ["Minute Maid Fruit Drink"],
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    details: "Refreshing Minute Maid fruit juice."
  }
];

// Active State Managers
let currentCategory = "all";
let searchQuery = "";
let cart = JSON.parse(localStorage.getItem("bamboo_cart")) || [];
// Clean obsolete items from cart if any exist
if (Array.isArray(cart)) {
  const validIds = new Set(MENU_DATA.map(m => m.id));
  cart = cart.filter(item => {
    const baseId = item.id ? item.id.split('-')[0] : '';
    return validIds.has(item.id) || MENU_DATA.some(m => m.id.startsWith(baseId));
  });
}
let selectedProduct = null;
let modalCurrentQty = 1;
let currentOrderMethod = "delivery"; // 'delivery' or 'collection'
let currentPaymentMethod = "Cash";

// DOM Element Selectors
const navbar = document.getElementById("navbar");
const categoryContainer = document.getElementById("categories-container");
const menuGrid = document.getElementById("menu-grid");
const searchInputHeader = document.getElementById("search-input-header");
const searchInputMobile = document.getElementById("search-input-mobile");
const clearSearchBtn = document.getElementById("clear-search-btn");
const searchInfoBanner = document.getElementById("search-info-banner");
const resultsCountText = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const resetSearchBtn = document.getElementById("reset-search-btn");
const orderNowBtn = document.getElementById("order-now-btn");

// Modal Selectors
const detailModal = document.getElementById("detail-modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalCategory = document.getElementById("modal-category");
const modalDescription = document.getElementById("modal-description");
const modalOptionsSection = document.getElementById("modal-options-section");
const modalOptionsTitle = document.getElementById("modal-options-title");
const modalOptionsContainer = document.getElementById("modal-options-container");
const modalCloseBtn = document.getElementById("modal-close-btn");

// Cart Sidebar Selectors
const cartBtn = document.getElementById("cart-btn");
const cartOverlay = document.getElementById("cart-overlay");
const cartSidebar = document.getElementById("cart-sidebar");
const cartSidebarClose = document.getElementById("cart-sidebar-close");
const cartSidebarBodyInner = document.getElementById("cart-sidebar-body-inner");
const cartSummaryQty = document.getElementById("cart-summary-qty");
const cartSummarySubtotal = document.getElementById("cart-summary-subtotal");
const cartSummaryGrand = document.getElementById("cart-summary-grand");

// Multi-view selectors
const cartViewItems = document.getElementById("cart-view-items");
const cartViewCheckout = document.getElementById("cart-view-checkout");
const btnBackToBucketHeader = document.getElementById("btn-back-to-bucket-header");
const cartHeaderTitle = document.getElementById("cart-header-title");

// Checkout summary selectors
const checkoutSummaryQty = document.getElementById("checkout-summary-qty");
const checkoutSummaryDelivery = document.getElementById("checkout-summary-delivery");
const checkoutSummaryGrand = document.getElementById("checkout-summary-grand");

// Toast Container
const toastContainer = document.getElementById("toast-container");
const cartBadges = document.querySelectorAll(".cart-badge");

let unavailableMenuItems = [];

// Initialize Application
function initBambooApp() {
  setupNavbarScroll();
  generateCategoryPills();
  renderMenu();
  syncCartUI();
  setupEventListeners();
  
  // Keep dynamic restaurant open/closed status indicator fresh
  if (typeof window.updateRestaurantStatus === "function") {
    window.updateRestaurantStatus();
    setInterval(window.updateRestaurantStatus, 30000);
  }
}


// Scroll Listener for Navbar Elevation, Depth Lag and Smooth Shift
let lastScrollY = window.scrollY;
let scrollLagTimeout = null;

function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  const brandOrange = navbar.querySelector(".brand-orange");

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    
    // Dynamic Elevation shadow at 30px threshold
    if (currentScrollY > 30) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    
    // Scroll depth effect: orange "CHICKEN" text lags by ~1px during scroll before catching up
    if (brandOrange && Math.abs(currentScrollY - lastScrollY) > 2) {
      brandOrange.classList.add("scroll-lag");
      clearTimeout(scrollLagTimeout);
      scrollLagTimeout = setTimeout(() => {
        brandOrange.classList.remove("scroll-lag");
      }, 120);
    }
    
    // Scroll behavior:
    // Scrolling DOWN: header moves upward slightly (~6px) to maximize menu space
    // Scrolling UP: header smoothly returns to normal position over 300ms
    const isSearchActive = document.getElementById("header-search-expandable")?.classList.contains("active");
    const isNavActive = document.getElementById("mobile-nav-dropdown")?.classList.contains("active");
    
    if (currentScrollY > 50 && !isSearchActive && !isNavActive) {
      if (currentScrollY > lastScrollY + 4) {
        navbar.classList.add("header-scrolled-down");
      } else if (currentScrollY < lastScrollY - 4) {
        navbar.classList.remove("header-scrolled-down");
      }
    } else {
      navbar.classList.remove("header-scrolled-down");
    }
    
    lastScrollY = currentScrollY;
  }, { passive: true });
}

// Generate the horizontal scrollable Category Pill buttons
function generateCategoryPills() {
  const categories = [
    { id: "all", name: "All Menu", icon: "✨" },
    { id: "chicken-and-more", name: "Chicken & More", icon: "🍗" },
    { id: "meals", name: "Meals", icon: "🍱" },
    { id: "chicken-pieces", name: "Chicken Pieces", icon: "🍗" },
    { id: "salads", name: "Salads", icon: "🥗" },
    { id: "sides", name: "Sides", icon: "🍟" },
    { id: "drinks", name: "Drinks", icon: "🥤" }
  ];

  categoryContainer.innerHTML = "";
  categories.forEach(cat => {
    const pill = document.createElement("button");
    pill.classList.add("category-pill");
    if (cat.id === currentCategory) {
      pill.classList.add("active");
    }
    pill.setAttribute("id", `cat-pill-${cat.id}`);
    pill.innerHTML = `
      <span class="category-icon">${cat.icon}</span>
      <span>${cat.name}</span>
    `;
    pill.addEventListener("click", () => handleCategoryChange(cat.id));
    categoryContainer.appendChild(pill);
  });
}

// Handle Category Filtration Trigger
function handleCategoryChange(categoryId) {
  currentCategory = categoryId;
  
  // Update UI Pills active classes
  const pills = document.querySelectorAll(".category-pill");
  pills.forEach(pill => {
    pill.classList.remove("active");
  });
  
  const activePill = document.getElementById(`cat-pill-${categoryId}`);
  if (activePill) {
    activePill.classList.add("active");
    
    // Smooth scroll pill into view on mobile
    activePill.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }

  renderMenu();
}

// Main Rendering Logic
function renderMenu() {
  // Clear Grid
  menuGrid.innerHTML = "";

  // Filter Data
  const filteredData = MENU_DATA.filter(item => {
    // Hide out-of-stock items if ingredients are 0
    if (unavailableMenuItems.includes(item.name.toLowerCase())) {
      return false;
    }

    // Category check: "all" displays all authoritative menu items
    const matchesCategory = currentCategory === "all" 
      ? true 
      : item.category === currentCategory;
    
    // Search query check
    const cleanSearch = searchQuery.toLowerCase().trim();
    const matchesSearch = cleanSearch === "" || 
                          item.name.toLowerCase().includes(cleanSearch) || 
                          item.description.toLowerCase().includes(cleanSearch);
    
    return matchesCategory && matchesSearch;
  });

  // Display Search Status Info bar
  if (searchQuery.trim() !== "") {
    searchInfoBanner.style.display = "flex";
    resultsCountText.textContent = `${filteredData.length} ${filteredData.length === 1 ? 'item' : 'items'} found for "${searchQuery}"`;
  } else {
    searchInfoBanner.style.display = "none";
  }

  // Handle Empty State
  if (filteredData.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  // Generate and Append Cards with micro fade-in delay
  filteredData.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("menu-card");
    card.setAttribute("id", `menu-card-${item.id}`);

    // Map Category display names neatly
    const categoryLabel = item.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Check if the item has quick choices we want to display directly on the card
    let quickOptionsHtml = "";

    card.innerHTML = `
      <div class="menu-card-image-wrapper">
        <div class="image-placeholder"></div>
        <img class="menu-card-image" src="${item.image}" alt="${item.name}" referrerPolicy="no-referrer" onload="this.previousElementSibling.style.display='none'">
        <span class="card-category-badge" style="display: none;">${categoryLabel}</span>
      </div>
      <div class="menu-card-content">
        <div class="menu-card-info">
          <h4>${item.name}</h4>
          <p class="menu-card-description">${item.description}</p>
          ${item.freeBadge ? `<div class="free-item-badge">${item.freeBadge}</div>` : ''}
          ${quickOptionsHtml}
          <span class="menu-card-price" id="card-badge-price-${item.id}">$${item.price.toFixed(2)}</span>
        </div>
        <div class="menu-card-actions">
          <div class="card-qty-selector">
            <button class="card-qty-btn" onclick="event.stopPropagation(); changeCardQty('${item.id}', -1)">−</button>
            <span class="card-qty-val" id="card-qty-val-${item.id}">1</span>
            <button class="card-qty-btn" onclick="event.stopPropagation(); changeCardQty('${item.id}', 1)">+</button>
          </div>
          <button class="btn-card-primary-yellow" onclick="event.stopPropagation(); addCardToCart('${item.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart" style="stroke: var(--color-dark);"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      // Prevent modal opening when clicking interactive elements
      if (e.target.closest(".card-qty-selector") || e.target.closest(".btn-card-primary-yellow") || e.target.closest(".card-quick-options") || e.target.tagName === "SELECT" || e.target.tagName === "INPUT" || e.target.tagName === "OPTION") {
        return;
      }
      openDetailsModal(item.id);
    });

    // Append card
    menuGrid.appendChild(card);
    
    // Smooth stagger entrance effect
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 40);
  });
}

// Dynamic calculation function for Bamboo Chicken
window.calculateBambooChickenPrice = function(isChecked) {
  const item = MENU_DATA.find(i => i.id === "bamboo-chicken");
  if (!item) return 2.00;
  
  const basePrice = item.price;
  const addOnPrice = (isChecked && item.optionPrice) ? item.optionPrice : 0;
  return basePrice + addOnPrice;
};

// Interactive toggle helper for Bamboo Chicken on Main Card
window.toggleCardOption = function(itemId, isChecked) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  const badgePrice = document.getElementById(`card-badge-price-${itemId}`);
  const totalDisplay = document.getElementById(`card-opt-price-${itemId}`);
  
  const finalPrice = itemId === "bamboo-chicken"
    ? window.calculateBambooChickenPrice(isChecked)
    : (isChecked ? (item.price + (item.optionPrice || 0)) : item.price);
  
  if (badgePrice) {
    badgePrice.textContent = `$${finalPrice.toFixed(2)}`;
  }
  if (totalDisplay) {
    totalDisplay.textContent = `Total: $${finalPrice.toFixed(2)}`;
  }
};

// Interactive choice for Sadza on Main Card (shows custom action feedback)
window.changeSadzaMeatChoice = function(itemId, value) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (item && item.optionImages && item.optionImages[value]) {
    const cardImg = document.querySelector(`#menu-card-${itemId} .menu-card-image`);
    if (cardImg) {
      cardImg.src = item.optionImages[value];
    }
  }
  showToast(`🍗 Choice saved: Sadza Meal with ${value}!`);
};

// Search Logic
function handleSearch(query) {
  searchQuery = query;
  const headerInput = document.getElementById("search-input-header");
  if (headerInput && headerInput.value !== query) {
    headerInput.value = query;
  }
  renderMenu();
}

window.toggleHeaderSearch = function() {
  const expandable = document.getElementById("header-search-expandable");
  const toggleBtn = document.getElementById("search-toggle-btn");
  const searchInput = document.getElementById("search-input-header");
  
  if (!expandable) return;
  const isOpening = !expandable.classList.contains("active");
  expandable.classList.toggle("active");
  
  if (toggleBtn) {
    toggleBtn.classList.toggle("active", isOpening);
  }
  
  if (isOpening && searchInput) {
    setTimeout(() => searchInput.focus(), 150);
  }
};

window.closeHeaderSearch = function() {
  const expandable = document.getElementById("header-search-expandable");
  const toggleBtn = document.getElementById("search-toggle-btn");
  const searchInput = document.getElementById("search-input-header");
  
  if (expandable) expandable.classList.remove("active");
  if (toggleBtn) toggleBtn.classList.remove("active");
  if (searchInput && searchInput.value !== "") {
    handleSearch("");
  }
};

window.toggleMobileNavMenu = function() {
  const dropdown = document.getElementById("mobile-nav-dropdown");
  const hamburgerBtn = document.getElementById("hamburger-menu-btn");
  
  if (!dropdown) return;
  dropdown.classList.toggle("active");
  if (hamburgerBtn) {
    hamburgerBtn.classList.toggle("active");
  }
};

// Setup Event Listeners
function setupEventListeners() {
  // Search Box in header
  const searchInputHeaderEl = document.getElementById("search-input-header");
  if (searchInputHeaderEl) {
    searchInputHeaderEl.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
  }

  // Clear Search text
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      handleSearch("");
    });
  }

  // Reset Search from empty state
  resetSearchBtn.addEventListener("click", () => {
    handleSearch("");
    handleCategoryChange("all");
  });

  // Order Now Smooth Scroll
  if (orderNowBtn) {
    orderNowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSection = document.getElementById("menu-section");
      if (targetSection) {
        const offset = 90; // offset for sticky navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetSection.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  }

  // Close Modal triggers
  modalCloseBtn.addEventListener("click", closeDetailsModal);
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) {
      closeDetailsModal();
    }
  });

  const checkoutModal = document.getElementById("checkout-modal");
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target === checkoutModal) {
        closeCheckoutModal();
      }
    });
  }

  // Escape key closes modal or cart sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (detailModal.classList.contains("active")) {
        closeDetailsModal();
      }
      if (checkoutModal && checkoutModal.classList.contains("active")) {
        closeCheckoutModal();
      }
      if (cartSidebar.classList.contains("active")) {
        closeCart();
      }
    }
  });

  // Cart Sidebar Toggles
  if (cartBtn) {
    cartBtn.addEventListener("click", openCart);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
  }
  if (cartSidebarClose) {
    cartSidebarClose.addEventListener("click", closeCart);
  }
}

// Modal Core Controller
window.openDetailsModal = function(productId) {
  const product = MENU_DATA.find(p => p.id === productId);
  if (!product) return;

  selectedProduct = product;
  modalCurrentQty = 1;
  
  // Elements
  const modalImgEl = document.getElementById("modal-img");
  const modalFloatingPriceEl = document.getElementById("modal-floating-price");
  const modalCategoryEl = document.getElementById("modal-category");
  const modalTitleEl = document.getElementById("modal-title");
  const includedContainer = document.getElementById("included-items-container");
  const modalDescEl = document.getElementById("modal-description");
  const modalOptSection = document.getElementById("modal-options-section");
  const modalOptContainer = document.getElementById("modal-options-container");
  const modalQtyValEl = document.getElementById("modal-qty-val");
  const modalTotalPriceEl = document.getElementById("modal-total-price");

  if (modalImgEl) {
    modalImgEl.src = product.image;
    modalImgEl.alt = product.name;
  }
  if (modalFloatingPriceEl) {
    modalFloatingPriceEl.textContent = `$${product.price.toFixed(2)}`;
  }
  if (modalCategoryEl) {
    modalCategoryEl.textContent = getCategoryPill(product.category);
  }
  if (modalTitleEl) {
    modalTitleEl.textContent = product.name;
  }

  // Populate What's Included
  if (includedContainer) {
    includedContainer.innerHTML = "";
    const itemsList = product.comboIncludes || product.includes || [product.description];
    itemsList.forEach(itemStr => {
      const row = document.createElement("div");
      row.className = "included-item-row";
      
      const emoji = getItemEmoji(itemStr);
      const hasEmoji = /^[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u.test(itemStr);
      if (hasEmoji) {
        row.innerHTML = `<span class="included-item-text">${itemStr}</span>`;
      } else {
        row.innerHTML = `<span class="included-item-icon">${emoji}</span><span class="included-item-text">${itemStr}</span>`;
      }
      includedContainer.appendChild(row);
    });
  }

  // Description
  if (modalDescEl) {
    if (product.details && !product.comboIncludes) {
      modalDescEl.textContent = product.details;
      modalDescEl.style.display = "block";
    } else {
      modalDescEl.style.display = "none";
    }
  }

  // Dynamic Options (e.g. Sadza Meal Meat Option)
  if (modalOptSection && modalOptContainer) {
    if (product.customizable && product.options) {
      modalOptSection.style.display = "block";
      modalOptContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-bg); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-light);">
          <label for="modal-sel-${product.id}" style="font-weight: 700; font-size: 0.9rem; color: var(--color-dark); font-family: var(--font-body);">${product.optionLabel || 'Option'}:</label>
          <select id="modal-sel-${product.id}" class="sadza-dropdown" style="padding: 6px 12px; border-radius: var(--radius-sm); border: 1.5px solid var(--color-gray-light); font-weight: 700; font-family: var(--font-body); background-color: var(--color-light); color: var(--color-dark); font-size: 0.88rem;">
            ${product.options.map(opt => `<option value="${opt}">${opt === 'Chicken' ? '🍖 Chicken Stew' : '🥩 Beef Stew'}</option>`).join('')}
          </select>
        </div>
      `;
    } else {
      modalOptSection.style.display = "none";
      modalOptContainer.innerHTML = "";
    }
  }

  // Sticky footer reset
  if (modalQtyValEl) modalQtyValEl.textContent = "1";
  if (modalTotalPriceEl) modalTotalPriceEl.textContent = `$${product.price.toFixed(2)}`;

  // Reveal Modal
  detailModal.classList.add("active");
  document.body.style.overflow = "hidden"; // Freeze background scrolling
};

function closeDetailsModal() {
  detailModal.classList.remove("active");
  // Only restore body scrolling if cart is not open
  if (!cartSidebar.classList.contains("active")) {
    document.body.style.overflow = "";
  }
  selectedProduct = null;
}

window.updateModalQty = function(delta) {
  if (!selectedProduct) return;
  modalCurrentQty = Math.max(1, modalCurrentQty + delta);
  
  const modalQtyValEl = document.getElementById("modal-qty-val");
  const modalTotalPriceEl = document.getElementById("modal-total-price");
  
  if (modalQtyValEl) modalQtyValEl.textContent = modalCurrentQty;
  if (modalTotalPriceEl) {
    const total = selectedProduct.price * modalCurrentQty;
    modalTotalPriceEl.textContent = `$${total.toFixed(2)}`;
  }
};

window.confirmModalAddToCart = function() {
  if (!selectedProduct) return;
  addToCart(selectedProduct.id, modalCurrentQty);
  closeDetailsModal();
};

function getCategoryPill(category) {
  switch (category) {
    case "chicken-and-more": return "🍗 CHICKEN & MORE";
    case "meals": return "🍱 MEALS";
    case "chicken-pieces": return "🍗 CHICKEN PIECES";
    case "salads": return "🥗 SALADS";
    case "sides": return "🍟 SIDES";
    case "drinks": return "🥤 DRINKS";
    default: return `✨ ${category.toUpperCase().replace("-", " ")}`;
  }
}

function getItemEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("burger")) return "🍔";
  if (n.includes("wrap") || n.includes("shawarma")) return "🌯";
  if (n.includes("bamboo chicken") || n.includes("bamboo stick")) return "🍢";
  if (n.includes("bamboo pie") || n.includes("pie")) return "🥟";
  if (n.includes("fillet")) return "🍗";
  if (n.includes("piece") || n.includes("chicken") || n.includes("bucket") || n.includes("riblet")) return "🍗";
  if (n.includes("chips") || n.includes("fries")) return "🍟";
  if (n.includes("water")) return "💧";
  if (n.includes("drink")) return "🥤";
  if (n.includes("egg") || n.includes("sandwich") || n.includes("polony")) return "🥪";
  if (n.includes("sadza") || n.includes("stew")) return "🍲";
  if (n.includes("rice")) return "🍚";
  if (n.includes("salad") || n.includes("greens") || n.includes("coleslaw") || n.includes("cucumbers")) return "🥗";
  return "✨";
}

/* ==========================================================================
   Shopping Cart State & UI Sync Controller
   ========================================================================== */

window.openCart = function() {
  cartSidebar.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Freeze background scrolling
};

window.closeCart = function() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
  // Restore body scrolling only if detail modal is also closed
  if (!detailModal.classList.contains("active")) {
    document.body.style.overflow = "";
  }
};

let currentCheckoutStep = 1;

window.saveCartAndSync = function() {
  localStorage.setItem("bamboo_cart", JSON.stringify(cart));
  syncCartUI();
};

/* Multi-Step Checkout Wizard Logic */
window.goToCheckoutStep = function(targetStep) {
  if (targetStep === 2) {
    if (cart.length === 0) {
      showToast("⚠️ Your bucket is empty! Add some delicious food first.");
      return;
    }
  } else if (targetStep === 3) {
    // Validate Step 2 fields before proceeding to Step 3
    const nameInput = document.getElementById("checkout-name");
    const phoneInput = document.getElementById("checkout-phone");
    const addressInput = document.getElementById("checkout-address");

    const nameVal = nameInput ? nameInput.value.trim() : "";
    const phoneVal = phoneInput ? phoneInput.value.trim() : "";
    const addressVal = addressInput ? addressInput.value.trim() : "";

    if (!nameVal) {
      showToast("⚠️ Please enter your Full Name.");
      if (nameInput) nameInput.focus();
      return;
    }
    if (!phoneVal) {
      showToast("⚠️ Please enter your WhatsApp Phone Number.");
      if (phoneInput) phoneInput.focus();
      return;
    }
    if (currentOrderMethod === "delivery" && !addressVal) {
      showToast("⚠️ Please enter your Delivery Address.");
      if (addressInput) addressInput.focus();
      return;
    }

    // Auto-save customer info locally
    localStorage.setItem("bamboo_customer_name", nameVal);
    localStorage.setItem("bamboo_customer_phone", phoneVal);
    if (addressVal) localStorage.setItem("bamboo_customer_address", addressVal);
  }

  currentCheckoutStep = targetStep;

  // Update step progress indicator node states
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (node) {
      node.classList.remove("active", "completed");
      if (i === targetStep) {
        node.classList.add("active");
      } else if (i < targetStep) {
        node.classList.add("completed");
      }
    }
  }

  const line1 = document.getElementById("step-line-1");
  const line2 = document.getElementById("step-line-2");
  if (line1) line1.classList.toggle("completed", targetStep >= 2);
  if (line2) line2.classList.toggle("completed", targetStep >= 3);

  // Switch visible step pane
  for (let i = 1; i <= 3; i++) {
    const pane = document.getElementById(`wizard-step-${i}`);
    if (pane) {
      const isActive = (i === targetStep);
      pane.classList.toggle("active", isActive);
      if (isActive) {
        const content = pane.querySelector(".wizard-pane-content");
        if (content) content.scrollTop = 0;
      }
    }
  }

  if (targetStep === 1) {
    renderWizardCartItems();
  } else if (targetStep === 2) {
    if (typeof checkSavedLocationForPhone === "function") {
      checkSavedLocationForPhone();
    }
  }

  updateCheckoutSummaries();
};

window.renderWizardCartItems = function() {
  const container = document.getElementById("checkout-cart-items-wizard");
  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--color-gray);">
        <p style="margin: 0; font-size: 0.9rem;">Your bucket is empty.</p>
      </div>
    `;
    return;
  }

  cart.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "wizard-cart-item-card";

    const customText = item.customization ? `<span class="wizard-item-custom">✨ ${item.customization}</span>` : "";

    itemEl.innerHTML = `
      <div class="wizard-item-info">
        <h6 class="wizard-item-title">${item.name}</h6>
        ${customText}
        <span class="wizard-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
      <div class="wizard-item-actions">
        <div class="cart-qty-ctrl">
          <button type="button" class="cart-qty-btn" onclick="updateCartItemQtyFromWizard('${item.id}', -1)">−</button>
          <span class="cart-qty-val">${item.quantity}</span>
          <button type="button" class="cart-qty-btn" onclick="updateCartItemQtyFromWizard('${item.id}', 1)">+</button>
        </div>
        <button type="button" class="cart-item-remove-btn" onclick="removeCartItemFromWizard('${item.id}')" title="Remove item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x1="10" y1="11" y2="17"/><line x1="14" x1="14" y1="11" y2="17"/></svg>
        </button>
      </div>
    `;

    container.appendChild(itemEl);
  });
};

window.updateCartItemQtyFromWizard = function(id, delta) {
  updateCartItemQty(id, delta);
  renderWizardCartItems();
  updateCheckoutSummaries();
  if (cart.length === 0) {
    closeCheckoutModal();
  }
};

window.removeCartItemFromWizard = function(id) {
  removeCartItem(id);
  renderWizardCartItems();
  updateCheckoutSummaries();
  if (cart.length === 0) {
    closeCheckoutModal();
  }
};

window.openCheckoutModal = function() {
  if (cart.length === 0) {
    showToast("⚠️ Your bucket is empty! Add some delicious food first.");
    return;
  }
  
  // Close the cart sidebar to avoid overlapping UI
  closeCart();

  // Load auto-saved details if present
  const savedName = localStorage.getItem("bamboo_customer_name");
  const savedPhone = localStorage.getItem("bamboo_customer_phone");
  const savedAddress = localStorage.getItem("bamboo_customer_address");

  const nameInput = document.getElementById("checkout-name");
  const phoneInput = document.getElementById("checkout-phone");
  const addressInput = document.getElementById("checkout-address");

  if (nameInput && savedName && !nameInput.value) nameInput.value = savedName;
  if (phoneInput && savedPhone && !phoneInput.value) phoneInput.value = savedPhone;
  if (addressInput && savedAddress && !addressInput.value) addressInput.value = savedAddress;

  // Open Checkout Modal
  const checkoutModal = document.getElementById("checkout-modal");
  if (checkoutModal) {
    checkoutModal.classList.add("active");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
  
  goToCheckoutStep(1);
};

window.closeCheckoutModal = function() {
  const checkoutModal = document.getElementById("checkout-modal");
  if (checkoutModal) {
    checkoutModal.classList.remove("active");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
};

// Automatically scroll focused field into view on mobile keyboard focus
document.addEventListener("focusin", function(e) {
  if (e.target && e.target.closest("#checkout-modal")) {
    const el = e.target;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }
  }
});

window.DELIVERY_AREAS = [
  { id: "cbd", name: "Harare CBD", fee: 2.00, keywords: ["cbd", "central", "first street", "samora", "nelson mandela", "jason moyo", "kwame", "robert mugabe", "angwa", "innez", "chinhoyi", "leopold takawira", "speke", "rotton row", "fourth street", "fifth street", "roadport"] },
  { id: "avenues", name: "Avenues", fee: 2.00, keywords: ["avenues", "avenue", "baines", "fife", "herbert chitepo", "livingstone", "chinamano", "mazowe", "harare hospital", "selous"] },
  { id: "braeside", name: "Braeside", fee: 3.00, keywords: ["braeside", "dieppe"] },
  { id: "belvedere", name: "Belvedere", fee: 3.00, keywords: ["belvedere", "fallow", "princes"] },
  { id: "mt_pleasant", name: "Mt Pleasant", fee: 3.00, keywords: ["mt pleasant", "mount pleasant", "norfolk", "pendennis", "bond"] },
  { id: "uz", name: "UZ (University of Zimbabwe)", fee: 3.00, keywords: ["uz", "university of zimbabwe", "churchill"] },
  { id: "cranborne", name: "Cranborne", fee: 3.00, keywords: ["cranborne"] },
  { id: "graniteside", name: "Graniteside", fee: 3.00, keywords: ["graniteside", "kelvin", "cripps"] },
  { id: "newlands", name: "Newlands", fee: 3.50, keywords: ["newlands", "enterprise", "swan"] },
  { id: "greencroft", name: "Greencroft", fee: 4.00, keywords: ["greencroft", "lomagundi"] },
  { id: "madokero", name: "Madokero", fee: 4.00, keywords: ["madokero"] },
  { id: "sam_levys", name: "Sam Levy's / Borrowdale", fee: 4.50, keywords: ["sam levy", "sam levy's", "borrowdale", "ballantyne"] },
  { id: "westgate", name: "Westgate", fee: 5.00, keywords: ["westgate"] },
  { id: "other", name: "Other Harare Suburb ($3.00)", fee: 3.00, keywords: [] }
];

let selectedDeliveryAreaId = "cbd";
let isFreeDeliveryPromoActive = false;

window.setFreeDeliveryPromo = function(active) {
  isFreeDeliveryPromoActive = Boolean(active);
  updateCheckoutSummaries();
};

window.getCustomerFinancialBreakdown = function() {
  const foodSubtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
  const isDelivery = currentOrderMethod === "delivery";
  const isPickup = !isDelivery;

  let deliveryFee = 0.00;
  let deliveryFeeLabel = "$0.00";
  let areaName = "Harare CBD";

  if (isPickup) {
    deliveryFee = 0.00;
    deliveryFeeLabel = "PICKUP";
  } else {
    const areaSelect = document.getElementById("checkout-delivery-area");
    const chosenAreaId = areaSelect ? areaSelect.value : selectedDeliveryAreaId;
    let matched = window.DELIVERY_AREAS.find(a => a.id === chosenAreaId);

    if (!matched) {
      matched = window.DELIVERY_AREAS[0];
    }

    areaName = matched.name;
    const baseFee = matched.fee;

    if (isFreeDeliveryPromoActive) {
      deliveryFee = 0.00;
      deliveryFeeLabel = "FREE — Lunch Promotion";
    } else {
      deliveryFee = baseFee;
      deliveryFeeLabel = `$${deliveryFee.toFixed(2)}`;
    }
  }

  const grandTotal = foodSubtotal + deliveryFee;
  const paymentMethod = currentPaymentMethod || "Cash";
  const isCash = String(paymentMethod).toLowerCase() === "cash" || String(paymentMethod).toLowerCase().includes("cod") || String(paymentMethod).toLowerCase() === "cash on delivery";

  const totalLabel = isCash ? "TOTAL TO PAY" : "TOTAL";
  const paymentMethodDisplay = isCash ? "Cash on Delivery" : paymentMethod;

  return {
    foodSubtotal,
    deliveryFee,
    deliveryFeeLabel,
    grandTotal,
    isDelivery,
    isPickup,
    isCash,
    paymentMethod,
    paymentMethodDisplay,
    totalLabel,
    areaName
  };
};

window.onDeliveryAreaChange = function() {
  const areaSelect = document.getElementById("checkout-delivery-area");
  if (areaSelect) {
    areaSelect.dataset.userManuallySelected = "true";
    selectedDeliveryAreaId = areaSelect.value;
  }
  updateCheckoutSummaries();
};

window.onDeliveryAddressInput = function() {
  const addressInput = document.getElementById("checkout-address");
  const areaSelect = document.getElementById("checkout-delivery-area");
  
  if (addressInput && areaSelect && areaSelect.dataset.userManuallySelected !== "true") {
    const addressVal = addressInput.value.trim().toLowerCase();
    if (addressVal) {
      const autoMatched = window.DELIVERY_AREAS.find(a => a.keywords.some(k => addressVal.includes(k)));
      if (autoMatched && areaSelect.value !== autoMatched.id) {
        areaSelect.value = autoMatched.id;
        selectedDeliveryAreaId = autoMatched.id;
      }
    }
  }
  updateCheckoutSummaries();
};

window.setOrderMethod = function(method) {
  currentOrderMethod = method;
  
  const deliveryBtn = document.getElementById("type-btn-delivery");
  const collectionBtn = document.getElementById("type-btn-collection");
  const deliveryGroup = document.getElementById("group-delivery-address");
  const areaGroup = document.getElementById("group-delivery-area");
  const branchGroup = document.getElementById("group-collection-branch");
  const timeGroup = document.getElementById("group-collection-time");
  const addressInput = document.getElementById("checkout-address");
  
  if (method === "delivery") {
    if (deliveryBtn) deliveryBtn.classList.add("active");
    if (collectionBtn) collectionBtn.classList.remove("active");
    
    if (deliveryGroup) {
      deliveryGroup.classList.remove("hidden");
      deliveryGroup.style.display = "block";
    }
    if (areaGroup) {
      areaGroup.classList.remove("hidden");
      areaGroup.style.display = "block";
    }
    if (addressInput) addressInput.setAttribute("required", "required");
    
    if (branchGroup) branchGroup.style.display = "none";
    if (timeGroup) timeGroup.style.display = "none";
  } else {
    if (collectionBtn) collectionBtn.classList.add("active");
    if (deliveryBtn) deliveryBtn.classList.remove("active");
    
    if (deliveryGroup) {
      deliveryGroup.classList.add("hidden");
      deliveryGroup.style.display = "none";
    }
    if (areaGroup) {
      areaGroup.classList.add("hidden");
      areaGroup.style.display = "none";
    }
    if (addressInput) addressInput.removeAttribute("required");
    
    if (branchGroup) branchGroup.style.display = "block";
    if (timeGroup) timeGroup.style.display = "block";
  }
  
  updateCheckoutSummaries();
};

window.setPaymentMethod = function(method) {
  currentPaymentMethod = method;
  
  const paymentMethods = ["EcoCash", "InnBucks", "Cash", "Swipe"];
  paymentMethods.forEach(pm => {
    const btn = document.getElementById(`pay-card-${pm}`);
    if (btn) {
      btn.classList.toggle("active", pm === method);
    }
  });

  updateCheckoutSummaries();
};

function getDeliveryFee(subtotal, orderMethod) {
  const breakdown = window.getCustomerFinancialBreakdown();
  return breakdown.deliveryFee;
}

function updateCheckoutSummaries() {
  const breakdown = window.getCustomerFinancialBreakdown();

  // Step 1 Elements
  const step1Subtotal = document.getElementById("step1-subtotal");
  const step1Delivery = document.getElementById("step1-delivery");
  const step1DeliveryLabel = document.getElementById("step1-delivery-label");
  const step1Total = document.getElementById("step1-total");
  const step1TotalLabel = document.getElementById("step1-total-label");

  if (step1Subtotal) step1Subtotal.textContent = `$${breakdown.foodSubtotal.toFixed(2)}`;
  if (step1Delivery) step1Delivery.textContent = breakdown.deliveryFeeLabel;
  if (step1DeliveryLabel) step1DeliveryLabel.textContent = breakdown.isPickup ? "Delivery" : "Delivery fee";
  if (step1Total) step1Total.textContent = `$${breakdown.grandTotal.toFixed(2)}`;
  if (step1TotalLabel) step1TotalLabel.textContent = breakdown.totalLabel;

  // Step 2 Elements
  const step2DeliveryFeeVal = document.getElementById("step2-delivery-fee-val");
  if (step2DeliveryFeeVal) {
    if (breakdown.isDelivery) {
      step2DeliveryFeeVal.textContent = `${breakdown.deliveryFeeLabel} (${breakdown.areaName})`;
    } else {
      step2DeliveryFeeVal.textContent = "PICKUP (No delivery fee)";
    }
  }

  // Step 3 Elements
  const step3Subtotal = document.getElementById("step3-subtotal");
  const step3Delivery = document.getElementById("step3-delivery");
  const step3DeliveryLabel = document.getElementById("step3-delivery-label");
  const step3Total = document.getElementById("step3-total");
  const step3TotalLabel = document.getElementById("step3-total-label");
  const step3PaymentMethodDisplay = document.getElementById("step3-payment-method-display");
  const btnSubmitOrderText = document.getElementById("btn-submit-order-text");

  if (step3Subtotal) step3Subtotal.textContent = `$${breakdown.foodSubtotal.toFixed(2)}`;
  if (step3Delivery) step3Delivery.textContent = breakdown.deliveryFeeLabel;
  if (step3DeliveryLabel) step3DeliveryLabel.textContent = breakdown.isPickup ? "Delivery" : "Delivery fee";
  if (step3Total) step3Total.textContent = `$${breakdown.grandTotal.toFixed(2)}`;
  if (step3TotalLabel) step3TotalLabel.textContent = breakdown.totalLabel;
  if (step3PaymentMethodDisplay) step3PaymentMethodDisplay.textContent = breakdown.paymentMethodDisplay;
  if (btnSubmitOrderText) {
    btnSubmitOrderText.textContent = breakdown.isCash 
      ? `Place Order • Pay $${breakdown.grandTotal.toFixed(2)} on Delivery` 
      : `Place Order • $${breakdown.grandTotal.toFixed(2)}`;
  }

  // Cart Sidebar Elements
  const cartSummarySubtotal = document.getElementById("cart-summary-subtotal");
  const cartSummaryDelivery = document.getElementById("cart-summary-delivery");
  const cartSummaryGrand = document.getElementById("cart-summary-grand");
  const cartGrandLabel = document.getElementById("cart-grand-label");

  if (cartSummarySubtotal) cartSummarySubtotal.textContent = `$${breakdown.foodSubtotal.toFixed(2)}`;
  if (cartSummaryDelivery) cartSummaryDelivery.textContent = breakdown.deliveryFeeLabel;
  if (cartSummaryGrand) cartSummaryGrand.textContent = `$${breakdown.grandTotal.toFixed(2)}`;
  if (cartGrandLabel) cartGrandLabel.textContent = breakdown.totalLabel;
}

// Location state
let capturedLocationData = null;
let pendingOrderPayload = null;
let savedCustomerLocation = null;

// Check for saved location on step 2
window.checkSavedLocationForPhone = async function() {
  const phoneInput = document.getElementById("checkout-phone");
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const banner = document.getElementById("saved-location-banner");
  
  if (!banner) return;

  // Check localStorage
  const localSaved = localStorage.getItem("bamboo_saved_location");
  if (localSaved) {
    try {
      savedCustomerLocation = JSON.parse(localSaved);
      document.getElementById("saved-location-address-text").textContent = savedCustomerLocation.address || "Harare CBD Location";
      banner.style.display = "block";
      return;
    } catch(e) {}
  }

  banner.style.display = "none";
};

window.applySavedLocation = function() {
  if (savedCustomerLocation) {
    const addrInput = document.getElementById("checkout-address");
    if (addrInput && savedCustomerLocation.address) {
      addrInput.value = savedCustomerLocation.address;
    }
    capturedLocationData = {
      latitude: savedCustomerLocation.latitude,
      longitude: savedCustomerLocation.longitude,
      accuracy: 10
    };
    showToast("📍 Saved location applied!");
    dismissSavedLocationBanner();
  }
};

window.dismissSavedLocationBanner = function() {
  const banner = document.getElementById("saved-location-banner");
  if (banner) banner.style.display = "none";
};

window.submitOrderToWhatsApp = async function() {
  const nameInput = document.getElementById("checkout-name");
  const phoneInput = document.getElementById("checkout-phone");
  const addressInput = document.getElementById("checkout-address");
  const branchSelect = document.getElementById("checkout-branch");
  const timeInput = document.getElementById("checkout-pickup-time");
  const notesInput = document.getElementById("checkout-notes");
  
  const customerName = nameInput ? nameInput.value.trim() : "";
  const customerPhone = phoneInput ? phoneInput.value.trim() : "";
  
  if (!customerName) {
    showToast("⚠️ Please enter your Full Name.");
    goToCheckoutStep(2);
    if (nameInput) nameInput.focus();
    return;
  }
  if (!customerPhone) {
    showToast("⚠️ Please enter your WhatsApp Phone Number.");
    goToCheckoutStep(2);
    if (phoneInput) phoneInput.focus();
    return;
  }

  localStorage.setItem("bamboo_customer_name", customerName);
  localStorage.setItem("bamboo_customer_phone", customerPhone);
  
  let orderDetailsPart = "";
  if (currentOrderMethod === "delivery") {
    const addressVal = addressInput ? addressInput.value.trim() : "";
    if (!addressVal) {
      showToast("⚠️ Please enter your Delivery Address.");
      goToCheckoutStep(2);
      if (addressInput) addressInput.focus();
      return;
    }
    localStorage.setItem("bamboo_customer_address", addressVal);
    orderDetailsPart = `• *Delivery Address:* ${addressVal}`;
  } else {
    const branchVal = branchSelect ? branchSelect.value : "Roadport Main Branch";
    const timeVal = timeInput && timeInput.value.trim() ? timeInput.value.trim() : "As soon as possible";
    orderDetailsPart = `• *Collection Branch:* ${branchVal}\n• *Est. Pickup Time:* ${timeVal}`;
  }

  // Check if location permission prompt is needed before submitting
  if (currentOrderMethod === "delivery" && !capturedLocationData) {
    const modal = document.getElementById("location-permission-modal");
    if (modal) {
      modal.style.display = "flex";
      return;
    }
  }

  await executeFinalOrderSubmission();
};

window.confirmAllowLocation = function() {
  const modal = document.getElementById("location-permission-modal");
  if (modal) modal.style.display = "none";

  if (navigator.geolocation) {
    showToast("📍 Capturing your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        capturedLocationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
        executeFinalOrderSubmission();
      },
      (err) => {
        console.warn("Location denied or unavailable:", err);
        showToast("Using address manually...");
        capturedLocationData = null;
        executeFinalOrderSubmission();
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  } else {
    capturedLocationData = null;
    executeFinalOrderSubmission();
  }
};

window.confirmSkipLocation = function() {
  const modal = document.getElementById("location-permission-modal");
  if (modal) modal.style.display = "none";
  capturedLocationData = null;
  executeFinalOrderSubmission();
};

let isSubmittingOrder = false;

async function executeFinalOrderSubmission() {
  if (isSubmittingOrder) return;
  isSubmittingOrder = true;

  const loadingOverlay = document.getElementById("checkout-loading-overlay");

  try {
    const nameInput = document.getElementById("checkout-name");
    const phoneInput = document.getElementById("checkout-phone");
    const addressInput = document.getElementById("checkout-address");
    const branchSelect = document.getElementById("checkout-branch");
    const timeInput = document.getElementById("checkout-pickup-time");
    const notesInput = document.getElementById("checkout-notes");

    const customerName = nameInput ? nameInput.value.trim() : "";
    const customerPhone = phoneInput ? phoneInput.value.trim() : "";
    const breakdown = window.getCustomerFinancialBreakdown();
    const specialNotes = notesInput && notesInput.value.trim() ? notesInput.value.trim() : "";
    const addressVal = addressInput ? addressInput.value.trim() : "";
    const branchVal = branchSelect ? branchSelect.value : "Roadport Main Branch";

    const apiPayload = {
      customer_name: customerName,
      phone: customerPhone,
      items: cart.map(item => ({
        name: item.name,
        qty: item.quantity,
        quantity: item.quantity,
        price: parseFloat(item.price),
        options: item.customization || ""
      })),
      total: parseFloat(breakdown.grandTotal.toFixed(2)),
      delivery_fee: parseFloat(breakdown.deliveryFee.toFixed(2)),
      notes: specialNotes || (breakdown.isDelivery ? `Delivery (${breakdown.areaName}): ${addressVal}` : `Pickup at ${branchVal}`),
      payment_method: breakdown.paymentMethodDisplay,
      type: currentOrderMethod,
      order_status: "new",
      status: "new",
      customer_lat: capturedLocationData ? capturedLocationData.latitude : null,
      customer_lng: capturedLocationData ? capturedLocationData.longitude : null,
      location_accuracy: capturedLocationData ? capturedLocationData.accuracy : null
    };

    if (loadingOverlay) loadingOverlay.style.display = "flex";

    // Submit Real Order to Production Worker & D1 Database
    let postResponse;
    try {
      console.log("Submitting order to Production Worker:", `${API_BASE}/orders`);
      postResponse = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload)
      });
    } catch (networkErr) {
      console.error("Network error connecting to production worker:", networkErr);
      showToast("❌ Network error. Could not reach server. Please try again.");
      if (loadingOverlay) loadingOverlay.style.display = "none";
      isSubmittingOrder = false;
      return;
    }

    if (!postResponse.ok) {
      console.error("Production Worker returned status:", postResponse.status);
      showToast("❌ Could not save order to database. Please try again.");
      if (loadingOverlay) loadingOverlay.style.display = "none";
      isSubmittingOrder = false;
      return;
    }

    // Retrieve the persisted Order ID from D1 via GET /orders
    let orderId = null;
    try {
      const getRes = await fetch(`${API_BASE}/orders`);
      if (getRes.ok) {
        const ordersList = await getRes.json();
        if (Array.isArray(ordersList) && ordersList.length > 0) {
          const match = ordersList.find(o => o.phone === customerPhone) || ordersList[0];
          if (match && match.id !== undefined && match.id !== null) {
            orderId = String(match.id).startsWith("BC-") ? String(match.id) : `BC-${match.id}`;
          }
        }
      }
    } catch (getErr) {
      console.warn("Error fetching assigned order ID from D1:", getErr);
    }

    if (!orderId) {
      showToast("❌ Order saved, but failed to retrieve confirmation ID. Please try again.");
      if (loadingOverlay) loadingOverlay.style.display = "none";
      isSubmittingOrder = false;
      return;
    }

    // Format WhatsApp Message with confirmed orderId from D1
    let itemsFormattedList = "";
    cart.forEach(item => {
      const customText = item.customization ? ` (${item.customization})` : "";
      itemsFormattedList += `${item.quantity}x ${item.name}${customText} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const locationDetails = capturedLocationData 
      ? `\n📍 *GPS Location:* https://maps.google.com/?q=${capturedLocationData.latitude},${capturedLocationData.longitude}` 
      : "";

    const whatsappMessage = `🎋 *BAMBOO CHICKEN - NEW ORDER (${orderId})* 🎋
----------------------------------------
👤 *CUSTOMER DETAILS:*
• *Name:* ${customerName}
• *Phone:* ${customerPhone}
• *Type:* ${breakdown.isDelivery ? `DELIVERY (${breakdown.areaName})` : 'PICKUP'}
• *Payment Method:* ${breakdown.paymentMethodDisplay}
• *Address/Branch:* ${breakdown.isDelivery ? addressVal : branchVal}${locationDetails}

🛒 *ITEMS ORDERED:*
${itemsFormattedList}
💵 *ORDER SUMMARY:*
• *Food Subtotal:* $${breakdown.foodSubtotal.toFixed(2)}
• *Delivery Fee:* ${breakdown.deliveryFeeLabel}
• *${breakdown.totalLabel}:* $${breakdown.grandTotal.toFixed(2)}
----------------------------------------
Thank you for ordering with Bamboo Chicken! 🍗✨`;

    const encodedText = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/263790040778?text=${encodedText}`;
    latestWhatsAppUrl = whatsappUrl;

    // Safely attempt WhatsApp opening
    try {
      const openedWin = window.open(whatsappUrl, "_blank");
      if (!openedWin) {
        const anchor = document.createElement("a");
        anchor.href = whatsappUrl;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }
    } catch (waErr) {
      console.warn("WhatsApp popup launch skipped or blocked:", waErr);
    }

    // Clear cart and state
    cart = [];
    saveCartAndSync();
    closeCheckoutModal();

    localStorage.setItem("bamboo_active_order_id", orderId);

    // If location permission was granted, prompt to save location
    if (capturedLocationData) {
      pendingOrderPayload = {
        phone: customerPhone,
        address: addressInput ? addressInput.value.trim() : "",
        latitude: capturedLocationData.latitude,
        longitude: capturedLocationData.longitude,
        orderId: orderId
      };
      const saveModal = document.getElementById("save-location-modal");
      if (saveModal) saveModal.style.display = "flex";
    } else {
      showOrderSuccessModal(orderId);
    }

    capturedLocationData = null;
  } catch (err) {
    console.error("Critical error in executeFinalOrderSubmission:", err);
    showToast("⚠️ Order submission encountered an error. Please try again.");
  } finally {
    if (loadingOverlay) loadingOverlay.style.display = "none";
    isSubmittingOrder = false;
  }
}

let latestSubmittedOrderId = null;
let latestWhatsAppUrl = null;

window.showOrderSuccessModal = function(orderId) {
  latestSubmittedOrderId = orderId;
  localStorage.setItem("bamboo_active_order_id", orderId);

  const modal = document.getElementById("order-success-modal");
  const orderIdLabel = document.getElementById("success-modal-order-id");
  const prepTimeLabel = document.getElementById("success-modal-prep-time");

  if (orderIdLabel) orderIdLabel.textContent = orderId;
  if (prepTimeLabel) prepTimeLabel.textContent = "18 minutes";

  if (modal) {
    modal.style.display = "flex";
  }
};

window.handleOpenWhatsAppFromSuccess = function() {
  if (latestWhatsAppUrl) {
    window.open(latestWhatsAppUrl, "_blank");
  } else {
    window.open("https://wa.me/263790040778", "_blank");
  }
};

window.handleContinueBrowsingFromSuccess = function() {
  const modal = document.getElementById("order-success-modal");
  if (modal) modal.style.display = "none";
};

window.handleSaveLocationChoice = function(shouldSave) {
  const saveModal = document.getElementById("save-location-modal");
  if (saveModal) saveModal.style.display = "none";

  const savedOrderId = pendingOrderPayload ? pendingOrderPayload.orderId : null;

  if (shouldSave && pendingOrderPayload) {
    try {
      localStorage.setItem("bamboo_saved_location", JSON.stringify(pendingOrderPayload));
      showToast("💾 Delivery location saved for future orders!");
    } catch(e) {}
  }

  pendingOrderPayload = null;
  const activeId = savedOrderId || latestSubmittedOrderId || localStorage.getItem("bamboo_active_order_id");
  if (activeId) {
    showOrderSuccessModal(activeId);
  }
};

window.syncCartUI = syncCartUI;
function syncCartUI() {
  // Update Cart Badge on header
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  cartBadges.forEach(badge => {
    badge.textContent = totalQuantity;
    if (totalQuantity > 0) {
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  });

  // Update Floating Cart Button values
  const floatingCartQty = document.getElementById("floating-cart-qty");
  const floatingCartTotal = document.getElementById("floating-cart-total");
  const floatingCartBtn = document.getElementById("floating-cart");
  const breakdown = typeof window.getCustomerFinancialBreakdown === "function" 
    ? window.getCustomerFinancialBreakdown() 
    : { foodSubtotal: 0, grandTotal: 0, deliveryFeeLabel: "$2.00", totalLabel: "TOTAL" };

  if (floatingCartQty) floatingCartQty.textContent = totalQuantity;
  if (floatingCartTotal) floatingCartTotal.textContent = `$${breakdown.foodSubtotal.toFixed(2)}`;
  if (floatingCartBtn) {
    if (totalQuantity > 0) {
      floatingCartBtn.style.display = "flex";
      // Add bounce animation
      floatingCartBtn.classList.remove("bounce-cart");
      void floatingCartBtn.offsetWidth; // force reflow
      floatingCartBtn.classList.add("bounce-cart");
    } else {
      floatingCartBtn.style.display = "none";
    }
  }

  // Update bottom nav cart badge
  const bottomCartBadge = document.getElementById("bottom-cart-badge");
  if (bottomCartBadge) {
    bottomCartBadge.textContent = totalQuantity;
    if (totalQuantity > 0) {
      bottomCartBadge.style.display = "block";
    } else {
      bottomCartBadge.style.display = "none";
    }
  }

  // Clear sidebar content
  cartSidebarBodyInner.innerHTML = "";

  if (cart.length === 0) {
    // Empty Cart State
    cartSidebarBodyInner.innerHTML = `
      <div class="cart-empty-state">
        <span class="cart-empty-icon">🛒</span>
        <h4>Your bucket is empty</h4>
        <p>Browse our delicious menu and add some crispy magic to your order!</p>
      </div>
    `;
    
    if (cartSummaryQty) cartSummaryQty.textContent = "0";
    if (cartSummarySubtotal) cartSummarySubtotal.textContent = "$0.00";
    if (cartSummaryGrand) cartSummaryGrand.textContent = "$0.00";
  } else {
    let subtotal = 0;

    cart.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      const cartItemEl = document.createElement("div");
      cartItemEl.classList.add("cart-item");
      
      const customizationTag = item.customization 
        ? `<span class="cart-item-customization">✨ ${item.customization}</span>` 
        : "";

      cartItemEl.innerHTML = `
        <div class="cart-item-image-wrapper">
          <img class="cart-item-image" src="${item.image}" alt="${item.name}" referrerPolicy="no-referrer">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          ${customizationTag}
          <div class="cart-item-price-row">
            <span class="cart-item-unit-price">$${item.price.toFixed(2)} each</span>
            <span class="cart-item-subtotal">$${itemSubtotal.toFixed(2)}</span>
          </div>
          
          <div class="cart-item-price-row" style="margin-top: 12px;">
            <!-- Quantity controls -->
            <div class="cart-qty-ctrl">
              <button class="cart-qty-btn" onclick="updateCartItemQty('${item.id}', -1)" aria-label="Decrease Quantity">−</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateCartItemQty('${item.id}', 1)" aria-label="Increase Quantity">+</button>
            </div>
            
            <!-- Remove Button -->
            <button class="cart-item-remove-btn" onclick="removeCartItem('${item.id}')" aria-label="Remove item" title="Remove item">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x1="10" y1="11" y2="17"/><line x1="14" x1="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        </div>
      `;

      cartSidebarBodyInner.appendChild(cartItemEl);
    });

    if (cartSummaryQty) cartSummaryQty.textContent = totalQuantity;
    if (cartSummarySubtotal) cartSummarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartSummaryGrand) cartSummaryGrand.textContent = `$${breakdown.grandTotal.toFixed(2)}`;
  }

  updateCheckoutSummaries();
};

window.updateCartItemQty = function(cartItemId, delta) {
  const itemIndex = cart.findIndex(item => item.id === cartItemId);
  if (itemIndex > -1) {
    const newQty = cart[itemIndex].quantity + delta;
    if (newQty <= 0) {
      const removedName = cart[itemIndex].name;
      cart.splice(itemIndex, 1);
      showToast(`🛒 Removed ${removedName} from your bucket.`);
    } else {
      cart[itemIndex].quantity = newQty;
    }
    saveCartAndSync();
  }
};

window.removeCartItem = function(cartItemId) {
  const itemIndex = cart.findIndex(item => item.id === cartItemId);
  if (itemIndex > -1) {
    const removedName = cart[itemIndex].name;
    cart.splice(itemIndex, 1);
    saveCartAndSync();
    showToast(`🛒 Removed ${removedName} from your bucket.`);
  }
};

window.addToCart = function(itemId, customQty = 1) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  let cartItemId = itemId;
  let displayName = item.name;
  let finalPrice = item.price;
  let customizationDetails = "";

  // Check card-specific options if they exist
  if (itemId === "sadza-meal") {
    const select = document.getElementById(`card-sel-${itemId}`);
    const chosenMeat = select ? select.value : "Chicken";
    cartItemId = `${itemId}-${chosenMeat.toLowerCase()}`;
    displayName = `${item.name} (${chosenMeat})`;
    customizationDetails = `Stew: ${chosenMeat}`;
  }

  // Add/Update cart state
  const existingCartIndex = cart.findIndex(cartItem => cartItem.id === cartItemId);
  if (existingCartIndex > -1) {
    cart[existingCartIndex].quantity += customQty;
  } else {
    cart.push({
      id: cartItemId,
      baseId: itemId,
      name: displayName,
      price: finalPrice,
      quantity: customQty,
      image: item.image,
      customization: customizationDetails
    });
  }

  saveCartAndSync();
  
  // Trigger bounce animation on badges
  cartBadges.forEach(badge => {
    badge.classList.remove("bounce");
    void badge.offsetWidth; // Force reflow
    badge.classList.add("bounce");
  });

  showToast(`Added ${customQty > 1 ? customQty + 'x ' : ''}${displayName} to cart`);
};

// Custom Toast Alert System
function showToast(message) {
  if (!toastContainer) return;

  // Replace existing toast if items are added in rapid succession
  while (toastContainer.firstChild) {
    toastContainer.removeChild(toastContainer.firstChild);
  }

  // Clean message: strip duplicate icons/emojis if present
  const cleanMsg = message.replace(/^[🛒✅📍❌⚠️🍗💾]\s*/, "");

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span class="toast-success-icon">✓</span>
    <span>${cleanMsg}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto-dismiss after 1 second (1000ms)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 1000);
}

/* ==========================================================================
   Premium Interface Controllers & Animations
   ========================================================================== */

window.changeCardQty = function(itemId, delta) {
  const qtySpan = document.getElementById(`card-qty-val-${itemId}`);
  if (qtySpan) {
    let currentVal = parseInt(qtySpan.textContent) || 1;
    currentVal += delta;
    if (currentVal < 1) currentVal = 1;
    qtySpan.textContent = currentVal;
  }
};

window.addCardToCart = function(itemId) {
  const qtySpan = document.getElementById(`card-qty-val-${itemId}`);
  const qty = qtySpan ? (parseInt(qtySpan.textContent) || 1) : 1;

  // Find product details
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  // Add item to cart state
  addToCart(itemId, qty);
  
  // Reset card quantity value to 1 for next tap
  if (qtySpan) qtySpan.textContent = "1";
  
  // Trigger modern premium flying visual animation
  animateFlyToCart(itemId);
};

window.animateFlyToCart = function(itemId) {
  const card = document.getElementById(`menu-card-${itemId}`);
  const targetCart = document.getElementById("floating-cart") || document.getElementById("cart-btn");
  if (!card || !targetCart) return;

  const img = card.querySelector(".menu-card-image");
  if (!img) return;

  // Clone image for visual path projection
  const flyer = img.cloneNode();
  flyer.style.position = "fixed";
  flyer.style.zIndex = "10000";
  flyer.style.width = `${img.offsetWidth}px`;
  flyer.style.height = `${img.offsetHeight}px`;
  flyer.style.borderRadius = "var(--radius-md)";
  flyer.style.objectFit = "cover";
  flyer.style.pointerEvents = "none";
  flyer.style.transition = "all 0.8s cubic-bezier(0.19, 1, 0.22, 1)";

  const imgRect = img.getBoundingClientRect();
  flyer.style.top = `${imgRect.top}px`;
  flyer.style.left = `${imgRect.left}px`;

  document.body.appendChild(flyer);

  const cartRect = targetCart.getBoundingClientRect();
  void flyer.offsetWidth; // Force hardware reflow

  // Transform coordinates toward floating cart button
  flyer.style.top = `${cartRect.top + (targetCart.offsetHeight / 2) - 15}px`;
  flyer.style.left = `${cartRect.left + (targetCart.offsetWidth / 2) - 15}px`;
  flyer.style.width = "30px";
  flyer.style.height = "30px";
  flyer.style.opacity = "0.2";
  flyer.style.transform = "rotate(360deg)";

  setTimeout(() => {
    flyer.remove();
  }, 800);
};

window.setPaymentMethod = function(method) {
  currentPaymentMethod = method;
  
  // Match checkmarks and styles with payment selections
  const options = document.querySelectorAll(".payment-option");
  options.forEach(opt => {
    const pill = opt.querySelector(".payment-pill");
    const radio = opt.querySelector("input[type='radio']");
    if (pill) {
      if (radio && radio.value === method) {
        pill.classList.add("active");
        radio.checked = true;
      } else {
        pill.classList.remove("active");
      }
    }
  });
};

window.showOrderSuccessScreen = function() {
  const checkoutFormContainer = document.getElementById("checkout-form-container");
  const checkoutSuccessContainer = document.getElementById("checkout-success-container");
  
  if (checkoutFormContainer && checkoutSuccessContainer) {
    const successOrderItemsList = document.getElementById("success-order-items-list");
    const successOrderTotalValue = document.getElementById("success-order-total-value");
    const successOrderIdLabel = document.getElementById("success-order-id-label");
    
    if (successOrderIdLabel) {
      successOrderIdLabel.textContent = `Order Placed Successfully`;
    }
    
    if (successOrderItemsList) {
      let itemsHtml = "";
      cart.forEach(item => {
        itemsHtml += `
          <div style="display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 6px;">
            <span style="color: var(--color-gray);"><strong style="color: var(--color-dark);">${item.quantity}x</strong> ${item.name}</span>
            <span style="font-weight: 600; color: var(--color-dark);">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `;
      });
      successOrderItemsList.innerHTML = itemsHtml;
    }
    
    if (successOrderTotalValue) {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = getDeliveryFee(subtotal, currentOrderMethod);
      const grandTotal = subtotal + deliveryFee;
      successOrderTotalValue.textContent = `$${grandTotal.toFixed(2)}`;
    }
    
    checkoutFormContainer.style.display = "none";
    checkoutSuccessContainer.style.display = "flex";
  }
};

window.closeCheckoutSuccessAndReset = function() {
  cart = [];
  saveCartAndSync();
  closeCheckoutModal();
  
  const checkoutFormContainer = document.getElementById("checkout-form-container");
  const checkoutSuccessContainer = document.getElementById("checkout-success-container");
  if (checkoutFormContainer && checkoutSuccessContainer) {
    checkoutFormContainer.style.display = "flex";
    checkoutSuccessContainer.style.display = "none";
  }
  
  // Reset form values cleanly
  const nameInput = document.getElementById("checkout-name");
  const phoneInput = document.getElementById("checkout-phone");
  const addressInput = document.getElementById("checkout-address");
  const timeInput = document.getElementById("checkout-pickup-time");
  const notesInput = document.getElementById("checkout-notes");
  
  if (nameInput) nameInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (addressInput) addressInput.value = "";
  if (timeInput) timeInput.value = "";
  if (notesInput) notesInput.value = "";
};

// Initialize Application after all definitions
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBambooApp);
} else {
  initBambooApp();
}
