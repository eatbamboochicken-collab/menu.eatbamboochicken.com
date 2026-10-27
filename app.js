/**
 * Bamboo Chicken - Interactive Digital Menu Script (Phase 2A)
 * Vanilla JavaScript (ES6+)
 * Brand: Fun, Modern, Bright, Family Friendly, Premium Fast Food
 */

const API_BASE = "https://bamboo-orders-api.warstreett.workers.dev";

// Historical menu references preserved for past order receipts and cashier records
const HISTORICAL_MENU_DATA = [
  { id: "sadza-beef", name: "Sadza Beef", price: 3.00, category: "meals" },
  { id: "sadza-chicken", name: "Sadza Chicken", price: 3.00, category: "meals" },
  { id: "chicken-bones", name: "Chicken Bones", price: 1.00, category: "chicken-meals" },
  { id: "chicken-fillet", name: "Chicken Fillet", price: 3.00, category: "chicken-meals" },
  { id: "bamboo-chicken-chips", name: "Bamboo Chicken with Small Chips", price: 2.50, category: "signature-meals" },
  { id: "chicken-more-1-piecer", name: "1 Piecer", price: 2.50, category: "chicken-meals" },
  { id: "chicken-pieces-1-piecer", name: "1 Piecer", price: 2.50, category: "chicken-meals" },
  { id: "chicken-pieces-2-piecer", name: "2 Piecer", price: 3.50, category: "chicken-pieces" },
  { id: "chicken-pieces-3-piecer", name: "3 Piecer", price: 4.50, category: "chicken-pieces" },
  { id: "chicken-pieces-8-piece-bucket", name: "8 Piece Bucket", price: 9.00, category: "chicken-pieces" },
  { id: "coca-cola-300ml", name: "Coca-Cola — 300ml", price: 0.50, category: "drinks-and-extras" },
  { id: "fanta-300ml", name: "Fanta — 300ml", price: 0.50, category: "drinks-and-extras" },
  { id: "sprite-300ml", name: "Sprite — 300ml", price: 0.50, category: "drinks-and-extras" },
  { id: "select-ice-tea", name: "Select Ice Tea", price: 3.00, category: "drinks-and-extras" }
];

// Active Customer Menu Database (Bamboo Chicken Select - Dumplings First)
const MENU_DATA = [
  // 🥟 A. DUMPLINGS
  {
    id: "chicken-dumplings",
    category: "dumplings",
    name: "Chicken Dumplings",
    price: 5.00,
    unit: "per pack of 5",
    description: "Steamed chicken dumplings.",
    comboIncludes: ["Steamed Chicken Dumplings (5 Pack)"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Bamboo-Chicken-Cooked-Chicken-Dumplings.webp",
    details: "Steamed chicken dumplings served with dipping sauce.",
    freeBadge: "🥟 Cooked • Pack of 5"
  },
  {
    id: "beef-dumplings",
    category: "dumplings",
    name: "Beef Dumplings",
    price: 5.00,
    unit: "per pack of 5",
    description: "Steamed beef dumplings.",
    comboIncludes: ["Steamed Beef Dumplings (5 Pack)"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Bamboo-Chicken-Cooked-Beef-Dumplings.webp",
    details: "Steamed beef dumplings served with dipping sauce.",
    freeBadge: "🥟 Cooked • Pack of 5"
  },
  {
    id: "finish-at-home-chicken-dumpling-box",
    category: "dumplings",
    name: "Finish-at-Home Chicken Dumpling Box",
    price: 10.00,
    unit: "per box of 10",
    description: "Ready to cook chicken dumplings at home.",
    comboIncludes: ["Chicken Dumplings (Box of 10)"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Bamboo-Chicken-Half-Cooked-Chicken-Dumplings.webp",
    details: "Ready to cook chicken dumplings at home.",
    freeBadge: "📦 Half-Cooked • Box of 10"
  },
  {
    id: "finish-at-home-beef-dumpling-box",
    category: "dumplings",
    name: "Finish-at-Home Beef Dumpling Box",
    price: 10.00,
    unit: "per box of 10",
    description: "Ready to cook beef dumplings at home.",
    comboIncludes: ["Beef Dumplings (Box of 10)"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Bamboo-Chicken-Half-Cooked-Beef-Dumplings.webp",
    details: "Ready to cook beef dumplings at home.",
    freeBadge: "📦 Half-Cooked • Box of 10"
  },

  // ⭐ B. SIGNATURE MEALS
  {
    id: "bamboo-chicken",
    category: "signature-meals",
    name: "Bamboo Chicken",
    price: 3.00,
    unit: "per stick",
    description: "Chicken served on a bamboo stick.",
    comboIncludes: ["Grilled Bamboo Chicken Stick"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Bamboo%20chicken.jpg",
    details: "Chicken served on a bamboo stick."
  },
  {
    id: "bamboo-chicken-mega-chips",
    category: "signature-meals",
    name: "Bamboo Chicken + Mega Chips",
    price: 5.00,
    description: "Grilled Bamboo Chicken stick served with a large portion of golden crispy mega chips.",
    comboIncludes: ["Grilled Bamboo Chicken Stick", "Large Mega Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Bamboo%20chicken.jpg",
    details: "Grilled Bamboo Chicken stick served with a large portion of golden crispy mega chips."
  },
  {
    id: "bamboo-pie",
    category: "signature-meals",
    name: "Bamboo Pie",
    price: 3.00,
    unit: "per pie",
    description: "A savoury baked pie.",
    comboIncludes: ["Chicken & Mushroom Baked Pie"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/bamboo_pie_3.webp",
    details: "A savoury baked pie filled with chicken and mushroom."
  },

  // 🍗 C. CHICKEN MEALS
  {
    id: "1-piecer",
    category: "chicken-meals",
    name: "1-Piecer",
    price: 3.00,
    description: "1 piece of crispy fried chicken served with chips.",
    comboIncludes: ["1 Piece Crispy Fried Chicken", "Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/1%20piecer.jpg",
    details: "1 piece of crispy fried chicken served with chips."
  },
  {
    id: "2-piecer",
    category: "chicken-meals",
    name: "2-Piecer",
    price: 4.00,
    description: "2 pieces of crispy fried chicken served with chips.",
    comboIncludes: ["2 Pieces Crispy Fried Chicken", "Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/2%20piecer.jpg",
    details: "2 pieces of crispy fried chicken served with chips."
  },
  {
    id: "3-piecer",
    category: "chicken-meals",
    name: "3-Piecer",
    price: 5.00,
    description: "3 pieces of crispy fried chicken served with chips.",
    comboIncludes: ["3 Pieces Crispy Fried Chicken", "Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/3%20piecer.jpg",
    details: "3 pieces of crispy fried chicken served with chips."
  },
  {
    id: "chicken-nuggets",
    category: "chicken-meals",
    name: "Chicken Nuggets",
    price: 3.00,
    unit: "per 150g portion",
    description: "Crispy golden chicken nuggets (150g portion).",
    comboIncludes: ["Crispy Chicken Nuggets (150g portion)"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Chicken-Nuggets.webp",
    details: "Crispy golden chicken nuggets (150g portion)."
  },

  // 🍔 D. WRAPS & BURGERS
  {
    id: "chicken-wrap",
    category: "wraps-and-burgers",
    name: "Chicken Wrap",
    price: 3.00,
    description: "Chicken strips, lettuce, tomatoes and dressing wrapped in a tortilla.",
    comboIncludes: ["Chicken Strips", "Lettuce & Tomatoes", "Dressing", "Tortilla Wrap"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Chicken%20wrape.jpeg",
    details: "Chicken strips, lettuce, tomatoes and dressing wrapped in a tortilla."
  },
  {
    id: "shawarma",
    category: "wraps-and-burgers",
    name: "Shawarma",
    price: 3.00,
    description: "Sliced chicken wrapped in pita bread with garlic sauce.",
    comboIncludes: ["Sliced Roasted Chicken", "Garlic Sauce", "Pita Bread"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Chicken%20wrape.jpeg",
    details: "Sliced chicken wrapped in pita bread with garlic sauce."
  },
  {
    id: "chicken-burger",
    category: "wraps-and-burgers",
    name: "Chicken Burger",
    price: 3.00,
    description: "Chicken patty with lettuce and mayonnaise on a bun.",
    comboIncludes: ["Chicken Patty", "Lettuce", "Mayonnaise", "Burger Bun"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Chicken%20burger.jpg",
    details: "Chicken patty with lettuce and mayonnaise on a bun."
  },
  {
    id: "boss-burger",
    category: "wraps-and-burgers",
    name: "Boss Burger",
    price: 5.50,
    description: "Double chicken fillet burger with cheese, lettuce and sauce.",
    comboIncludes: ["2 Chicken Fillets", "Cheese", "Lettuce", "Boss Sauce", "Burger Bun"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Boss%20burger.jpg",
    details: "Double chicken fillet burger with cheese, lettuce and sauce."
  },

  // 🍟 E. RICE & SIDES
  {
    id: "fried-rice",
    category: "rice-and-sides",
    name: "Fried Rice",
    price: 3.00,
    description: "Fried Rice served with Chicken Nuggets and Coleslaw.",
    comboIncludes: ["Seasoned Fried Rice", "Crispy Chicken Nuggets", "Creamy Coleslaw"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Fried%20rice.jpg",
    details: "Fried Rice served with Chicken Nuggets and Coleslaw."
  },
  {
    id: "plain-chips-small",
    category: "rice-and-sides",
    name: "Plain Chips (Small)",
    price: 1.00,
    description: "A small portion of golden seasoned potato chips.",
    comboIncludes: ["Small Portion Seasoned Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Snall%20chips.jpg",
    details: "A small portion of golden seasoned potato chips."
  },
  {
    id: "mega-chips",
    category: "rice-and-sides",
    name: "Mega Chips",
    price: 2.00,
    description: "A large portion of golden seasoned potato chips.",
    comboIncludes: ["Large Portion Seasoned Chips"],
    image: "https://pub-1d12d1bcd0c54b5282f7b9e9eec3ba59.r2.dev/assets/images/menu/Mega%20chips.jpeg",
    details: "A large portion of golden seasoned potato chips."
  },
  {
    id: "garden-salad",
    category: "rice-and-sides",
    name: "Garden Salad",
    price: 2.00,
    description: "Mixed greens, cucumbers and tomatoes with dressing.",
    comboIncludes: ["Mixed Greens", "Cucumbers & Tomatoes", "Salad Dressing"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Garden-Salad.webp",
    details: "Mixed greens, cucumbers and tomatoes with dressing."
  },
  {
    id: "coleslaw",
    category: "rice-and-sides",
    name: "Coleslaw",
    price: 1.00,
    description: "Fresh shredded cabbage and carrots in creamy dressing.",
    comboIncludes: ["Shredded Cabbage & Carrots", "Creamy Dressing"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Coleslaw.webp",
    details: "Fresh shredded cabbage and carrots in creamy dressing."
  },
  {
    id: "chicken-salad",
    category: "rice-and-sides",
    name: "Chicken Salad",
    price: 3.00,
    description: "Tender chicken strips served on a bed of fresh garden salad.",
    comboIncludes: ["Tender Chicken Strips", "Fresh Garden Greens", "Salad Dressing"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Chicken-Salad.webp",
    details: "Tender chicken strips served on a bed of fresh garden salad."
  },

  // 🥤 F. DRINKS & EXTRAS
  {
    id: "ice-tea",
    category: "drinks-and-extras",
    name: "Ice Tea",
    price: 3.00,
    unit: "per bottle",
    description: "Refreshing chilled Ice Tea.",
    comboIncludes: ["Chilled Ice Tea"],
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    details: "Refreshing chilled Ice Tea."
  },
  {
    id: "milk-tea",
    category: "drinks-and-extras",
    name: "Milk Tea",
    price: 5.00,
    unit: "per cup",
    description: "Rich, creamy chilled milk tea brewed fresh.",
    comboIncludes: ["Chilled Fresh Milk Tea"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Milk-Tea.webp",
    details: "Rich, creamy chilled milk tea brewed fresh."
  },
  {
    id: "soy-sauce",
    category: "drinks-and-extras",
    name: "Soy Sauce",
    price: 3.00,
    unit: "per full bottle",
    description: "Full bottle of dipping soy sauce.",
    comboIncludes: ["Soy Sauce (Full Bottle)"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Soy%20source.jpg",
    details: "Full bottle of dipping soy sauce."
  },
  {
    id: "coca-cola-500ml",
    category: "drinks-and-extras",
    name: "Coca-Cola — 500ml",
    price: 1.00,
    description: "Chilled Coca-Cola 500ml bottle.",
    comboIncludes: ["Coca-Cola 500ml"],
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Coca-Cola 500ml bottle."
  },
  {
    id: "fanta-500ml",
    category: "drinks-and-extras",
    name: "Fanta — 500ml",
    price: 1.00,
    description: "Chilled Fanta Orange 500ml bottle.",
    comboIncludes: ["Fanta Orange 500ml"],
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Fanta Orange 500ml bottle."
  },
  {
    id: "sprite-500ml",
    category: "drinks-and-extras",
    name: "Sprite — 500ml",
    price: 1.00,
    description: "Chilled Sprite 500ml bottle.",
    comboIncludes: ["Sprite 500ml"],
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80",
    details: "Chilled Sprite 500ml bottle."
  },
  {
    id: "fruit-yogurt",
    category: "drinks-and-extras",
    name: "Fruit Yogurt",
    price: 3.00,
    description: "Chilled, creamy fruit yogurt.",
    comboIncludes: ["Chilled Fruit Yogurt"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Fruit-Yogurt.webp",
    details: "Chilled, creamy fruit yogurt drink."
  },
  {
    id: "aloe-vera",
    category: "drinks-and-extras",
    name: "Aloe Vera Drink",
    price: 3.00,
    description: "Refreshing Aloe Vera drink with natural pulp.",
    comboIncludes: ["Refreshing Aloe Vera"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Aloe-Vera-Drink.webp",
    details: "Refreshing Aloe Vera drink with natural pulp."
  },
  {
    id: "minute-maid-delight",
    category: "drinks-and-extras",
    name: "Minute Maid",
    price: 1.00,
    description: "Refreshing Minute Maid fruit juice.",
    comboIncludes: ["Minute Maid Fruit Drink"],
    image: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Majority%20App/Bamboo-Chicken-Minute-Maid.webp",
    details: "Refreshing Minute Maid fruit juice."
  }
];

// Active State Managers
let currentCategory = "dumplings";
let searchQuery = "";
let cart = JSON.parse(localStorage.getItem("bamboo_cart")) || [];
// Clean obsolete/removed items from cart if any exist
if (Array.isArray(cart)) {
  const validIds = new Set(MENU_DATA.map(m => m.id));
  cart = cart.filter(item => {
    const baseId = item.id ? item.id.split('-')[0] : '';
    return validIds.has(item.id) || MENU_DATA.some(m => m.id === baseId);
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
const searchInputMenu = document.getElementById("menu-search-input");
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
  if (typeof window.renderPromotionalFeed === "function") {
    window.renderPromotionalFeed();
  }
  if (typeof window.renderAccountPanel === "function") {
    window.renderAccountPanel();
  }
  syncCartUI();
  setupEventListeners();

  // Sync active order bottom nav badge on startup
  const activeOrderRefs = (typeof window.getStoredActiveOrderReferences === "function") 
    ? window.getStoredActiveOrderReferences() 
    : (localStorage.getItem("bamboo_active_order_id") ? [localStorage.getItem("bamboo_active_order_id")] : []);
  const ordersBadge = document.getElementById("bottom-orders-badge");
  if (ordersBadge) {
    ordersBadge.style.display = activeOrderRefs.length > 0 ? "block" : "none";
  }
  
  // Proactively restore active orders and verify status with authoritative backend
  if (typeof window.restoreActiveOrdersOnStartup === "function") {
    window.restoreActiveOrdersOnStartup();
  }

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
  const allCategories = [
    { id: "dumplings", name: "Dumplings", icon: "🥟" },
    { id: "signature-meals", name: "Signature Meals", icon: "⭐" },
    { id: "chicken-meals", name: "Chicken Meals", icon: "🍗" },
    { id: "wraps-and-burgers", name: "Wraps & Burgers", icon: "🍔" },
    { id: "rice-and-sides", name: "Rice & Sides", icon: "🍟" },
    { id: "drinks-and-extras", name: "Drinks & Extras", icon: "🥤" },
    { id: "all", name: "All", icon: "✨" }
  ];

  // Filter out any empty categories from navigation
  const categories = allCategories.filter(cat => {
    if (cat.id === "all") return MENU_DATA.length > 0;
    if (cat.id === "dumplings") {
      return MENU_DATA.some(i => i.category === "dumplings" || i.category === "cooked-dumplings" || i.category === "finish-at-home");
    }
    if (cat.id === "chicken-meals") {
      return MENU_DATA.some(i => i.category === "chicken-meals" || i.category === "chicken-and-more");
    }
    if (cat.id === "drinks-and-extras") {
      return MENU_DATA.some(i => i.category === "drinks-and-extras" || i.category === "drinks");
    }
    return MENU_DATA.some(i => i.category === cat.id);
  });

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

// Main Rendering Logic (Compact Horizontal Select-Inspired Cards)
function renderMenu() {
  // Clear Grid
  menuGrid.innerHTML = "";

  // Filter Data by availability, search query and category
  const query = (searchQuery || "").trim().toLowerCase();
  const filteredData = MENU_DATA.filter(item => {
    // Hide out-of-stock items if ingredients are 0
    if (unavailableMenuItems.includes(item.name.toLowerCase())) {
      return false;
    }

    // Search query check (matches name, description, category, details)
    if (query !== "") {
      const matchName = item.name.toLowerCase().includes(query);
      const matchDesc = (item.description || "").toLowerCase().includes(query);
      const matchCat = (item.category || "").toLowerCase().includes(query);
      const matchDetails = (item.details || "").toLowerCase().includes(query);
      if (!matchName && !matchDesc && !matchCat && !matchDetails) {
        return false;
      }
    }

    // Category check
    if (currentCategory === "all") return true;
    if (currentCategory === "dumplings") {
      return item.category === "dumplings" || item.category === "cooked-dumplings" || item.category === "finish-at-home";
    }
    if (currentCategory === "chicken-meals") {
      return item.category === "chicken-meals" || item.category === "chicken-and-more";
    }
    if (currentCategory === "drinks-and-extras") {
      return item.category === "drinks-and-extras" || item.category === "drinks";
    }
    return item.category === currentCategory;
  });

  // Handle Empty State
  if (emptyState) {
    emptyState.style.display = filteredData.length === 0 ? "block" : "none";
  }

  // Generate and Append Compact Horizontal Cards
  filteredData.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("menu-card");
    card.setAttribute("id", `menu-card-${item.id}`);

    card.innerHTML = `
      <div class="menu-card-image-wrapper">
        <div class="image-placeholder"></div>
        <img class="menu-card-image" src="${item.image}" alt="${item.name}" referrerPolicy="no-referrer" onload="this.previousElementSibling.style.display='none'">
      </div>
      <div class="menu-card-content">
        <div class="menu-card-info">
          <h4>${item.name}</h4>
          <p class="menu-card-description">${item.description}</p>
          ${item.freeBadge ? `<div class="free-item-badge">${item.freeBadge}</div>` : ''}
        </div>
        <div class="menu-card-bottom-row">
          <span class="menu-card-price" id="card-badge-price-${item.id}">$${item.price.toFixed(2)}${item.unit ? ` <span class="card-price-unit" style="font-size: 0.72rem; font-weight: 600; color: #7A6871; margin-left: 2px;">${item.unit}</span>` : ''}</span>
          <div class="menu-card-actions">
            <div class="card-qty-selector">
              <button type="button" class="card-qty-btn" onclick="event.stopPropagation(); changeCardQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
              <span class="card-qty-val" id="card-qty-val-${item.id}">1</span>
              <button type="button" class="card-qty-btn" onclick="event.stopPropagation(); changeCardQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="btn-card-add" onclick="event.stopPropagation(); addCardToCart('${item.id}')" aria-label="Add to cart">
              <span class="btn-card-add-plus">+</span>
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      // Prevent modal opening when clicking interactive elements
      if (e.target.closest(".card-qty-selector") || e.target.closest(".btn-card-add") || e.target.closest(".btn-card-primary-yellow") || e.target.closest(".card-quick-options") || e.target.tagName === "SELECT" || e.target.tagName === "INPUT" || e.target.tagName === "OPTION") {
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
  if (!item) return 3.00;
  
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

// Backward compatibility placeholder
window.changeSadzaMeatChoice = function() {};

// Search Logic
function handleSearch(query) {
  searchQuery = query;
  
  // Sync in-catalogue menu search input if exists
  const menuInput = document.getElementById("menu-search-input");
  if (menuInput && menuInput.value !== query) {
    menuInput.value = query;
  }
  const menuClearBtn = document.getElementById("menu-search-clear-btn");
  if (menuClearBtn) {
    menuClearBtn.style.display = query && query.trim() !== "" ? "flex" : "none";
  }

  // Fallback sync for header input if present
  const headerInput = document.getElementById("search-input-header");
  if (headerInput && headerInput.value !== query) {
    headerInput.value = query;
  }

  if (query && query.trim() !== "") {
    if (typeof setActiveBottomNav === "function") {
      const menuNavBtn = document.querySelector('.bottom-nav-item[data-page="menu"]');
      setActiveBottomNav(menuNavBtn, 'menu', false);
    }
  }
  renderMenu();
}

window.toggleHeaderSearch = function() {
  const menuInput = document.getElementById("menu-search-input");
  if (typeof setActiveBottomNav === "function") {
    const menuNavBtn = document.querySelector('.bottom-nav-item[data-page="menu"]');
    setActiveBottomNav(menuNavBtn, 'menu', true);
  }
  if (menuInput) {
    setTimeout(() => menuInput.focus(), 150);
  }
};

window.closeHeaderSearch = function() {
  handleSearch("");
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
window.toggleMobileNavMenuApp = window.toggleMobileNavMenu;

// Setup Event Listeners
function setupEventListeners() {
  // Close mobile dropdown on outside tap
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("mobile-nav-dropdown");
    const hamburgerBtn = document.getElementById("hamburger-menu-btn");
    if (dropdown && dropdown.classList.contains("active")) {
      if (!dropdown.contains(e.target) && !hamburgerBtn?.contains(e.target)) {
        dropdown.classList.remove("active");
        if (hamburgerBtn) hamburgerBtn.classList.remove("active");
      }
    }
  });

  // Search Box in Menu tab
  const menuSearchInputEl = document.getElementById("menu-search-input");
  if (menuSearchInputEl) {
    menuSearchInputEl.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
  }

  // Search Box in header (fallback)
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
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener("click", () => {
      handleSearch("");
      handleCategoryChange("all");
    });
  }

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
    modalFloatingPriceEl.innerHTML = `$${product.price.toFixed(2)}${product.unit ? ` <span style="font-size: 0.8rem; font-weight: 600; opacity: 0.85; margin-left: 3px;">${product.unit}</span>` : ''}`;
  }
  if (modalCategoryEl) {
    modalCategoryEl.textContent = getCategoryPill(product.category, product);
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

function getCategoryPill(category, item) {
  if (item && item.id && item.id.includes("finish-at-home")) return "📦 FINISH-AT-HOME";
  if (item && item.id && item.id.includes("dumpling")) return "🥟 COOKED DUMPLINGS";
  switch (category) {
    case "dumplings": return "🥟 DUMPLINGS";
    case "cooked-dumplings": return "🥟 COOKED DUMPLINGS";
    case "finish-at-home": return "📦 FINISH-AT-HOME";
    case "signature-meals": return "⭐ SIGNATURE MEALS";
    case "chicken-meals":
    case "chicken-and-more": return "🍗 CHICKEN MEALS";
    case "wraps-and-burgers": return "🍔 WRAPS & BURGERS";
    case "rice-and-sides": return "🍟 RICE & SIDES";
    case "drinks-and-extras":
    case "drinks": return "🥤 DRINKS & EXTRAS";
    default: return `✨ ${category.toUpperCase().replace(/-/g, " ")}`;
  }
}

function getItemEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("dumpling")) return "🥟";
  if (n.includes("nugget")) return "🍗";
  if (n.includes("sauce") || n.includes("soy")) return "🍶";
  if (n.includes("milk tea")) return "🧋";
  if (n.includes("ice tea") || n.includes("tea")) return "🧋";
  if (n.includes("bamboo chicken") || n.includes("bamboo stick")) return "🍢";
  if (n.includes("bamboo pie") || n.includes("pie")) return "🥟";
  if (n.includes("burger")) return "🍔";
  if (n.includes("wrap") || n.includes("shawarma")) return "🌯";
  if (n.includes("fillet") || n.includes("piece") || n.includes("chicken") || n.includes("bucket") || n.includes("riblet")) return "🍗";
  if (n.includes("chips") || n.includes("fries")) return "🍟";
  if (n.includes("water")) return "💧";
  if (n.includes("drink") || n.includes("cola") || n.includes("fanta") || n.includes("sprite") || n.includes("yogurt") || n.includes("juice")) return "🥤";
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
  
  // Highlight Cart tab on bottom nav
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(item => item.classList.remove('active'));
  const cartTab = document.querySelector('.bottom-nav-item[data-page="cart"]');
  if (cartTab) cartTab.classList.add('active');
};

window.closeCart = function() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
  // Restore body scrolling only if detail modal is also closed
  if (!detailModal.classList.contains("active")) {
    document.body.style.overflow = "";
  }
  
  // Revert bottom nav active state to current landing view
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(item => item.classList.remove('active'));
  const activePage = (typeof lastActivePage !== "undefined" && lastActivePage) ? lastActivePage : "home";
  const targetTab = document.querySelector(`.bottom-nav-item[data-page="${activePage}"]`);
  if (targetTab) targetTab.classList.add('active');
};

window.closeCartAndExploreMenu = function() {
  window.closeCart();
  if (typeof setActiveBottomNav === "function") {
    const menuTab = document.querySelector('.bottom-nav-item[data-page="menu"]');
    setActiveBottomNav(menuTab, 'menu', true);
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
  { id: "roadport", name: "Roadport", fee: 1.00, keywords: ["roadport", "5th road", "fifth road", "road port"] },
  { id: "6th_nelson_mandela", name: "6th Avenue & Nelson Mandela Avenue", fee: 1.00, keywords: ["6th avenue & nelson mandela", "6th ave & nelson mandela", "6th avenue and nelson mandela", "6th avenue", "6th ave", "nelson mandela avenue", "nelson mandela ave"] },
  { id: "cbd", name: "Harare CBD", fee: 2.00, keywords: ["cbd", "central", "first street", "samora", "jason moyo", "kwame", "robert mugabe", "angwa", "innez", "chinhoyi", "leopold takawira", "speke", "rotton row", "fourth street", "fifth street"] },
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

  // Rule: Empty-cart state
  if (cart.length === 0) {
    return {
      foodSubtotal: 0.00,
      deliveryFee: 0.00,
      deliveryFeeLabel: "$0.00",
      grandTotal: 0.00,
      isDelivery,
      isPickup,
      isCash: true,
      paymentMethod: currentPaymentMethod || "Cash",
      paymentMethodDisplay: "Cash",
      totalLabel: "TOTAL",
      areaName: "",
      locationSelected: false
    };
  }

  let deliveryFee = 0.00;
  let deliveryFeeLabel = "$0.00";
  let areaName = "Harare CBD";
  let locationSelected = false;

  if (isPickup) {
    deliveryFee = 0.00;
    deliveryFeeLabel = "FREE (Pickup)";
    areaName = "Roadport Collection";
    locationSelected = true;
  } else {
    // Delivery mode:
    const areaSelect = document.getElementById("checkout-delivery-area");
    const addressInput = document.getElementById("checkout-address");
    const isManuallySelected = areaSelect && areaSelect.dataset.userManuallySelected === "true";
    const hasAddress = Boolean(addressInput && addressInput.value.trim());
    const hasSavedLocation = Boolean(localStorage.getItem("bamboo_saved_location"));

    // Location is considered selected if the user manually selected an area, entered an address,
    // has a saved location, or is navigating Step 2 / Step 3 of checkout
    if (isManuallySelected || hasAddress || hasSavedLocation || currentCheckoutStep >= 2) {
      locationSelected = true;
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
    } else {
      // In cart drawer review before checkout details:
      locationSelected = false;
      deliveryFee = 0.00;
      deliveryFeeLabel = "Calculated at checkout";
    }
  }

  const grandTotal = foodSubtotal + deliveryFee;
  const paymentMethod = currentPaymentMethod || "Cash";
  const isCash = String(paymentMethod).toLowerCase() === "cash" || String(paymentMethod).toLowerCase().includes("cod") || String(paymentMethod).toLowerCase() === "cash on delivery";

  let totalLabel = "TOTAL TO PAY";
  if (!isPickup && !locationSelected) {
    totalLabel = "Total (excl. delivery):";
  } else if (!isCash) {
    totalLabel = "TOTAL";
  }

  const paymentMethodDisplay = isCash 
    ? (isPickup ? "Cash upon Collection" : "Cash on Delivery") 
    : paymentMethod;

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
    areaName,
    locationSelected
  };
};

let tempSelectedDeliveryAreaId = "cbd";

window.openDeliveryAreaModal = function() {
  const areaSelect = document.getElementById("checkout-delivery-area");
  tempSelectedDeliveryAreaId = areaSelect ? areaSelect.value : (selectedDeliveryAreaId || "cbd");
  renderDeliveryAreaModalOptions();
  const modal = document.getElementById("delivery-area-modal");
  if (modal) {
    modal.style.display = "flex";
  }
};

window.closeDeliveryAreaModal = function() {
  const modal = document.getElementById("delivery-area-modal");
  if (modal) {
    modal.style.display = "none";
  }
};

window.handleDeliveryAreaOverlayClick = function(event) {
  if (event && event.target && event.target.id === "delivery-area-modal") {
    closeDeliveryAreaModal();
  }
};

window.selectDeliveryAreaOption = function(areaId) {
  tempSelectedDeliveryAreaId = areaId;
  renderDeliveryAreaModalOptions();
};

window.confirmDeliveryAreaSelection = function() {
  const areaSelect = document.getElementById("checkout-delivery-area");
  if (areaSelect) {
    areaSelect.value = tempSelectedDeliveryAreaId;
    areaSelect.dataset.userManuallySelected = "true";
  }
  selectedDeliveryAreaId = tempSelectedDeliveryAreaId;
  closeDeliveryAreaModal();
  updateCheckoutSummaries();
};

window.renderDeliveryAreaModalOptions = function() {
  const container = document.getElementById("delivery-area-options-list");
  if (!container || !window.DELIVERY_AREAS) return;

  container.innerHTML = window.DELIVERY_AREAS.map(area => {
    const isSelected = (area.id === tempSelectedDeliveryAreaId);
    const feeText = isFreeDeliveryPromoActive ? "FREE" : `$${area.fee.toFixed(2)}`;
    return `
      <div class="delivery-area-option-card ${isSelected ? 'selected' : ''}" 
           onclick="selectDeliveryAreaOption('${area.id}')" 
           role="radio" 
           aria-checked="${isSelected}">
        <div class="area-option-radio-dot ${isSelected ? 'selected' : ''}" aria-hidden="true">
          ${isSelected ? '<span class="radio-inner-dot"></span>' : ''}
        </div>
        <div class="area-option-text">
          <span class="area-option-name">${escapeHTML(area.name)}</span>
        </div>
        <div class="area-option-fee-badge ${isSelected ? 'selected' : ''}">
          ${feeText}
        </div>
      </div>
    `;
  }).join("");
};

window.onDeliveryAreaChange = function() {
  const areaSelect = document.getElementById("checkout-delivery-area");
  if (areaSelect) {
    areaSelect.dataset.userManuallySelected = "true";
    selectedDeliveryAreaId = areaSelect.value;
    tempSelectedDeliveryAreaId = areaSelect.value;
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
        tempSelectedDeliveryAreaId = autoMatched.id;
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
  // Final checkout step supports strictly EcoCash & Cash
  if (method !== "EcoCash" && method !== "Cash") {
    method = "Cash";
  }
  currentPaymentMethod = method;
  
  const paymentMethods = ["EcoCash", "Cash"];
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
  const cartItemsFooter = document.getElementById("cart-items-footer");
  const totalQuantity = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

  // Step 1 Elements
  const step1Subtotal = document.getElementById("step1-subtotal");
  const step1Delivery = document.getElementById("step1-delivery");
  const step1DeliveryLabel = document.getElementById("step1-delivery-label");
  const step1Total = document.getElementById("step1-total");
  const step1TotalLabel = document.getElementById("step1-total-label");

  if (step1Subtotal) step1Subtotal.textContent = `$${breakdown.foodSubtotal.toFixed(2)}`;
  if (step1Delivery) {
    if (cart.length === 0) {
      step1Delivery.textContent = "$0.00";
    } else if (breakdown.isPickup) {
      step1Delivery.textContent = "FREE (Pickup)";
    } else if (breakdown.locationSelected) {
      step1Delivery.textContent = breakdown.deliveryFeeLabel;
    } else {
      step1Delivery.textContent = "Calculated in Step 2";
    }
  }
  if (step1DeliveryLabel) step1DeliveryLabel.textContent = breakdown.isPickup ? "Collection" : "Delivery fee";
  if (step1Total) step1Total.textContent = `$${breakdown.grandTotal.toFixed(2)}`;
  if (step1TotalLabel) step1TotalLabel.textContent = breakdown.totalLabel;

  // Step 2 Elements
  const step2DeliveryFeeVal = document.getElementById("step2-delivery-fee-val");
  if (step2DeliveryFeeVal) {
    if (breakdown.isDelivery) {
      if (breakdown.locationSelected) {
        step2DeliveryFeeVal.textContent = `${breakdown.deliveryFeeLabel} (${breakdown.areaName})`;
      } else {
        step2DeliveryFeeVal.textContent = "Select area above to calculate fee";
      }
    } else {
      step2DeliveryFeeVal.textContent = "PICKUP (No delivery fee)";
    }
  }

  // Step 2 Trigger Card Elements
  const triggerAreaName = document.getElementById("delivery-trigger-area-name");
  const triggerFeeBadge = document.getElementById("delivery-trigger-fee-badge");
  if (triggerAreaName) {
    triggerAreaName.textContent = breakdown.areaName;
  }
  if (triggerFeeBadge) {
    triggerFeeBadge.textContent = breakdown.isPickup ? "FREE (Pickup)" : `${breakdown.deliveryFeeLabel} Delivery Fee`;
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
  if (step3DeliveryLabel) step3DeliveryLabel.textContent = breakdown.isPickup ? "Collection" : "Delivery fee";
  if (step3Total) step3Total.textContent = `$${breakdown.grandTotal.toFixed(2)}`;
  if (step3TotalLabel) step3TotalLabel.textContent = breakdown.totalLabel;
  if (step3PaymentMethodDisplay) step3PaymentMethodDisplay.textContent = breakdown.paymentMethodDisplay;
  if (btnSubmitOrderText) {
    btnSubmitOrderText.textContent = breakdown.isCash 
      ? (breakdown.isPickup ? `Place Order • Pay $${breakdown.grandTotal.toFixed(2)} on Pickup` : `Place Order • Pay $${breakdown.grandTotal.toFixed(2)} on Delivery`) 
      : `Place Order • $${breakdown.grandTotal.toFixed(2)}`;
  }

  // Cart Sidebar Elements
  const cartSummaryQty = document.getElementById("cart-summary-qty");
  const cartSummarySubtotal = document.getElementById("cart-summary-subtotal");
  const cartSummaryDelivery = document.getElementById("cart-summary-delivery");
  const cartSummaryGrand = document.getElementById("cart-summary-grand");
  const cartGrandLabel = document.getElementById("cart-grand-label");

  if (cart.length === 0) {
    if (cartItemsFooter) cartItemsFooter.style.display = "none";
    if (cartSummaryQty) cartSummaryQty.textContent = "0";
    if (cartSummarySubtotal) cartSummarySubtotal.textContent = "$0.00";
    if (cartSummaryDelivery) cartSummaryDelivery.textContent = "$0.00";
    if (cartSummaryGrand) cartSummaryGrand.textContent = "$0.00";
  } else {
    if (cartItemsFooter) cartItemsFooter.style.display = "flex";
    if (cartSummaryQty) cartSummaryQty.textContent = totalQuantity;
    if (cartSummarySubtotal) cartSummarySubtotal.textContent = `$${breakdown.foodSubtotal.toFixed(2)}`;
    if (cartSummaryDelivery) cartSummaryDelivery.textContent = breakdown.deliveryFeeLabel;
    if (cartSummaryGrand) cartSummaryGrand.textContent = `$${breakdown.grandTotal.toFixed(2)}`;
    if (cartGrandLabel) cartGrandLabel.textContent = breakdown.totalLabel;
  }
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
  if (typeof window.openDeliveryAreaModal === "function") {
    window.openDeliveryAreaModal();
  }
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

    window.saveActiveOrderReference(orderId);
    try {
      let history = JSON.parse(localStorage.getItem("bamboo_order_history") || "[]");
      if (!Array.isArray(history)) history = [];
      if (!history.includes(orderId)) {
        history.unshift(orderId);
        localStorage.setItem("bamboo_order_history", JSON.stringify(history.slice(0, 30)));
      }
    } catch(e) {}

    // Update bottom nav orders badge dot immediately
    const ordersBadge = document.getElementById("bottom-orders-badge");
    if (ordersBadge) ordersBadge.style.display = "block";

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
  window.saveActiveOrderReference(orderId);

  const modal = document.getElementById("order-success-modal");
  const orderIdLabel = document.getElementById("success-modal-order-id");
  const prepTimeLabel = document.getElementById("success-modal-prep-time");

  if (orderIdLabel) orderIdLabel.textContent = orderId;
  if (prepTimeLabel) prepTimeLabel.textContent = "18 minutes";

  // Sync active order bottom nav badge
  const ordersBadge = document.getElementById("bottom-orders-badge");
  if (ordersBadge) {
    ordersBadge.style.display = "block";
  }

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

window.handleTrackOrderFromSuccess = function() {
  const modal = document.getElementById("order-success-modal");
  if (modal) modal.style.display = "none";
  const ordersTab = document.querySelector('.bottom-nav-item[data-page="orders"]');
  if (typeof setActiveBottomNav === "function") {
    setActiveBottomNav(ordersTab, 'orders', true);
  }
  const orderIdToTrack = latestSubmittedOrderId || localStorage.getItem("bamboo_active_order_id");
  if (orderIdToTrack && typeof window.openOrderDetailView === "function") {
    window.openOrderDetailView(orderIdToTrack, true);
  }
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
  
  // Header Cart Badge
  const headerCartBadge = document.getElementById("header-cart-badge");
  if (headerCartBadge) {
    headerCartBadge.textContent = totalQuantity;
  }

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
    floatingCartBtn.style.display = "none";
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

  // Update hero bucket badge
  const heroBucketBadge = document.getElementById("hero-bucket-badge");
  if (heroBucketBadge) {
    heroBucketBadge.textContent = totalQuantity;
    heroBucketBadge.style.display = totalQuantity > 0 ? "inline-block" : "none";
  }

  // Sync bottom nav orders dot indicator with stored active order
  const bottomOrdersBadge = document.getElementById("bottom-orders-badge");
  if (bottomOrdersBadge) {
    const hasActiveOrder = Boolean(localStorage.getItem("bamboo_active_order_id"));
    bottomOrdersBadge.style.display = hasActiveOrder ? "block" : "none";
  }

  // Clear sidebar content
  cartSidebarBodyInner.innerHTML = "";

  if (cart.length === 0) {
    // Empty Cart State
    cartSidebarBodyInner.innerHTML = `
      <div class="cart-empty-state" style="text-align: center; padding: 48px 20px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px;">
        <span class="cart-empty-icon" style="font-size: 3.5rem;">🛒</span>
        <h4 style="font-family: var(--font-display); font-weight: 800; font-size: 1.3rem; color: var(--color-dark); margin: 0;">Your bucket is empty</h4>
        <p style="font-size: 0.9rem; color: var(--color-gray); line-height: 1.5; margin: 0; max-width: 280px;">
          You have no items in your cart. Browse our menu and add your favourite freshly prepared meals!
        </p>
        <button type="button" class="btn-wizard-primary" onclick="closeCartAndExploreMenu()" style="margin-top: 10px; width: 100%; max-width: 240px; justify-content: center; padding: 12px 20px; font-size: 0.95rem; font-weight: 800; border-radius: 12px; box-shadow: 0 4px 12px rgba(255,90,0,0.25);">
          <span>EXPLORE MENU</span>
        </button>
      </div>
    `;
    
    const cartItemsFooter = document.getElementById("cart-items-footer");
    if (cartItemsFooter) cartItemsFooter.style.display = "none";
    
    if (cartSummaryQty) cartSummaryQty.textContent = "0";
    if (cartSummarySubtotal) cartSummarySubtotal.textContent = "$0.00";
    const cartSummaryDelivery = document.getElementById("cart-summary-delivery");
    if (cartSummaryDelivery) cartSummaryDelivery.textContent = "$0.00";
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
            <span class="cart-item-unit-price">$${item.price.toFixed(2)}${item.unit ? ` ${item.unit}` : ' each'}</span>
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
  const headerCartBadge = document.getElementById("header-cart-badge");
  if (headerCartBadge) {
    headerCartBadge.classList.remove("bounce");
    void headerCartBadge.offsetWidth;
    headerCartBadge.classList.add("bounce");
  }

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
  const spans = [
    document.getElementById(`card-qty-val-${itemId}`),
    document.getElementById(`card-qty-val-home-${itemId}`)
  ].filter(Boolean);
  spans.forEach(qtySpan => {
    let currentVal = parseInt(qtySpan.textContent) || 1;
    currentVal += delta;
    if (currentVal < 1) currentVal = 1;
    qtySpan.textContent = currentVal;
  });
};

window.addCardToCart = function(itemId) {
  const qtySpan = document.getElementById(`card-qty-val-${itemId}`) || document.getElementById(`card-qty-val-home-${itemId}`);
  const qty = qtySpan ? (parseInt(qtySpan.textContent) || 1) : 1;

  // Find product details
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  // Add item to cart state
  addToCart(itemId, qty);
  
  // Reset card quantity values to 1 for next tap
  const spans = [
    document.getElementById(`card-qty-val-${itemId}`),
    document.getElementById(`card-qty-val-home-${itemId}`)
  ].filter(Boolean);
  spans.forEach(s => { s.textContent = "1"; });
  
  // Trigger modern premium flying visual animation
  animateFlyToCart(itemId);
};

window.animateFlyToCart = function(itemId) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const card = document.getElementById(`home-card-${itemId}`) || document.getElementById(`menu-card-${itemId}`);
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

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   BAMBOO CHICKEN — COMPLETE ORDERS MODULE & LIVE DELIVERY TRACKING
   Dual-Worker Architecture · D1-Backed Orders · In-App Leaflet GPS Map
   ========================================================================== */

if (!window._manuallyTrackedOrderIds) {
  window._manuallyTrackedOrderIds = new Set();
}

window.activeOrdersTab = "active"; // "active" or "history"
window.currentSelectedOrderId = null;
window.cachedActiveOrders = [];
window.cachedHistoryOrders = [];
window._isOrdersFetching = false;
window._currentTrackingOrder = null;
window._currentTrackingJob = null;

let ordersListPollingTimer = null;
let orderDetailPollingTimer = null;
let trackingLeafletMapInstance = null;

const ROADPORT_KITCHEN_COORDS = [-17.8292, 31.0522]; // Harare CBD Roadport Terminal
window.ROADPORT_KITCHEN_COORDS = ROADPORT_KITCHEN_COORDS;

let trackingMapMarkers = {
  kitchen: null,
  dest: null,
  rider: null,
  routeLine: null
};

// --- Durable Browser Storage for Active Order Recovery ---
window.cleanOrderReference = function(ref) {
  if (ref === null || ref === undefined) return "";
  return String(ref).replace(/^(BC)?[-#\s]*/i, "").trim().toLowerCase();
};

window.getStoredActiveOrderReferences = function() {
  const refs = new Set();
  try {
    const rawList = localStorage.getItem("bamboo_active_order_refs");
    if (rawList) {
      const list = JSON.parse(rawList);
      if (Array.isArray(list)) {
        list.forEach(r => {
          if (r && String(r).trim()) refs.add(String(r).trim());
        });
      }
    } else {
      const single = localStorage.getItem("bamboo_active_order_id");
      if (single && single.trim()) {
        refs.add(single.trim());
      }
    }
  } catch (e) {
    console.warn("Error reading stored active order references:", e);
  }
  return Array.from(refs);
};

window.saveActiveOrderReference = function(orderRef) {
  if (!orderRef) return;
  const cleanRef = String(orderRef).trim();
  try {
    const existing = window.getStoredActiveOrderReferences();
    const cleanLower = window.cleanOrderReference(cleanRef);
    const alreadyPresent = existing.some(r => window.cleanOrderReference(r) === cleanLower);
    if (!alreadyPresent) {
      existing.unshift(cleanRef);
    }
    localStorage.setItem("bamboo_active_order_refs", JSON.stringify(existing));
    localStorage.setItem("bamboo_active_order_id", cleanRef);
  } catch (e) {
    console.warn("Error saving active order reference:", e);
  }
};

window.removeActiveOrderReference = function(orderRef) {
  if (!orderRef) return;
  const clean = window.cleanOrderReference(orderRef);
  try {
    const existing = window.getStoredActiveOrderReferences();
    const remaining = existing.filter(r => window.cleanOrderReference(r) !== clean);
    localStorage.setItem("bamboo_active_order_refs", JSON.stringify(remaining));
    if (remaining.length > 0) {
      localStorage.setItem("bamboo_active_order_id", remaining[0]);
    } else {
      localStorage.removeItem("bamboo_active_order_id");
    }
  } catch (e) {
    console.warn("Error removing active order reference:", e);
  }
};

window.restoreActiveOrdersOnStartup = async function() {
  const activeRefs = window.getStoredActiveOrderReferences();
  const customerPhone = (localStorage.getItem("bamboo_customer_phone") || "").trim();
  
  if (activeRefs.length === 0 && !customerPhone) return;

  try {
    await window.loadAndRenderOrdersView();
  } catch (err) {
    console.warn("Background order recovery encountered temporary issue (references preserved):", err);
  }
};

// --- 1. Bamboo Chicken Orders Worker Service (Authoritative Orders & D1 Data) ---
const BambooOrdersService = {
  baseUrl: "https://bamboo-orders-api.warstreett.workers.dev",

  async fetchOrders() {
    const res = await fetch(`${this.baseUrl}/orders?_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Bamboo Orders Worker returned HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Orders payload from backend must be an array");
    return data.map(raw => this.normalizeOrder(raw));
  },

  async fetchOrderById(id) {
    if (!id) return null;
    const cleanId = window.cleanOrderReference(id);
    const orders = await this.fetchOrders();
    return orders.find(o => window.cleanOrderReference(o.id) === cleanId) || null;
  },

  async lookupOrderByReference(query) {
    if (!query) return null;
    const cleanRef = window.cleanOrderReference(query);
    const cleanDigits = String(query).replace(/\D/g, "");
    const orders = await this.fetchOrders();

    return orders.find(o => {
      const oId = window.cleanOrderReference(o.id);
      if (oId === cleanRef) return true;
      if (cleanDigits.length >= 7 && o.phone) {
        const oPhone = String(o.phone).replace(/\D/g, "");
        if (oPhone.includes(cleanDigits) || cleanDigits.includes(oPhone)) return true;
      }
      return false;
    }) || null;
  },

  normalizeOrder(raw) {
    let parsedItems = [];
    try {
      if (typeof raw.items === "string") parsedItems = JSON.parse(raw.items);
      else if (Array.isArray(raw.items)) parsedItems = raw.items;
    } catch (e) {
      parsedItems = [];
    }

    const isDelivery = String(raw.notes || "").toLowerCase().includes("delivery") ||
                       String(raw.type || "").toLowerCase().includes("delivery");
    const rawStatus = String(raw.order_status || raw.status || "new").toLowerCase().trim();

    return {
      id: raw.id,
      orderReference: `BC-${raw.id}`,
      customerName: raw.customer_name || "Customer",
      phone: raw.phone || "",
      items: Array.isArray(parsedItems) ? parsedItems : [],
      total: raw.total !== undefined ? parseFloat(raw.total) : 0,
      notes: raw.notes || "",
      isDelivery: isDelivery,
      paymentMethod: raw.payment_method || "Cash on Delivery",
      paymentStatus: raw.payment_status || "pending",
      orderStatus: rawStatus,
      createdAt: raw.created_at || "",
      deliveryJobId: raw.delivery_job_id || null,
      riderName: raw.rider_name || raw.riderName || (raw.rider && raw.rider.name) || null,
      riderPhone: raw.rider_phone || raw.riderPhone || raw.rider_contact || (raw.rider && raw.rider.phone) || null,
      riderId: raw.rider_id || raw.riderId || (raw.rider && raw.rider.id) || null,
      customerLat: (raw.customer_lat !== undefined && raw.customer_lat !== null) ? parseFloat(raw.customer_lat) : null,
      customerLng: (raw.customer_lng !== undefined && raw.customer_lng !== null) ? parseFloat(raw.customer_lng) : null,
      raw: raw
    };
  }
};
window.BambooOrdersService = BambooOrdersService;

// --- 2. Shopystreet Riders Worker Service (Delivery Jobs & Live GPS Boundary) ---
const ShopystreetRidersService = {
  baseUrl: "https://shopystreet-delivery-api.warstreett.workers.dev",

  /**
   * Authoritative query for Shopystreet Delivery Job.
   * Secure integration boundary: attempts customer-authorized read.
   * If the route requires rider authentication (HTTP 401), preserves security
   * boundaries without exposing rider credentials, and cleanly reports boundary state.
   */
  async getDeliveryJob(deliveryJobId, orderId, orderRecord = null) {
    const orderRider = (orderRecord && (orderRecord.riderName || orderRecord.riderPhone)) ? {
      id: orderRecord.riderId || null,
      name: orderRecord.riderName || null,
      phone: orderRecord.riderPhone || null,
      vehicle: null
    } : null;

    if (!deliveryJobId) {
      return {
        hasDeliveryJob: false,
        deliveryJobId: null,
        deliveryStatus: "awaiting_dispatch",
        rider: orderRider,
        riderLocation: null,
        isGpsLive: false,
        isGpsStale: false,
        lastLocationUpdate: null,
        lastLocationTimestamp: null,
        authRequired: false,
        lastUpdatedText: "Awaiting Kitchen Dispatch",
        statusNote: "Order is in the kitchen queue. Bamboo cashier will dispatch to Shopystreet Riders once food is packed.",
        boundaryNote: "Awaiting delivery dispatch"
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/delivery-jobs/${encodeURIComponent(deliveryJobId)}?_t=${Date.now()}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });

      // 1. Secure boundary: The route requires rider credentials / API Key (HTTP 401)
      if (res.status === 401) {
        return {
          hasDeliveryJob: true,
          deliveryJobId: deliveryJobId,
          deliveryStatus: "rider_assigned",
          rider: orderRider, // Real data if available from order record, else null
          riderLocation: null,
          isGpsLive: false,
          isGpsStale: false,
          lastLocationUpdate: "Awaiting courier departure",
          lastLocationTimestamp: null,
          authRequired: true,
          lastUpdatedText: `Job #${deliveryJobId} Assigned`,
          boundaryNote: "Shopystreet route /api/delivery-jobs/:id requires authenticated credentials. Customer-safe read boundary maintained without exposing rider secrets.",
          statusNote: `Delivery Job #${deliveryJobId} active on Shopystreet network. Real-time GPS activates when courier starts delivery route.`
        };
      }

      if (!res.ok) {
        throw new Error(`Shopystreet Worker returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const job = json.job || json.data || json;

      const rawStatus = String(job.status || "rider_assigned").toLowerCase().trim();
      const hasLocation = job.location && job.location.lat !== undefined && job.location.lng !== undefined &&
                          !isNaN(parseFloat(job.location.lat)) && !isNaN(parseFloat(job.location.lng));

      let locTimestamp = null;
      let locText = "Awaiting movement";
      let isStale = false;

      if (hasLocation) {
        const rawTime = job.location.updated_at || job.location.timestamp;
        if (rawTime) {
          locTimestamp = new Date(rawTime).getTime();
          const ageMin = Math.round((Date.now() - locTimestamp) / 60000);
          if (ageMin > 5) {
            isStale = true;
            locText = `GPS updated ${ageMin}m ago`;
          } else {
            locText = `Live GPS (${new Date(locTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
          }
        } else {
          locText = "Live GPS";
        }
      }

      // Extract genuine rider identity from response model
      const rawRider = job.rider || job.courier || job.assigned_rider || job.driver;
      let parsedRider = null;
      if (rawRider && typeof rawRider === "object") {
        const rName = rawRider.name || rawRider.full_name || rawRider.rider_name || job.rider_name || null;
        const rPhone = rawRider.phone || rawRider.mobile || rawRider.contact_number || rawRider.phone_number || job.rider_phone || job.rider_mobile || null;
        if (rName || rPhone) {
          parsedRider = {
            id: rawRider.id || rawRider.rider_id || job.rider_id || null,
            name: rName,
            phone: rPhone,
            vehicle: rawRider.vehicle || rawRider.vehicle_type || job.rider_vehicle || null
          };
        }
      } else if (job.rider_name || job.rider_phone || job.rider_mobile) {
        parsedRider = {
          id: job.rider_id || null,
          name: job.rider_name || null,
          phone: job.rider_phone || job.rider_mobile || job.rider_contact || null,
          vehicle: job.rider_vehicle || null
        };
      }

      const finalRider = parsedRider || orderRider;

      return {
        hasDeliveryJob: true,
        deliveryJobId: job.id || deliveryJobId,
        deliveryStatus: rawStatus,
        rider: finalRider,
        riderLocation: hasLocation ? {
          lat: parseFloat(job.location.lat),
          lng: parseFloat(job.location.lng),
          timestamp: locTimestamp
        } : null,
        isGpsLive: hasLocation && !isStale,
        isGpsStale: isStale,
        lastLocationUpdate: locText,
        lastLocationTimestamp: locTimestamp,
        authRequired: false,
        lastUpdatedText: `Shopystreet: ${rawStatus.replace(/_/g, " ").toUpperCase()}`,
        boundaryNote: "Customer-safe delivery telemetry connected",
        statusNote: `Delivery Job #${deliveryJobId}: ${rawStatus.replace(/_/g, " ")}.`
      };

    } catch (err) {
      console.warn("Shopystreet Riders Service query error:", err);
      return {
        hasDeliveryJob: true,
        deliveryJobId: deliveryJobId,
        deliveryStatus: "rider_assigned",
        rider: orderRider,
        riderLocation: null,
        isGpsLive: false,
        isGpsStale: false,
        lastLocationUpdate: null,
        lastLocationTimestamp: null,
        authRequired: true,
        lastUpdatedText: `Job #${deliveryJobId} Assigned`,
        boundaryNote: "Customer-safe boundary active.",
        statusNote: `Dispatched to Shopystreet (Job #${deliveryJobId}). Live GPS telemetry activates on route.`
      };
    }
  }
};
window.ShopystreetRidersService = ShopystreetRidersService;

// --- 3. Dual Status Streams & 10-Milestone Unified Timeline Resolver ---

function getOrderStatusMeta(rawStatus) {
  const norm = String(rawStatus || "new").toLowerCase().trim();
  switch (norm) {
    case "preparing":
      return {
      key: "preparing",
      label: "Cooking on Grill",
      badgeClass: "status-badge-preparing",
      dotClass: "order-status-dot"
    };
    case "ready":
      return {
      key: "ready",
      label: "Ready / Dispatched",
      badgeClass: "status-badge-ready",
      dotClass: "order-status-dot"
    };
    case "completed":
      return {
      key: "completed",
      label: "Order Completed",
      badgeClass: "status-badge-completed",
      dotClass: "order-status-dot"
    };
    case "cancelled":
      return {
      key: "cancelled",
      label: "Cancelled",
      badgeClass: "status-badge-cancelled",
      dotClass: "order-status-dot"
    };
    case "new":
    case "pending":
    default:
      return {
      key: "new",
      label: "Received & Queued",
      badgeClass: "status-badge-new",
      dotClass: "order-status-dot"
    };
  }
}

/**
 * Combines Source A (Bamboo Orders Worker + D1) and Source B (Shopystreet Riders Worker + D1)
 * into ONE customer-facing timeline while strictly keeping underlying records independent.
 *
 * Enforces critical product rules:
 * - Never infer that the kitchen finished preparing merely because a rider accepted the job.
 * - Never infer pickup merely because the rider reached the kitchen.
 * - Never infer delivery merely because the rider's GPS is near the destination.
 * - Map real statuses into customer-friendly labels without altering authoritative values.
 */
function resolveUnifiedTrackingTimeline(order, deliveryJob) {
  const oStatus = String(order.orderStatus || "new").toLowerCase().trim();
  const dStatus = deliveryJob ? String(deliveryJob.deliveryStatus || "").toLowerCase().trim() : "";
  const isDelivery = !!order.isDelivery;
  const isCancelled = oStatus === "cancelled" || dStatus === "cancelled";

  // --- Source A (Kitchen Stream) Details ---
  let kitchenLabel = "Received & In Queue";
  let kitchenSub = "Order placed into Bamboo kitchen queue at Roadport.";
  let kitchenBadgeClass = "status-badge-new";
  if (oStatus === "preparing") {
    kitchenLabel = "Cooking on Grill";
    kitchenSub = "Grill chefs accepted order & preparing food fresh.";
    kitchenBadgeClass = "status-badge-preparing";
  } else if (oStatus === "ready") {
    kitchenLabel = "Cooked & Packed";
    kitchenSub = "Freshly cooked and packed at Roadport counter.";
    kitchenBadgeClass = "status-badge-ready";
  } else if (oStatus === "completed") {
    kitchenLabel = "Completed";
    kitchenSub = "Kitchen and cashier workflow completed.";
    kitchenBadgeClass = "status-badge-completed";
  } else if (oStatus === "cancelled") {
    kitchenLabel = "Cancelled";
    kitchenSub = "Order cancelled in kitchen records.";
    kitchenBadgeClass = "status-badge-cancelled";
  }

  // --- Source B (Shopystreet Delivery Stream) Details ---
  let deliveryLabel = "Awaiting Dispatch";
  let deliverySub = "Order has not yet been dispatched to riders.";
  let deliveryBadgeClass = "status-badge-new";
  let deliveryJobDisplay = "None";

  if (deliveryJob && deliveryJob.hasDeliveryJob) {
    deliveryJobDisplay = `#${deliveryJob.deliveryJobId}`;
    if (dStatus === "delivered" || oStatus === "completed") {
      deliveryLabel = "Delivered";
      deliverySub = `Delivered to destination by Shopystreet Courier (Job #${deliveryJob.deliveryJobId}).`;
      deliveryBadgeClass = "status-badge-completed";
    } else if (dStatus === "on_the_way" || dStatus === "heading_to_customer" || dStatus === "in_transit") {
      deliveryLabel = "On The Way";
      deliverySub = `Courier on transit route with hot meal (Job #${deliveryJob.deliveryJobId}).`;
      deliveryBadgeClass = "status-badge-preparing";
    } else if (dStatus === "picked_up") {
      deliveryLabel = "Order Picked Up";
      deliverySub = `Courier collected package from Roadport kitchen (Job #${deliveryJob.deliveryJobId}).`;
      deliveryBadgeClass = "status-badge-preparing";
    } else if (dStatus === "heading_to_pickup" || dStatus === "at_kitchen") {
      deliveryLabel = "Heading to Kitchen";
      deliverySub = `Rider en route to Roadport Terminal pickup counter.`;
      deliveryBadgeClass = "status-badge-ready";
    } else if (dStatus === "accepted" || dStatus === "rider_accepted") {
      deliveryLabel = "Rider Accepted Delivery";
      deliverySub = `Shopystreet delivery record confirms acceptance (Job #${deliveryJob.deliveryJobId}).`;
      deliveryBadgeClass = "status-badge-ready";
    } else {
      deliveryLabel = "Rider Assigned";
      deliverySub = `Linked to Shopystreet Delivery Job #${deliveryJob.deliveryJobId}.`;
      deliveryBadgeClass = "status-badge-ready";
    }
  }

  // --- Combined Overall Stage (The 10 Targeted Stages) ---
  let overallStage = {
    key: "order_received",
    title: "Order received",
    subtitle: "The order has been submitted successfully and queued in our Roadport kitchen.",
    badgeClass: "status-badge-new",
    badgeText: "Order Received",
    stepIndex: 1,
    totalSteps: isDelivery ? 7 : 5,
    isLive: true,
    isCancelled: false
  };

  if (isCancelled) {
    overallStage = {
      key: "cancelled",
      title: "Order Cancelled",
      subtitle: "This order was cancelled. Please contact our Roadport counter if you have questions.",
      badgeClass: "status-badge-cancelled",
      badgeText: "Cancelled",
      stepIndex: 1,
      totalSteps: isDelivery ? 7 : 5,
      isLive: false,
      isCancelled: true
    };
  } else if (!isDelivery) {
    // --- Counter Collection Workflow ---
    if (oStatus === "completed") {
      overallStage = {
        key: "collected",
        title: "Order Collected",
        subtitle: "Your order was collected from our Roadport counter. Enjoy your meal!",
        badgeClass: "status-badge-completed",
        badgeText: "Collected & Complete",
        stepIndex: 5,
        totalSteps: 5,
        isLive: false,
        isCancelled: false
      };
    } else if (oStatus === "ready") {
      overallStage = {
        key: "ready_pickup",
        title: "Ready for Pickup",
        subtitle: "Your meal is freshly cooked and packed! Please collect at our Roadport counter.",
        badgeClass: "status-badge-ready",
        badgeText: "Ready at Counter",
        stepIndex: 4,
        totalSteps: 5,
        isLive: true,
        isCancelled: false
      };
    } else if (oStatus === "preparing") {
      overallStage = {
        key: "preparing_order",
        title: "Preparing your order",
        subtitle: "Kitchen grill chefs have accepted your order and are cooking it fresh.",
        badgeClass: "status-badge-preparing",
        badgeText: "Cooking on Grill",
        stepIndex: 3,
        totalSteps: 5,
        isLive: true,
        isCancelled: false
      };
    } else {
      overallStage = {
        key: "order_received",
        title: "Order received",
        subtitle: "Order received and queued at Roadport kitchen. Awaiting cashier acceptance.",
        badgeClass: "status-badge-new",
        badgeText: "Order Queued",
        stepIndex: 1,
        totalSteps: 5,
        isLive: true,
        isCancelled: false
      };
    }
  } else {
    // --- Delivery Workflow (Combining Kitchen and Rider Streams) ---
    if (dStatus === "delivered" || oStatus === "completed") {
      overallStage = {
        key: "delivered",
        title: "Delivered",
        subtitle: "Your order was delivered by Shopystreet Courier. Enjoy your Bamboo Chicken meal!",
        badgeClass: "status-badge-completed",
        badgeText: "Delivered",
        stepIndex: 7,
        totalSteps: 7,
        isLive: false,
        isCancelled: false
      };
    } else if (dStatus === "on_the_way" || dStatus === "heading_to_customer" || dStatus === "in_transit") {
      overallStage = {
        key: "on_the_way",
        title: "On the way",
        subtitle: "Your Shopystreet rider is on the way to your destination with your hot food.",
        badgeClass: "status-badge-preparing",
        badgeText: "On The Way",
        stepIndex: 6,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    } else if (dStatus === "picked_up") {
      overallStage = {
        key: "order_picked_up",
        title: "Order picked up",
        subtitle: "Shopystreet rider has collected your order from Roadport kitchen and is setting off.",
        badgeClass: "status-badge-ready",
        badgeText: "Picked Up",
        stepIndex: 5,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    } else if (dStatus === "heading_to_pickup" || dStatus === "at_kitchen") {
      overallStage = {
        key: "rider_heading_to_pickup",
        title: "Rider heading to pickup",
        subtitle: "Shopystreet rider is traveling to Bamboo Chicken Roadport Terminal to collect your food.",
        badgeClass: "status-badge-ready",
        badgeText: "Heading to Kitchen",
        stepIndex: 4,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    } else if (dStatus === "accepted" || dStatus === "rider_accepted") {
      overallStage = {
        key: "rider_accepted",
        title: "Rider accepted delivery",
        subtitle: "Shopystreet delivery record confirms a courier accepted the delivery assignment.",
        badgeClass: "status-badge-ready",
        badgeText: "Rider Accepted",
        stepIndex: 3,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    } else if (deliveryJob && deliveryJob.hasDeliveryJob) {
      overallStage = {
        key: "rider_assigned",
        title: "Rider assigned",
        subtitle: `Linked to Shopystreet Delivery Job #${deliveryJob.deliveryJobId}. Awaiting rider confirmation.`,
        badgeClass: "status-badge-ready",
        badgeText: "Rider Assigned",
        stepIndex: 3,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    } else if (oStatus === "ready") {
      overallStage = {
        key: "finding_rider",
        title: "Finding your rider",
        subtitle: "Food is freshly cooked and packed in our kitchen. Awaiting cashier dispatch to Shopystreet riders.",
        badgeClass: "status-badge-ready",
        badgeText: "Awaiting Dispatch",
        stepIndex: 2,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    } else if (oStatus === "preparing") {
      overallStage = {
        key: "preparing_order",
        title: "Preparing your order",
        subtitle: "Kitchen grill chefs have accepted your order and are cooking it fresh on the grill.",
        badgeClass: "status-badge-preparing",
        badgeText: "Cooking on Grill",
        stepIndex: 2,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    } else {
      overallStage = {
        key: "order_received",
        title: "Order received",
        subtitle: "The order has been submitted successfully to Bamboo Chicken. In kitchen queue.",
        badgeClass: "status-badge-new",
        badgeText: "Order Received",
        stepIndex: 1,
        totalSteps: 7,
        isLive: true,
        isCancelled: false
      };
    }
  }

  // --- Build 10-Milestone Checklist Data for Customer View ---
  const allMilestones = isDelivery ? [
    {
      id: 1,
      title: "Order received",
      desc: "Order submitted to Bamboo Chicken Roadport.",
      isDone: overallStage.stepIndex >= 1,
      isActive: overallStage.stepIndex === 1 && !isCancelled
    },
    {
      id: 2,
      title: "Preparing your order",
      desc: "Kitchen confirmed preparation & grill cooking.",
      isDone: overallStage.stepIndex >= 2,
      isActive: overallStage.stepIndex === 2 && !isCancelled
    },
    {
      id: 3,
      title: "Rider assigned & accepted",
      desc: "Linked to Shopystreet courier fleet job.",
      isDone: overallStage.stepIndex >= 3,
      isActive: overallStage.stepIndex === 3 && !isCancelled
    },
    {
      id: 4,
      title: "Rider heading to pickup",
      desc: "Courier traveling to Roadport Terminal.",
      isDone: overallStage.stepIndex >= 4,
      isActive: overallStage.stepIndex === 4 && !isCancelled
    },
    {
      id: 5,
      title: "Order picked up",
      desc: "Package collected and verified from counter.",
      isDone: overallStage.stepIndex >= 5,
      isActive: overallStage.stepIndex === 5 && !isCancelled
    },
    {
      id: 6,
      title: "On the way",
      desc: "Courier transit route active to your destination.",
      isDone: overallStage.stepIndex >= 6,
      isActive: overallStage.stepIndex === 6 && !isCancelled
    },
    {
      id: 7,
      title: "Delivered",
      desc: "Authoritative delivery completed.",
      isDone: overallStage.stepIndex >= 7,
      isActive: overallStage.stepIndex === 7 && !isCancelled
    }
  ] : [
    {
      id: 1,
      title: "Order received",
      desc: "Submitted to Roadport kitchen queue.",
      isDone: overallStage.stepIndex >= 1,
      isActive: overallStage.stepIndex === 1 && !isCancelled
    },
    {
      id: 2,
      title: "Accepted by kitchen",
      desc: "Cashier acknowledged & order accepted.",
      isDone: overallStage.stepIndex >= 2,
      isActive: overallStage.stepIndex === 2 && !isCancelled
    },
    {
      id: 3,
      title: "Preparing your order",
      desc: "Cooking on grill fresh.",
      isDone: overallStage.stepIndex >= 3,
      isActive: overallStage.stepIndex === 3 && !isCancelled
    },
    {
      id: 4,
      title: "Ready for pickup",
      desc: "Packed & waiting at Roadport counter.",
      isDone: overallStage.stepIndex >= 4,
      isActive: overallStage.stepIndex === 4 && !isCancelled
    },
    {
      id: 5,
      title: "Collected & Complete",
      desc: "Customer collected order.",
      isDone: overallStage.stepIndex >= 5,
      isActive: overallStage.stepIndex === 5 && !isCancelled
    }
  ];

  return {
    overallStage,
    kitchenStream: {
      statusKey: oStatus,
      statusLabel: kitchenLabel,
      subText: kitchenSub,
      badgeClass: kitchenBadgeClass,
      syncTimeText: "Bamboo D1 live sync"
    },
    deliveryStream: {
      statusKey: dStatus,
      statusLabel: deliveryLabel,
      subText: deliverySub,
      badgeClass: deliveryBadgeClass,
      deliveryJobId: deliveryJobDisplay,
      telemetryText: deliveryJob ? deliveryJob.lastLocationUpdate || "Awaiting GPS movement" : "Awaiting dispatch",
      boundaryNote: deliveryJob ? deliveryJob.boundaryNote : "Awaiting dispatch"
    },
    milestones: allMilestones,
    isDelivery,
    isCancelled
  };
}

function formatOrderDate(dateStr) {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr.replace(/-/g, "/"));
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${month} ${day} · ${hours}:${mins}`;
  } catch (e) {
    return dateStr;
  }
}

// --- 4. Orders Dashboard Controller (Active vs History) ---

window.switchOrdersTab = function(tab) {
  window.activeOrdersTab = tab;
  const activeBtn = document.getElementById("orders-tab-active-btn");
  const historyBtn = document.getElementById("orders-tab-history-btn");

  if (activeBtn) {
    activeBtn.classList.toggle("active", tab === "active");
    activeBtn.setAttribute("aria-selected", tab === "active" ? "true" : "false");
  }
  if (historyBtn) {
    historyBtn.classList.toggle("active", tab === "history");
    historyBtn.setAttribute("aria-selected", tab === "history" ? "true" : "false");
  }

  renderOrdersListContainer();
};

function renderOrdersListContainer() {
  const container = document.getElementById("orders-view-content");
  if (!container) return;

  const isHistory = window.activeOrdersTab === "history";
  const listToRender = isHistory ? window.cachedHistoryOrders : window.cachedActiveOrders;

  if (listToRender.length === 0) {
    if (isHistory) {
      container.innerHTML = `
        <div class="orders-empty-state">
          <div class="orders-empty-icon">📁</div>
          <h4 class="orders-empty-title">No Completed History</h4>
          <p class="orders-empty-text">
            You don't have any completed or past orders on this device yet. Completed deliveries and pickups will appear here.
          </p>
          <button type="button" class="btn-orders-browse" onclick="window.switchOrdersTab('active')">
            <span>View Active Orders</span>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="orders-empty-state">
          <div class="orders-empty-icon">🧾</div>
          <h4 class="orders-empty-title">No Active Orders</h4>
          <p class="orders-empty-text">
            You don't have any orders currently in progress on this device. Place an order from our menu to track real-time kitchen updates.
          </p>
          <button type="button" class="btn-orders-browse" onclick="setActiveBottomNav(document.querySelector('.bottom-nav-item[data-page=\\'menu\\']'), 'menu', true)">
            <span>🍗 Browse Menu</span>
          </button>
        </div>
      `;
    }
    return;
  }

  container.innerHTML = listToRender.map(order => {
    const statusMeta = getOrderStatusMeta(order.orderStatus);
    const isEcoCash = String(order.paymentMethod || "").toLowerCase().includes("ecocash");
    const isCash = String(order.paymentMethod || "").toLowerCase().includes("cash");
    const displayTotal = order.total !== undefined ? order.total.toFixed(2) : "0.00";
    const displayDate = formatOrderDate(order.createdAt);

    const itemsHtml = order.items && order.items.length > 0
      ? order.items.map(item => `
          <div class="order-item-row">
            <div class="order-item-left">
              <span class="order-item-title">${item.qty || item.quantity || 1}× ${escapeHTML(item.name || item.title || "Meal Item")}</span>
              ${item.options ? `<span class="order-item-customization">${escapeHTML(item.options)}</span>` : ""}
            </div>
            <span class="order-item-price">${item.price !== undefined ? `$${parseFloat(item.price).toFixed(2)}` : ""}</span>
          </div>
        `).join("")
      : `
          <div class="order-item-row">
            <div class="order-item-left">
              <span class="order-item-title">Standard Menu Order</span>
            </div>
            <span class="order-item-price">$${displayTotal}</span>
          </div>
        `;

    const waMsg = encodeURIComponent(`Hi Bamboo Chicken, checking on my order ${order.orderReference}`);

    return `
      <article class="customer-order-card" id="customer-order-${order.id}">
        <header class="order-card-header">
          <div>
            <div class="order-ref-number">${order.orderReference}</div>
            <div class="order-time-stamp">${escapeHTML(displayDate)}</div>
          </div>
          <div class="order-status-badge ${statusMeta.badgeClass}">
            <span class="${statusMeta.dotClass}"></span>
            <span>${statusMeta.label}</span>
          </div>
        </header>

        <div class="order-items-box">
          ${itemsHtml}
          <div class="order-total-bar">
            <div class="order-meta-chips">
              <span class="order-chip ${order.isDelivery ? 'method-delivery' : ''}">
                ${order.isDelivery ? '🚚 Delivery' : '🛍️ Pickup'}
              </span>
              <span class="order-chip ${isEcoCash ? 'payment-ecocash' : (isCash ? 'payment-cash' : '')}">
                ${escapeHTML(order.paymentMethod || 'Cash / Counter')}
              </span>
            </div>
            <div class="order-total-val">$${displayTotal}</div>
          </div>
        </div>

        ${!isHistory ? `
          <button type="button" class="btn-order-primary-track" onclick="window.openOrderDetailView('${order.id}')">
            <span>${order.isDelivery ? '🛵 Track Live Delivery' : '📋 View Live Kitchen Status'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        ` : `
          <button type="button" class="btn-order-history-view" onclick="window.openOrderDetailView('${order.id}')">
            <span>📋 View Order Receipt & Details</span>
          </button>
        `}

        <div class="order-actions-grid">
          <a href="https://wa.me/263790040778?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn-order-wa" aria-label="WhatsApp Bamboo Chicken regarding order ${order.orderReference}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </a>
          <a href="tel:0790040778" class="btn-order-call" aria-label="Call Roadport counter">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Call Counter</span>
          </a>
        </div>
      </article>
    `;
  }).join("");
}

window.loadAndRenderOrdersView = async function(isManualRefresh = false) {
  if (window._isOrdersFetching) return;
  window._isOrdersFetching = true;

  const container = document.getElementById("orders-view-content");
  const refreshBtn = document.querySelector(".orders-refresh-btn");
  const banner = document.getElementById("orders-network-banner");

  if (isManualRefresh && refreshBtn) {
    refreshBtn.classList.add("spinning");
  }

  // Show loading spinner only if container has no items yet
  if (container && (!container.children.length || container.querySelector(".orders-loading-state"))) {
    container.innerHTML = `
      <div class="orders-loading-state">
        <div class="orders-spinner"></div>
        <p style="font-size: 0.88rem; font-weight: 700; color: #281C21; margin: 0;">Connecting to kitchen & retrieving live orders...</p>
      </div>
    `;
  }

  try {
    const allOrders = await BambooOrdersService.fetchOrders();

    // Hide offline banner if previously shown
    if (banner) banner.style.display = "none";

    // Retrieve identifiers associated with this customer / device
    const activeOrderRefs = window.getStoredActiveOrderReferences();
    const customerPhone = (localStorage.getItem("bamboo_customer_phone") || "").trim();
    let orderHistory = [];
    try {
      orderHistory = JSON.parse(localStorage.getItem("bamboo_order_history") || "[]");
      if (!Array.isArray(orderHistory)) orderHistory = [];
    } catch (e) {
      orderHistory = [];
    }

    const cleanPhoneDigits = customerPhone.replace(/\D/g, "");

    const customerOrderIds = new Set();
    activeOrderRefs.forEach(ref => {
      const clean = window.cleanOrderReference(ref);
      if (clean) customerOrderIds.add(clean);
    });
    orderHistory.forEach(id => {
      const clean = window.cleanOrderReference(id);
      if (clean) customerOrderIds.add(clean);
    });
    if (window._manuallyTrackedOrderIds) {
      window._manuallyTrackedOrderIds.forEach(id => {
        const clean = window.cleanOrderReference(id);
        if (clean) customerOrderIds.add(clean);
      });
    }

    // Match real orders for this customer or device from authoritative backend
    const matchedOrders = allOrders.filter(o => {
      const oIdStr = window.cleanOrderReference(o.id);
      if (customerOrderIds.has(oIdStr)) return true;

      if (cleanPhoneDigits.length >= 7 && o.phone) {
        const oPhoneClean = String(o.phone).replace(/\D/g, "");
        if (oPhoneClean.length >= 7 && (oPhoneClean.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(oPhoneClean))) {
          return true;
        }
      }
      return false;
    });

    // Sort descending by order ID
    matchedOrders.sort((a, b) => Number(b.id) - Number(a.id));

    // Segregate Active Orders vs Completed History
    window.cachedActiveOrders = matchedOrders.filter(o => {
      const st = String(o.orderStatus || "new").toLowerCase();
      return st !== "completed" && st !== "cancelled" && st !== "delivered" && st !== "collected";
    });

    window.cachedHistoryOrders = matchedOrders.filter(o => {
      const st = String(o.orderStatus || "new").toLowerCase();
      return st === "completed" || st === "cancelled" || st === "delivered" || st === "collected";
    });

    // Requirement D: When the backend confirms that an order is completed or cancelled:
    // Remove it from the active recovery list, while preserving it in order history!
    window.cachedHistoryOrders.forEach(termOrder => {
      window.removeActiveOrderReference(termOrder.id);
    });

    // Requirement B-5: If the backend successfully returned allOrders, but an active reference
    // cannot be found at all, clean it up cleanly without broken tracking state
    if (Array.isArray(allOrders) && allOrders.length > 0) {
      activeOrderRefs.forEach(ref => {
        const clean = window.cleanOrderReference(ref);
        const found = allOrders.some(o => window.cleanOrderReference(o.id) === clean);
        if (!found) {
          window.removeActiveOrderReference(ref);
        }
      });
    }

    // Update count badges
    const activeCountBadge = document.getElementById("orders-active-count-badge");
    const historyCountBadge = document.getElementById("orders-history-count-badge");
    if (activeCountBadge) activeCountBadge.textContent = String(window.cachedActiveOrders.length);
    if (historyCountBadge) historyCountBadge.textContent = String(window.cachedHistoryOrders.length);

    // Update bottom nav orders badge dot
    const bottomOrdersBadge = document.getElementById("bottom-orders-badge");
    if (bottomOrdersBadge) {
      bottomOrdersBadge.style.display = window.cachedActiveOrders.length > 0 ? "block" : "none";
    }

    // Render current active tab
    renderOrdersListContainer();

    // If an order is currently open in detail view, refresh it seamlessly
    if (window.currentSelectedOrderId) {
      window.refreshActiveTrackingOrder(false);
    }

  } catch (err) {
    console.error("Orders sync error:", err);

    // If we have cached orders, preserve them and show recoverable notice banner
    if (window.cachedActiveOrders.length > 0 || window.cachedHistoryOrders.length > 0) {
      if (banner) {
        const bannerText = document.getElementById("orders-network-banner-text");
        if (bannerText) bannerText.textContent = "Showing saved orders. Check connection to refresh.";
        banner.style.display = "flex";
      }
    } else {
      // Nothing cached: show recoverable error screen with retry
      if (container) {
        container.innerHTML = `
          <div class="orders-error-state">
            <div style="font-size: 2.5rem; line-height: 1;">⚠️</div>
            <h4 style="font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; color: #281C21; margin: 0;">Unable to Load Orders</h4>
            <p style="font-size: 0.85rem; color: #65565D; max-width: 320px; margin: 0; line-height: 1.45;">
              We could not connect to the kitchen order system. Please check your network connection and try again.
            </p>
            <button type="button" class="btn-orders-retry" onclick="window.loadAndRenderOrdersView(true)">
              <span>Try Again</span>
            </button>
          </div>
        `;
      }
    }
  } finally {
    window._isOrdersFetching = false;
    if (refreshBtn) {
      setTimeout(() => {
        refreshBtn.classList.remove("spinning");
      }, 500);
    }
  }
};

// --- 5. Individual Order Detail & In-App Leaflet Map Tracking Controller ---

window.openOrderDetailView = async function(orderId, isFromSuccess = false) {
  const listView = document.getElementById("orders-list-view");
  const detailView = document.getElementById("orders-detail-view");
  const detailContent = document.getElementById("order-detail-content");
  const refPill = document.getElementById("detail-order-ref-pill");

  if (!detailView || !detailContent) return;

  // Clean up any previous Leaflet map instance before rebuilding order detail view
  if (trackingLeafletMapInstance) {
    try {
      if (trackingLeafletMapInstance.dragging && trackingLeafletMapInstance.dragging.enabled()) {
        trackingLeafletMapInstance.dragging.disable();
      }
      if (typeof trackingLeafletMapInstance.stop === "function") {
        trackingLeafletMapInstance.stop();
      }
      trackingLeafletMapInstance.remove();
    } catch (e) {}
    trackingLeafletMapInstance = null;
    trackingMapMarkers = {
      kitchen: null,
      dest: null,
      rider: null,
      routeLine: null
    };
  }

  const cleanId = window.cleanOrderReference(orderId);
  window.currentSelectedOrderId = cleanId;

  // Make sure Orders tab view is active
  const ordersTab = document.querySelector('.bottom-nav-item[data-page="orders"]');
  if (typeof setActiveBottomNav === "function") {
    setActiveBottomNav(ordersTab, 'orders', false);
  }

  // Switch to detail view
  if (listView) listView.style.display = "none";
  detailView.style.display = "block";
  if (refPill) refPill.textContent = `BC-${cleanId}`;

  // Loading state
  detailContent.innerHTML = `
    <div class="orders-loading-state" style="margin-top: 10px;">
      <div class="orders-spinner"></div>
      <p style="font-size: 0.88rem; font-weight: 700; color: #281C21; margin: 0;">
        ${isFromSuccess ? "Connecting to kitchen & retrieving your newly placed order..." : "Retrieving authoritative order details..."}
      </p>
    </div>
  `;

  // Bounded retry if freshly placed order hasn't populated in D1 yet
  let order = null;
  let attempts = 0;
  const maxAttempts = isFromSuccess ? 4 : 2;

  while (!order && attempts < maxAttempts) {
    attempts++;
    try {
      order = await BambooOrdersService.fetchOrderById(cleanId);
    } catch(e) {}
    if (!order && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 1200 * attempts));
    }
  }

  if (!order) {
    // If retrieval failed, show recoverable state with retry (no data fabrication)
    detailContent.innerHTML = `
      <div class="orders-error-state" style="margin-top: 10px;">
        <div style="font-size: 2.2rem;">⏱️</div>
        <h4 style="font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; color: #281C21; margin: 0;">Order Details Syncing</h4>
        <p style="font-size: 0.85rem; color: #65565D; max-width: 320px; margin: 0; line-height: 1.45;">
          Order <strong>BC-${cleanId}</strong> has been received by Bamboo Chicken. Details are still synchronizing with our kitchen database.
        </p>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button type="button" class="btn-orders-retry" onclick="window.openOrderDetailView('${cleanId}')">
            <span>Check Again</span>
          </button>
          <button type="button" class="btn-detail-back" onclick="window.closeOrderDetailView()">
            <span>Back to Orders</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Resolve delivery job from Shopystreet Riders Worker
  const deliveryJob = await ShopystreetRidersService.getDeliveryJob(order.deliveryJobId, order.id, order);

  window._currentTrackingOrder = order;
  window._currentTrackingJob = deliveryJob;

  renderOrderDetailContent(order, deliveryJob);

  // Manage recovery reference based on terminal status
  const st = String(order.orderStatus || "").toLowerCase();
  const isTerminal = (st === "completed" || st === "cancelled" || st === "delivered" || st === "collected");
  if (isTerminal) {
    window.removeActiveOrderReference(cleanId);
    stopDetailTrackingPolling();
  } else {
    window.saveActiveOrderReference(cleanId);
    startDetailTrackingPolling();
  }
};

// --- Phone Normalization for Rider Call & WhatsApp ---
function normalizePhoneForWhatsApp(phone) {
  if (!phone || typeof phone !== "string") return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Extract all digits and any leading +
  let cleaned = trimmed.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // Handle Zimbabwean numbers:
  // e.g. "0771234567" (10 digits) -> "263771234567"
  if (cleaned.startsWith("0") && cleaned.length >= 9 && cleaned.length <= 11) {
    cleaned = "263" + cleaned.slice(1);
  } else if (cleaned.length < 7) {
    return null;
  }

  return cleaned;
}

function normalizePhoneForTel(phone) {
  if (!phone || typeof phone !== "string") return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[^\d+]/g, "");
  if (cleaned.length < 5) return null;
  return cleaned;
}

/**
 * Dedicated Customer-Facing Delivery Rider Section
 * Section heading: "Your Delivery Rider"
 * Displays authorized rider identity, delivery status, latest GPS status,
 * and functional Call Rider ("tel:") and WhatsApp Rider deep-link actions.
 */
function renderRiderSectionHTML(order, deliveryJob, timeline) {
  if (!order) return "";

  // 1. Counter Pickup / Collection Orders
  if (!order.isDelivery) {
    return `
      <section class="rider-dispatch-card" id="tracking-rider-section" aria-label="Pickup Location Details">
        <div class="rider-card-header">
          <div class="rider-avatar-disc" aria-hidden="true">🎋</div>
          <div class="rider-info-body">
            <span class="rider-system-badge">Bamboo Chicken Roadport Terminal</span>
            <h4 class="rider-name-title">Roadport Collection Counter</h4>
            <p class="rider-meta-sub">Corner 5th Street &amp; Robert Mugabe Road, Harare</p>
          </div>
        </div>
        <p style="font-size: 0.8rem; color: #55454C; margin: 0; line-height: 1.4;">
          Your meal is for pickup at our Roadport Terminal branch. Present order reference <strong>${escapeHTML(order.orderReference)}</strong> at the collection window.
        </p>
      </section>
    `;
  }

  // 2. Delivery Orders
  const oStatus = String(order.orderStatus || "new").toLowerCase().trim();
  const dStatus = deliveryJob ? String(deliveryJob.deliveryStatus || "").toLowerCase().trim() : "";
  const isCancelled = oStatus === "cancelled" || dStatus === "cancelled";
  const isDelivered = dStatus === "delivered" || oStatus === "completed";

  const hasJob = !!(deliveryJob && deliveryJob.hasDeliveryJob);
  const jobId = hasJob ? deliveryJob.deliveryJobId : null;
  const rider = (deliveryJob && deliveryJob.rider) ? deliveryJob.rider : null;
  const riderName = rider ? (rider.name || null) : null;
  const riderPhone = rider ? (rider.phone || null) : null;

  // Actual delivery acceptance states from Shopystreet delivery lifecycle
  const isAcceptedOrBeyond = [
    "accepted",
    "rider_accepted",
    "heading_to_pickup",
    "at_kitchen",
    "picked_up",
    "on_the_way",
    "heading_to_customer",
    "in_transit"
  ].includes(dStatus);

  const isAssignedPendingAcceptance = (dStatus === "rider_assigned" || dStatus === "assigned" || dStatus === "pending_acceptance") ||
    (hasJob && !isAcceptedOrBeyond && !isDelivered && !isCancelled);

  // A. Cancelled state
  if (isCancelled) {
    return `
      <section class="rider-dispatch-card" id="tracking-rider-section" aria-label="Your Delivery Rider">
        <div class="rider-section-title">
          <span>Your Delivery Rider</span>
          <span class="order-status-badge status-badge-cancelled">Cancelled</span>
        </div>
        <div class="rider-unavailable-notice">
          <span>Delivery tracking has ended because this order was cancelled.</span>
        </div>
      </section>
    `;
  }

  // B. Delivered state: End active-delivery presentation
  if (isDelivered) {
    return `
      <section class="rider-dispatch-card" id="tracking-rider-section" aria-label="Your Delivery Rider">
        <div class="rider-section-title">
          <span>Your Delivery Rider</span>
          <span class="order-status-badge status-badge-completed">Delivered</span>
        </div>
        <div class="rider-completed-notice">
          <div style="font-weight: 800; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
            <span>🎉</span> Delivery Complete
          </div>
          <span style="font-size: 0.78rem; line-height: 1.4;">
            Your order was delivered by Shopystreet Courier. Active rider contact has ended. For any meal inquiries, please contact our Roadport counter.
          </span>
        </div>
      </section>
    `;
  }

  // C. Before assignment (Awaiting rider dispatch)
  if (!hasJob || dStatus === "awaiting_dispatch" || dStatus === "new" || dStatus === "pending" || (!rider && !hasJob)) {
    return `
      <section class="rider-dispatch-card" id="tracking-rider-section" aria-label="Your Delivery Rider">
        <div class="rider-section-title">
          <span>Your Delivery Rider</span>
          <span class="order-status-badge status-badge-new">Awaiting Rider</span>
        </div>
        <div class="rider-card-header">
          <div class="rider-avatar-disc" aria-hidden="true">🛵</div>
          <div class="rider-info-body">
            <span class="rider-system-badge">Shopystreet Riders Network</span>
            <h4 class="rider-name-title">Awaiting Rider Assignment</h4>
            <p class="rider-meta-sub">Food is being freshly prepared in our Roadport kitchen</p>
          </div>
        </div>
        <p style="font-size: 0.8rem; color: #55454C; margin: 0; line-height: 1.4;">
          A Shopystreet delivery rider will be assigned once your meal is cooked and packed by the kitchen. Rider identity and direct contact will appear here upon rider acceptance.
        </p>
      </section>
    `;
  }

  // D. Assigned but not accepted
  if (isAssignedPendingAcceptance && !isAcceptedOrBeyond) {
    return `
      <section class="rider-dispatch-card" id="tracking-rider-section" aria-label="Your Delivery Rider">
        <div class="rider-section-title">
          <span>Your Delivery Rider</span>
          <span class="order-status-badge status-badge-ready">Rider Assigned</span>
        </div>
        <div class="rider-card-header">
          <div class="rider-avatar-disc" aria-hidden="true">🛵</div>
          <div class="rider-info-body">
            <span class="rider-system-badge">Shopystreet Delivery Job #${escapeHTML(jobId || 'Allocated')}</span>
            <h4 class="rider-name-title">${riderName ? escapeHTML(riderName) : 'Rider Assigned'}</h4>
            <p class="rider-meta-sub">Awaiting courier confirmation &amp; acceptance</p>
          </div>
        </div>
        <p style="font-size: 0.8rem; color: #55454C; margin: 0; line-height: 1.4;">
          Delivery job is allocated on the Shopystreet network. Contact actions and live coordinates will unlock as soon as the courier confirms acceptance.
        </p>
      </section>
    `;
  }

  // E. Accepted by rider / On the way: Display real rider identity and contact actions
  const hasRealRiderDetails = !!(rider && (riderName || riderPhone));

  // Determine delivery status label
  let deliveryStatusText = "Rider Accepted Delivery";
  let deliveryStatusBadge = '<span class="order-status-badge status-badge-ready">Accepted</span>';
  let deliveryStatusSub = "Courier confirmed delivery assignment on Shopystreet network.";
  let statusIcon = "🛵";

  if (dStatus === "on_the_way" || dStatus === "heading_to_customer" || dStatus === "in_transit") {
    deliveryStatusText = "On The Way to Destination";
    deliveryStatusBadge = '<span class="order-status-badge status-badge-preparing">On The Way</span>';
    deliveryStatusSub = "Courier is en route with your hot Bamboo Chicken meal.";
    statusIcon = "🚀";
  } else if (dStatus === "picked_up") {
    deliveryStatusText = "Order Picked Up";
    deliveryStatusBadge = '<span class="order-status-badge status-badge-preparing">Picked Up</span>';
    deliveryStatusSub = "Courier collected meal package from Roadport kitchen.";
    statusIcon = "📦";
  } else if (dStatus === "heading_to_pickup" || dStatus === "at_kitchen") {
    deliveryStatusText = "Heading to Kitchen";
    deliveryStatusBadge = '<span class="order-status-badge status-badge-ready">En Route to Kitchen</span>';
    deliveryStatusSub = "Courier traveling to Bamboo Roadport Terminal to collect food.";
    statusIcon = "📍";
  }

  const telLink = normalizePhoneForTel(riderPhone);
  const waDigits = normalizePhoneForWhatsApp(riderPhone);
  const displayPhone = riderPhone ? escapeHTML(riderPhone) : null;
  const waPrefill = encodeURIComponent(`Hi ${riderName || 'Rider'}, checking on my Bamboo Chicken delivery ${order.orderReference}`);

  // Build Call Rider Button
  let callBtnHtml = "";
  if (telLink) {
    callBtnHtml = `
      <a href="tel:${telLink}" class="btn-rider-contact btn-rider-call" aria-label="Call delivery rider ${escapeHTML(riderName || '')}">
        <div class="btn-rider-contact-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>Call Rider</span>
        </div>
        <div class="btn-rider-contact-sub">${displayPhone}</div>
      </a>
    `;
  } else {
    callBtnHtml = `
      <button type="button" class="btn-rider-contact btn-rider-call disabled" disabled aria-disabled="true" title="Rider phone number not provided by delivery service">
        <div class="btn-rider-contact-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>Call Rider</span>
        </div>
        <div class="btn-rider-contact-sub">${hasRealRiderDetails ? 'Number unavailable' : 'Awaiting API release'}</div>
      </button>
    `;
  }

  // Build WhatsApp Rider Button
  let waBtnHtml = "";
  if (waDigits) {
    waBtnHtml = `
      <a href="https://wa.me/${waDigits}?text=${waPrefill}" target="_blank" rel="noopener noreferrer" class="btn-rider-contact btn-rider-wa" aria-label="WhatsApp delivery rider ${escapeHTML(riderName || '')}">
        <div class="btn-rider-contact-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>WhatsApp Rider</span>
        </div>
        <div class="btn-rider-contact-sub">Direct WhatsApp chat</div>
      </a>
    `;
  } else {
    waBtnHtml = `
      <button type="button" class="btn-rider-contact btn-rider-wa disabled" disabled aria-disabled="true" title="Valid international WhatsApp number not provided by delivery service">
        <div class="btn-rider-contact-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>WhatsApp Rider</span>
        </div>
        <div class="btn-rider-contact-sub">${hasRealRiderDetails ? 'WhatsApp unavailable' : 'Awaiting API release'}</div>
      </button>
    `;
  }

  const isAuthProtected = !!(deliveryJob && deliveryJob.authRequired);

  return `
    <section class="rider-dispatch-card" id="tracking-rider-section" aria-label="Your Delivery Rider">
      <div class="rider-section-title">
        <span>Your Delivery Rider</span>
        ${deliveryStatusBadge}
      </div>

      <div class="rider-card-header">
        <div class="rider-avatar-disc" aria-hidden="true">🛵</div>
        <div class="rider-info-body">
          <span class="rider-system-badge">Shopystreet Delivery Job #${escapeHTML(jobId || 'Allocated')}</span>
          <h4 class="rider-name-title">${escapeHTML(riderName || 'Shopystreet Courier Network')}</h4>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 4px;">
            ${displayPhone ? `<span class="rider-phone-pill">📞 ${displayPhone}</span>` : ''}
            ${rider && rider.vehicle ? `<span style="font-size: 0.72rem; color: #65565D; font-weight: 700;">🛵 ${escapeHTML(rider.vehicle)}</span>` : ''}
          </div>
        </div>
      </div>

      <div style="font-size: 0.8rem; color: #55454C; line-height: 1.4; display: flex; align-items: baseline; gap: 6px;">
        <span>${statusIcon}</span>
        <div>
          <strong>${escapeHTML(deliveryStatusText)}:</strong>
          <span>${escapeHTML(deliveryStatusSub)}</span>
        </div>
      </div>

      ${deliveryJob && deliveryJob.riderLocation && (deliveryJob.isGpsLive || !deliveryJob.isGpsStale) ? `
        <div style="font-size: 0.75rem; color: #059669; font-weight: 700; display: flex; align-items: center; gap: 5px;">
          <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10B981;"></span>
          <span>Live GPS coordinates active on map above (${escapeHTML(deliveryJob.lastLocationUpdate)})</span>
        </div>
      ` : ''}

      ${isAuthProtected ? `
        <div class="integration-boundary-banner" style="margin-top: 2px;">
          <span>🔒</span>
          <div>
            <strong>Protected Delivery Service:</strong>
            Customer-safe rider contact read boundary active. Internal rider authentication tokens are safely isolated on the backend. Call and WhatsApp actions will unlock as soon as customer-authorized rider details are released by the Shopystreet API.
          </div>
        </div>
      ` : ''}

      <!-- Functional Contact Actions: Call Rider & WhatsApp Rider -->
      <div class="rider-contact-grid">
        ${callBtnHtml}
        ${waBtnHtml}
      </div>
    </section>
  `;
}

// --- Tracking Map State initialized at top of module ---

function renderOrderDetailContent(order, deliveryJob) {
  const detailContent = document.getElementById("order-detail-content");
  if (!detailContent) return;

  const timeline = resolveUnifiedTrackingTimeline(order, deliveryJob);
  const displayTotal = order.total !== undefined ? order.total.toFixed(2) : "0.00";
  const displayDate = formatOrderDate(order.createdAt);
  const isEcoCash = String(order.paymentMethod || "").toLowerCase().includes("ecocash");
  const isCash = String(order.paymentMethod || "").toLowerCase().includes("cash");

  // Stepper width %
  const stepPercent = Math.min(100, Math.max(0, ((timeline.overallStage.stepIndex - 1) / (timeline.overallStage.totalSteps - 1)) * 100));

  // Parse items
  const itemsHtml = order.items && order.items.length > 0
    ? order.items.map(item => `
        <div class="order-item-row">
          <div class="order-item-left">
            <span class="order-item-title">${item.qty || item.quantity || 1}× ${escapeHTML(item.name || item.title || "Meal Item")}</span>
            ${item.options ? `<span class="order-item-customization">${escapeHTML(item.options)}</span>` : ""}
          </div>
          <span class="order-item-price">${item.price !== undefined ? `$${parseFloat(item.price).toFixed(2)}` : ""}</span>
        </div>
      `).join("")
    : `
        <div class="order-item-row">
          <div class="order-item-left">
            <span class="order-item-title">Standard Menu Order</span>
          </div>
          <span class="order-item-price">$${displayTotal}</span>
        </div>
      `;

  const waMsg = encodeURIComponent(`Hi Bamboo Chicken, checking on my order ${order.orderReference}`);

  detailContent.innerHTML = `
    <!-- 1. Tracking Stage Banner & Progress Stepper -->
    <section class="tracking-stage-banner">
      <div class="tracking-banner-top">
        <div>
          <span style="font-size: 0.72rem; font-weight: 800; color: #F36B21; text-transform: uppercase; letter-spacing: 0.4px;">
            ${order.isDelivery ? 'Delivery Order' : 'Counter Collection'} · BC-${order.id}
          </span>
          <h3 class="tracking-banner-title" id="track-banner-title">${timeline.overallStage.title}</h3>
          <p class="tracking-banner-subtitle" id="track-banner-subtitle">${timeline.overallStage.subtitle}</p>
        </div>
        <div class="order-status-badge ${timeline.overallStage.badgeClass}" id="track-banner-badge">
          <span class="order-status-dot"></span>
          <span>${timeline.overallStage.badgeText}</span>
        </div>
      </div>

      <!-- Progressive Stepper -->
      <div class="tracking-stepper" aria-label="Order preparation progress">
        <div class="tracking-stepper-line-bg"></div>
        <div class="tracking-stepper-line-fill" id="track-stepper-line" style="width: ${stepPercent}%;"></div>

        ${order.isDelivery ? `
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 1 ? (timeline.overallStage.stepIndex === 1 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 1 ? '✓' : '1'}</div>
            <span class="tracking-step-label">Received</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 2 ? (timeline.overallStage.stepIndex === 2 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 2 ? '✓' : '2'}</div>
            <span class="tracking-step-label">Cooking</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 3 ? (timeline.overallStage.stepIndex === 3 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 3 ? '✓' : '3'}</div>
            <span class="tracking-step-label">Rider Linked</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 4 ? (timeline.overallStage.stepIndex === 4 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 4 ? '✓' : '4'}</div>
            <span class="tracking-step-label">To Kitchen</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 5 ? (timeline.overallStage.stepIndex === 5 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 5 ? '✓' : '5'}</div>
            <span class="tracking-step-label">Picked Up</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 6 ? (timeline.overallStage.stepIndex === 6 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 6 ? '✓' : '6'}</div>
            <span class="tracking-step-label">On Way</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 7 ? 'completed' : ''}">
            <div class="tracking-step-circle">7</div>
            <span class="tracking-step-label">Delivered</span>
          </div>
        ` : `
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 1 ? (timeline.overallStage.stepIndex === 1 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 1 ? '✓' : '1'}</div>
            <span class="tracking-step-label">Received</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 2 ? (timeline.overallStage.stepIndex === 2 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 2 ? '✓' : '2'}</div>
            <span class="tracking-step-label">Accepted</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 3 ? (timeline.overallStage.stepIndex === 3 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 3 ? '✓' : '3'}</div>
            <span class="tracking-step-label">Cooking</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 4 ? (timeline.overallStage.stepIndex === 4 ? 'active' : 'completed') : ''}">
            <div class="tracking-step-circle">${timeline.overallStage.stepIndex > 4 ? '✓' : '4'}</div>
            <span class="tracking-step-label">Ready</span>
          </div>
          <div class="tracking-step-node ${timeline.overallStage.stepIndex >= 5 ? 'completed' : ''}">
            <div class="tracking-step-circle">5</div>
            <span class="tracking-step-label">Collected</span>
          </div>
        `}
      </div>
    </section>

    <!-- 2. Dual Independent Status Streams (Source A + Source B) -->
    <section class="tracking-dual-source-grid" aria-label="Authoritative Data Sources">
      <!-- Source A: Bamboo Orders Worker & D1 -->
      <div class="dual-stream-card">
        <div class="dual-stream-header">
          <span class="dual-stream-source-tag">
            <span>🎋</span> Bamboo Orders (D1)
          </span>
          <span class="dual-stream-status-pill ${timeline.kitchenStream.badgeClass}">
            ${escapeHTML(timeline.kitchenStream.statusLabel)}
          </span>
        </div>
        <p class="dual-stream-meta">${escapeHTML(timeline.kitchenStream.subText)}</p>
        <div class="dual-stream-sync-row">
          <span>Authoritative Kitchen State</span>
          <span>${escapeHTML(timeline.kitchenStream.syncTimeText)}</span>
        </div>
      </div>

      <!-- Source B: Shopystreet Riders Worker & D1 -->
      <div class="dual-stream-card">
        <div class="dual-stream-header">
          <span class="dual-stream-source-tag">
            <span>🛵</span> Shopystreet Riders
          </span>
          <span class="dual-stream-status-pill ${timeline.deliveryStream.badgeClass}">
            ${escapeHTML(timeline.deliveryStream.statusLabel)}
          </span>
        </div>
        <p class="dual-stream-meta">${escapeHTML(timeline.deliveryStream.subText)}</p>
        <div class="dual-stream-sync-row">
          <span>Job ${escapeHTML(timeline.deliveryStream.deliveryJobId)}</span>
          <span>${escapeHTML(timeline.deliveryStream.telemetryText)}</span>
        </div>
      </div>
    </section>

    <!-- 3. Embedded In-App Leaflet Map (In-App GPS Delivery Map) -->
    <section class="tracking-map-card" aria-label="Live GPS Delivery Map">
      <div class="tracking-map-viewport">
        <!-- Floating Freshness Status Badge -->
        <div class="map-status-pill" id="map-freshness-pill">
          ${deliveryJob && deliveryJob.isGpsLive ? `
            <span class="map-status-dot-live"></span>
            <span>Live GPS · Courier Active</span>
          ` : (deliveryJob && deliveryJob.isGpsStale ? `
            <span class="map-status-dot-stale"></span>
            <span>GPS Telemetry Updating</span>
          ` : `
            <span class="map-status-dot-waiting"></span>
            <span>${order.isDelivery ? (deliveryJob && deliveryJob.hasDeliveryJob ? 'Awaiting Courier Movement' : 'Kitchen Active · GPS on Dispatch') : 'Roadport Pickup Counter'}</span>
          `)}
        </div>

        <!-- In-App Leaflet Map Container -->
        <div id="order-tracking-map"></div>

        <!-- Recenter Button -->
        <button type="button" class="btn-map-recenter" onclick="window.recenterTrackingMap()" title="Fit all markers in view">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Recenter</span>
        </button>
      </div>

      <div class="map-card-footer" id="map-route-footer">
        <div>
          <strong>📍 Route:</strong> Bamboo Roadport Kitchen ➔ ${escapeHTML(order.notes ? order.notes.slice(0, 32) + (order.notes.length > 32 ? '...' : '') : 'Harare Destination')}
        </div>
        <div id="map-footer-telemetry">${deliveryJob ? escapeHTML(deliveryJob.lastUpdatedText) : 'Live Route'}</div>
      </div>
    </section>

    <!-- 4. 10-Milestone Customer Timeline Checklist -->
    <section class="tracking-milestones-card" aria-label="Order Milestones">
      <div class="tracking-milestones-header">
        <h4 class="tracking-milestones-title">Delivery Journey</h4>
        <span style="font-size: 0.72rem; font-weight: 800; color: #F36B21;">
          Step ${timeline.overallStage.stepIndex} of ${timeline.overallStage.totalSteps}
        </span>
      </div>
      <ul class="tracking-milestones-list">
        ${timeline.milestones.map(m => `
          <li class="timeline-milestone-item ${m.isDone ? 'is-completed' : ''} ${m.isActive ? 'is-active' : ''}">
            <div class="timeline-milestone-node">
              ${m.isDone && !m.isActive ? '✓' : m.id}
            </div>
            <div class="timeline-milestone-content">
              <h5 class="timeline-milestone-title">
                ${escapeHTML(m.title)}
                ${m.isActive ? '<span style="font-size: 0.68rem; background: #F36B21; color:#fff; padding:1px 6px; border-radius:4px; font-weight:800;">ACTIVE</span>' : ''}
              </h5>
              <p class="timeline-milestone-desc">${escapeHTML(m.desc)}</p>
            </div>
          </li>
        `).join("")}
      </ul>
    </section>

    <!-- 5. Dedicated "Your Delivery Rider" Identity & Contact Actions Card -->
    ${renderRiderSectionHTML(order, deliveryJob, timeline)}

    <!-- 6. Itemized Summary & Order Details Card -->
    <section class="customer-order-card" style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);">
      <header class="order-card-header">
        <div>
          <div class="order-ref-number">${order.orderReference}</div>
          <div class="order-time-stamp">Placed on ${escapeHTML(displayDate)}</div>
        </div>
        <div class="order-total-val">$${displayTotal}</div>
      </header>

      <div class="order-items-box">
        ${itemsHtml}
        <div class="order-total-bar">
          <div class="order-meta-chips">
            <span class="order-chip ${order.isDelivery ? 'method-delivery' : ''}">
              ${order.isDelivery ? '🚚 Delivery' : '🛍️ Pickup'}
            </span>
            <span class="order-chip ${isEcoCash ? 'payment-ecocash' : (isCash ? 'payment-cash' : '')}">
              ${escapeHTML(order.paymentMethod || 'Cash / Counter')}
            </span>
          </div>
          <div class="order-total-val">$${displayTotal}</div>
        </div>
      </div>

      ${order.notes ? `
        <div style="background: rgba(40, 28, 33, 0.05); padding: 10px 12px; border-radius: 10px; font-size: 0.82rem; color: #281C21;">
          <strong>Notes &amp; Address:</strong> ${escapeHTML(order.notes)}
        </div>
      ` : ''}

      <div class="order-actions-grid">
        <a href="https://wa.me/263790040778?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn-order-wa" aria-label="WhatsApp Bamboo Chicken regarding order ${order.orderReference}">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>WhatsApp Roadport</span>
        </a>
        <a href="tel:0790040778" class="btn-order-call" aria-label="Call Roadport counter">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>Call Counter</span>
        </a>
      </div>
    </section>
  `;

  // Initialize or update embedded Leaflet Map smoothly without destroying it
  setupOrUpdateLeafletTrackingMap(order, deliveryJob, true);
}

/**
 * Real routing service integration: Queries OpenStreetMap / OSRM for genuine road geometry
 * between Roadport Terminal and customer destination (or courier).
 * Never fabricates coordinates or routes.
 */
async function fetchRealRouteGeometry(origin, destination) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes[0]) {
      const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      const durationMin = Math.round((data.routes[0].duration || 0) / 60);
      const distanceKm = ((data.routes[0].distance || 0) / 1000).toFixed(1);
      return { coords, durationMin, distanceKm };
    }
  } catch(e) {
    console.warn("OSRM real routing service note:", e);
  }
  return null;
}

/**
 * Robust Leaflet Map lifecycle controller.
 * Preserves the map instance during background polling so the user's view is never reset.
 * Only plots rider coordinates when REAL telemetry exists from Shopystreet.
 */
async function setupOrUpdateLeafletTrackingMap(order, deliveryJob, isInitial = false) {
  const mapContainer = document.getElementById("order-tracking-map");
  if (!mapContainer || typeof window.L === "undefined") {
    return;
  }

  const hasDest = order.customerLat && order.customerLng &&
                  !isNaN(order.customerLat) && !isNaN(order.customerLng) &&
                  (order.customerLat !== 0 || order.customerLng !== 0);

  const hasRider = deliveryJob && deliveryJob.riderLocation &&
                   deliveryJob.riderLocation.lat !== undefined && deliveryJob.riderLocation.lng !== undefined &&
                   !isNaN(deliveryJob.riderLocation.lat) && !isNaN(deliveryJob.riderLocation.lng);

  const destCoords = hasDest ? [order.customerLat, order.customerLng] : null;
  const riderCoords = hasRider ? [deliveryJob.riderLocation.lat, deliveryJob.riderLocation.lng] : null;

  // Verify that any existing trackingLeafletMapInstance is still valid and attached to mapContainer
  if (trackingLeafletMapInstance) {
    let isValid = false;
    try {
      isValid = (trackingLeafletMapInstance.getContainer() === mapContainer) && document.body.contains(mapContainer);
    } catch (e) {
      isValid = false;
    }
    if (!isValid) {
      try {
        if (trackingLeafletMapInstance.dragging && trackingLeafletMapInstance.dragging.enabled()) {
          trackingLeafletMapInstance.dragging.disable();
        }
        if (typeof trackingLeafletMapInstance.stop === "function") {
          trackingLeafletMapInstance.stop();
        }
        trackingLeafletMapInstance.remove();
      } catch (e) {}
      trackingLeafletMapInstance = null;
      trackingMapMarkers = {
        kitchen: null,
        dest: null,
        rider: null,
        routeLine: null
      };
    }
  }

  const kitchenCoords = (typeof window.ROADPORT_KITCHEN_COORDS !== "undefined" && Array.isArray(window.ROADPORT_KITCHEN_COORDS))
    ? window.ROADPORT_KITCHEN_COORDS
    : [-17.8292, 31.0522];

  // 1. Initial creation if not already instantiated
  if (!trackingLeafletMapInstance) {
    try {
      if (mapContainer._leaflet_id) {
        delete mapContainer._leaflet_id;
      }
      mapContainer.innerHTML = "";

      // Initialize with explicit center and zoom in options to ensure map is loaded immediately
      const map = L.map(mapContainer, {
        center: kitchenCoords,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: false
      });
      trackingLeafletMapInstance = map;

      // Explicitly set center and zoom first before adding layers or markers
      map.setView(kitchenCoords, 15, { animate: false });

      // OpenStreetMap standard tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["a", "b", "c"]
      }).addTo(map);

      // Kitchen Pin (Bamboo Chicken Roadport Terminal)
      const kitchenIcon = L.divIcon({
        className: "leaflet-div-icon",
        html: '<div class="custom-kitchen-pin" title="Bamboo Chicken Kitchen">🎋</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });
      trackingMapMarkers.kitchen = L.marker(kitchenCoords, { icon: kitchenIcon })
        .addTo(map)
        .bindPopup("<strong>Bamboo Chicken Roadport</strong><br>Kitchen & Grill (Corner 5th & Robert Mugabe)");

      // Destination Pin
      if (hasDest && destCoords) {
        const destIcon = L.divIcon({
          className: "leaflet-div-icon",
          html: '<div class="custom-dest-pin" title="Delivery Destination">📍</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18]
        });
        trackingMapMarkers.dest = L.marker(destCoords, { icon: destIcon })
          .addTo(map)
          .bindPopup("<strong>Delivery Destination</strong><br>" + escapeHTML(order.notes || "Customer Destination"));
      }

      // Rider Pin (Only if real GPS coordinates exist)
      if (hasRider && riderCoords) {
        const riderIcon = L.divIcon({
          className: "leaflet-div-icon",
          html: '<div class="custom-rider-pin" title="Shopystreet Courier">🛵</div>',
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [0, -19]
        });
        const riderPopupContent = deliveryJob && deliveryJob.rider && deliveryJob.rider.name
          ? `<strong>Your Delivery Rider: ${escapeHTML(deliveryJob.rider.name)}</strong><br>Status: ${escapeHTML((deliveryJob.deliveryStatus || "En route").replace(/_/g, " "))}${deliveryJob.rider.phone ? `<br>📞 ${escapeHTML(deliveryJob.rider.phone)}` : ''}`
          : "<strong>Shopystreet Rider</strong><br>Courier in transit";
        trackingMapMarkers.rider = L.marker(riderCoords, { icon: riderIcon })
          .addTo(map)
          .bindPopup(riderPopupContent);
      }

      // Fit bounds safely without transition glitch
      const bounds = [kitchenCoords];
      if (hasDest && destCoords) bounds.push(destCoords);
      if (hasRider && riderCoords) bounds.push(riderCoords);

      const w = mapContainer.clientWidth || mapContainer.offsetWidth || 0;
      const h = mapContainer.clientHeight || mapContainer.offsetHeight || 0;

      if (bounds.length > 1 && w > 80 && h > 80) {
        try {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: false });
        } catch (fbErr) {
          map.setView(kitchenCoords, 15, { animate: false });
        }
      } else {
        map.setView(kitchenCoords, 15, { animate: false });
      }

      // Route geometry from real routing service
      const targetPoint = (hasRider && riderCoords) ? riderCoords : (hasDest ? destCoords : null);
      if (targetPoint) {
        const routeData = await fetchRealRouteGeometry(kitchenCoords, targetPoint);
        if (routeData && routeData.coords.length > 0 && trackingLeafletMapInstance === map) {
          trackingMapMarkers.routeLine = L.polyline(routeData.coords, {
            color: "#F36B21",
            weight: 4,
            opacity: 0.85,
            dashArray: "6, 8"
          }).addTo(map);

          const footerEl = document.getElementById("map-route-footer");
          if (footerEl) {
            footerEl.innerHTML = `
              <div><strong>📍 Route:</strong> ${routeData.distanceKm} km (${routeData.durationMin} mins transit)</div>
              <div>${deliveryJob ? escapeHTML(deliveryJob.lastUpdatedText) : 'Live Route'}</div>
            `;
          }
        }
      }

      setTimeout(() => {
        if (trackingLeafletMapInstance && trackingLeafletMapInstance === map) {
          try {
            trackingLeafletMapInstance.invalidateSize({ animate: false });
            const cw = mapContainer.clientWidth || mapContainer.offsetWidth || 0;
            const ch = mapContainer.clientHeight || mapContainer.offsetHeight || 0;
            if (bounds.length > 1 && cw > 80 && ch > 80) {
              trackingLeafletMapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: false });
            }
          } catch(e) {}
        }
      }, 250);

    } catch (e) {
      console.warn("Leaflet map initialization warning:", e);
    }
    return;
  }

  // 2. Map already exists: Non-destructive update (does NOT reset user map view)
  const map = trackingLeafletMapInstance;

  // Update Destination Marker
  if (hasDest && destCoords) {
    if (trackingMapMarkers.dest) {
      trackingMapMarkers.dest.setLatLng(destCoords);
    } else {
      const destIcon = L.divIcon({
        className: "leaflet-div-icon",
        html: '<div class="custom-dest-pin" title="Delivery Destination">📍</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });
      trackingMapMarkers.dest = L.marker(destCoords, { icon: destIcon }).addTo(map);
    }
  } else if (trackingMapMarkers.dest) {
    map.removeLayer(trackingMapMarkers.dest);
    trackingMapMarkers.dest = null;
  }

  // Update Rider Marker
  if (hasRider && riderCoords) {
    if (trackingMapMarkers.rider) {
      trackingMapMarkers.rider.setLatLng(riderCoords);
    } else {
      const riderIcon = L.divIcon({
        className: "leaflet-div-icon",
        html: '<div class="custom-rider-pin" title="Shopystreet Courier">🛵</div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19]
      });
      const riderPopupContent = deliveryJob && deliveryJob.rider && deliveryJob.rider.name
        ? `<strong>Your Delivery Rider: ${escapeHTML(deliveryJob.rider.name)}</strong><br>Status: ${escapeHTML((deliveryJob.deliveryStatus || "En route").replace(/_/g, " "))}${deliveryJob.rider.phone ? `<br>📞 ${escapeHTML(deliveryJob.rider.phone)}` : ''}`
        : "<strong>Shopystreet Rider</strong><br>Courier in transit";
      trackingMapMarkers.rider = L.marker(riderCoords, { icon: riderIcon }).addTo(map).bindPopup(riderPopupContent);
    }
  } else if (trackingMapMarkers.rider) {
    map.removeLayer(trackingMapMarkers.rider);
    trackingMapMarkers.rider = null;
  }
}

window.recenterTrackingMap = function() {
  if (!trackingLeafletMapInstance) return;
  const kitchenCoords = (typeof window.ROADPORT_KITCHEN_COORDS !== "undefined" && Array.isArray(window.ROADPORT_KITCHEN_COORDS))
    ? window.ROADPORT_KITCHEN_COORDS
    : [-17.8292, 31.0522];
  const order = window._currentTrackingOrder;
  const deliveryJob = window._currentTrackingJob;
  const bounds = [kitchenCoords];

  if (order && order.customerLat && order.customerLng && !isNaN(order.customerLat) && (order.customerLat !== 0 || order.customerLng !== 0)) {
    bounds.push([order.customerLat, order.customerLng]);
  }
  if (deliveryJob && deliveryJob.riderLocation && deliveryJob.riderLocation.lat && deliveryJob.riderLocation.lng) {
    bounds.push([deliveryJob.riderLocation.lat, deliveryJob.riderLocation.lng]);
  }

  try {
    const container = trackingLeafletMapInstance.getContainer();
    const w = container ? (container.clientWidth || container.offsetWidth) : 0;
    const h = container ? (container.clientHeight || container.offsetHeight) : 0;

    if (bounds.length > 1 && w > 80 && h > 80) {
      trackingLeafletMapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: false });
    } else {
      trackingLeafletMapInstance.setView(kitchenCoords, 15, { animate: false });
    }
  } catch (e) {
    try {
      trackingLeafletMapInstance.setView(kitchenCoords, 15, { animate: false });
    } catch(err2) {}
  }
};

/**
 * Independent polling and refresh for both sources:
 * - Refresh Source A (Bamboo Orders Worker)
 * - Refresh Source B (Shopystreet Riders Worker)
 * Preserves valid order information during refresh and avoids resetting the map.
 */
window.refreshActiveTrackingOrder = async function(isManual = false) {
  if (!window.currentSelectedOrderId) return;
  const refreshBtn = document.querySelector(".order-detail-refresh-btn");
  if (isManual && refreshBtn) refreshBtn.classList.add("spinning");

  let freshOrder = null;
  let freshDeliveryJob = null;
  let orderError = null;
  let deliveryError = null;

  // 1. Refresh Source A: Bamboo Orders Worker & D1
  try {
    freshOrder = await BambooOrdersService.fetchOrderById(window.currentSelectedOrderId);
  } catch (e) {
    orderError = e;
    console.warn("Bamboo order refresh error:", e);
  }

  // Preserve cached order if read failed
  const currentOrder = freshOrder || window._currentTrackingOrder;
  if (!currentOrder) {
    if (refreshBtn) refreshBtn.classList.remove("spinning");
    return;
  }

  // 2. Refresh Source B: Shopystreet Riders Worker & D1
  try {
    freshDeliveryJob = await ShopystreetRidersService.getDeliveryJob(
      currentOrder.deliveryJobId,
      currentOrder.id,
      currentOrder
    );
  } catch (e) {
    deliveryError = e;
    console.warn("Shopystreet delivery job refresh error:", e);
  }

  const currentJob = freshDeliveryJob || window._currentTrackingJob;

  window._currentTrackingOrder = currentOrder;
  window._currentTrackingJob = currentJob;

  // Update DOM and Map non-destructively
  const timeline = resolveUnifiedTrackingTimeline(currentOrder, currentJob);

  // Update Banner
  const titleEl = document.getElementById("track-banner-title");
  const subEl = document.getElementById("track-banner-subtitle");
  const badgeEl = document.getElementById("track-banner-badge");
  const lineEl = document.getElementById("track-stepper-line");
  const stepPercent = Math.min(100, Math.max(0, ((timeline.overallStage.stepIndex - 1) / (timeline.overallStage.totalSteps - 1)) * 100));

  if (titleEl) titleEl.textContent = timeline.overallStage.title;
  if (subEl) subEl.textContent = timeline.overallStage.subtitle;
  if (badgeEl) {
    badgeEl.className = `order-status-badge ${timeline.overallStage.badgeClass}`;
    badgeEl.innerHTML = `<span class="order-status-dot"></span><span>${timeline.overallStage.badgeText}</span>`;
  }
  if (lineEl) lineEl.style.width = `${stepPercent}%`;

  // Update rider section non-destructively
  const riderSectionEl = document.getElementById("tracking-rider-section");
  if (riderSectionEl) {
    riderSectionEl.outerHTML = renderRiderSectionHTML(currentOrder, currentJob, timeline);
  }

  // Update map markers smoothly
  setupOrUpdateLeafletTrackingMap(currentOrder, currentJob, false);

  // End live polling and clean active recovery reference if order has reached completed or cancelled state
  if (!timeline.overallStage.isLive) {
    stopDetailTrackingPolling();
    window.removeActiveOrderReference(currentOrder.id);
    const bottomOrdersBadge = document.getElementById("bottom-orders-badge");
    if (bottomOrdersBadge) {
      const remainingActive = (window.cachedActiveOrders || []).filter(o => String(o.id) !== String(currentOrder.id));
      bottomOrdersBadge.style.display = remainingActive.length > 0 ? "block" : "none";
    }
  }

  if (refreshBtn) {
    setTimeout(() => refreshBtn.classList.remove("spinning"), 500);
  }
};

window.closeOrderDetailView = function() {
  stopDetailTrackingPolling();
  window.currentSelectedOrderId = null;
  if (trackingLeafletMapInstance) {
    try {
      if (trackingLeafletMapInstance.dragging && trackingLeafletMapInstance.dragging.enabled()) {
        trackingLeafletMapInstance.dragging.disable();
      }
      if (typeof trackingLeafletMapInstance.stop === "function") {
        trackingLeafletMapInstance.stop();
      }
      trackingLeafletMapInstance.remove();
    } catch(e) {}
    trackingLeafletMapInstance = null;
  }
  trackingMapMarkers = {
    kitchen: null,
    dest: null,
    rider: null,
    routeLine: null
  };

  window.currentSelectedOrderId = null;
  window._currentTrackingOrder = null;
  window._currentTrackingJob = null;

  const listView = document.getElementById("orders-list-view");
  const detailView = document.getElementById("orders-detail-view");

  if (detailView) detailView.style.display = "none";
  if (listView) listView.style.display = "block";

  // Re-sync orders list view and start list polling
  renderOrdersListContainer();
  window.startOrdersPolling();
};

function startDetailTrackingPolling() {
  stopDetailTrackingPolling();
  orderDetailPollingTimer = setInterval(() => {
    const detailView = document.getElementById("orders-detail-view");
    if (detailView && detailView.style.display !== "none" && window.currentSelectedOrderId) {
      window.refreshActiveTrackingOrder(false);
    } else {
      stopDetailTrackingPolling();
    }
  }, 8000);
}

function stopDetailTrackingPolling() {
  if (orderDetailPollingTimer) {
    clearInterval(orderDetailPollingTimer);
    orderDetailPollingTimer = null;
  }
}

// --- 6. Manual Order Lookup Functionality ---

window.executeManualOrderLookup = async function() {
  const input = document.getElementById("orders-manual-lookup-input");
  const errEl = document.getElementById("orders-manual-lookup-error");
  if (!input) return;

  const query = input.value.trim();
  if (!query) {
    if (errEl) {
      errEl.textContent = "Please enter an order # (e.g. BC-105) or phone number.";
      errEl.style.display = "block";
    }
    input.focus();
    return;
  }
  if (errEl) errEl.style.display = "none";

  const trackBtn = document.querySelector(".btn-lookup-track");
  if (trackBtn) {
    trackBtn.disabled = true;
    trackBtn.textContent = "Checking...";
  }

  try {
    const match = await BambooOrdersService.lookupOrderByReference(query);

    if (match) {
      // Retain in customer device history
      window._manuallyTrackedOrderIds.add(String(match.id));
      const matchStatus = String(match.orderStatus || "").toLowerCase();
      const isTerminalMatch = (matchStatus === "completed" || matchStatus === "cancelled" || matchStatus === "delivered" || matchStatus === "collected");
      if (!isTerminalMatch) {
        window.saveActiveOrderReference(match.orderReference);
      }
      try {
        let history = JSON.parse(localStorage.getItem("bamboo_order_history") || "[]");
        if (!Array.isArray(history)) history = [];
        if (!history.includes(match.orderReference)) {
          history.unshift(match.orderReference);
          localStorage.setItem("bamboo_order_history", JSON.stringify(history.slice(0, 30)));
        }
      } catch (e) {}

      input.value = "";
      if (errEl) errEl.style.display = "none";
      showToast(`✅ Found order ${match.orderReference}!`);

      // Automatically open tracking screen directly
      window.openOrderDetailView(match.id);
    } else {
      if (errEl) {
        errEl.textContent = `No order found matching "${query}". Please verify your reference or phone number.`;
        errEl.style.display = "block";
      }
    }
  } catch (err) {
    if (errEl) {
      errEl.textContent = "Could not reach orders service right now. Please check connection and try again.";
      errEl.style.display = "block";
    }
  } finally {
    if (trackBtn) {
      trackBtn.disabled = false;
      trackBtn.textContent = "Track";
    }
  }
};

// --- 7. Polling Synchronization Rules ---

window.startOrdersPolling = function() {
  window.stopOrdersPolling();
  ordersListPollingTimer = setInterval(() => {
    const ordersView = document.getElementById("orders-view");
    const detailView = document.getElementById("orders-detail-view");
    // Only poll list if orders view is active and not inside detail view
    if (ordersView && ordersView.style.display !== "none" && (!detailView || detailView.style.display === "none")) {
      window.loadAndRenderOrdersView(false);
    } else if (!ordersView || ordersView.style.display === "none") {
      window.stopOrdersPolling();
    }
  }, 15000);
};

window.stopOrdersPolling = function() {
  if (ordersListPollingTimer) {
    clearInterval(ordersListPollingTimer);
    ordersListPollingTimer = null;
  }
  stopDetailTrackingPolling();
};

// Backwards compatibility aliases
window.renderOrdersPanel = window.loadAndRenderOrdersView;
window.lookupOrderByIdOrPhone = window.executeManualOrderLookup;

/* ==========================================================================
   Promotional Feed Data & Component System
   Dumplings Preparation Video Guide & Official Bamboo Chicken Promotions
   ========================================================================== */

const PROMOTIONAL_POSTS = [
  {
    id: "promo-post-dumplings-video",
    type: "video",
    publisher: "Bamboo Chicken",
    publisherBadge: "Half-Cooked Dumplings",
    tag: "Half-Cooked Dumplings",
    title: "How to Prepare Dumplings",
    videoUrl: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/How%20to%20prepare%20half%20cooked%20dumplingsat%20home.mp4",
    posterUrl: "https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Bamboo-Chicken-Half-Cooked-Chicken-Dumplings.webp",
    actionLabel: "Explore Dumplings",
    actionCategory: "dumplings"
  }
];

window.PROMOTIONAL_POSTS = PROMOTIONAL_POSTS;

window.initDumplingVideoPlayer = function() {
  const video = document.getElementById("dumpling-prep-video");
  const playOverlay = document.getElementById("promo-video-play-overlay");
  const playBtn = document.getElementById("promo-video-play-btn");
  const fullscreenBtn = document.getElementById("promo-video-fullscreen-btn");
  const loadingEl = document.getElementById("promo-video-loading");
  const errorEl = document.getElementById("promo-video-error");
  const retryBtn = document.getElementById("promo-video-retry-btn");

  if (!video) return;

  const handlePlay = () => {
    if (errorEl) errorEl.style.display = "none";
    if (playOverlay) playOverlay.style.display = "none";
    video.play().catch(err => {
      console.warn("Video playback blocked or interrupted:", err);
      if (playOverlay) playOverlay.style.display = "flex";
    });
  };

  window.playDumplingVideo = handlePlay;

  if (playOverlay) {
    playOverlay.onclick = handlePlay;
  }
  if (playBtn) {
    playBtn.onclick = (e) => {
      e.stopPropagation();
      handlePlay();
    };
  }

  video.addEventListener("play", () => {
    if (playOverlay) playOverlay.style.display = "none";
    if (errorEl) errorEl.style.display = "none";
  });

  video.addEventListener("pause", () => {
    if (video.currentTime < video.duration && !video.seeking) {
      if (playOverlay) playOverlay.style.display = "flex";
    }
  });

  video.addEventListener("ended", () => {
    if (playOverlay) playOverlay.style.display = "flex";
  });

  video.addEventListener("waiting", () => {
    if (loadingEl) loadingEl.style.display = "flex";
  });

  video.addEventListener("playing", () => {
    if (loadingEl) loadingEl.style.display = "none";
    if (errorEl) errorEl.style.display = "none";
  });

  video.addEventListener("canplay", () => {
    if (loadingEl) loadingEl.style.display = "none";
  });

  video.addEventListener("error", () => {
    if (loadingEl) loadingEl.style.display = "none";
    if (errorEl) errorEl.style.display = "flex";
  });

  if (retryBtn) {
    retryBtn.onclick = (e) => {
      e.stopPropagation();
      if (errorEl) errorEl.style.display = "none";
      if (loadingEl) loadingEl.style.display = "flex";
      video.load();
      video.play().catch(() => {});
    };
  }

  if (fullscreenBtn) {
    fullscreenBtn.onclick = (e) => {
      e.stopPropagation();
      window.openDumplingVideoTheater();
    };
  }
};

window.openDumplingVideoTheater = function() {
  const modal = document.getElementById("video-theater-modal");
  const screen = document.getElementById("video-theater-screen");
  const mainVideo = document.getElementById("dumpling-prep-video");
  if (!modal || !screen) return;

  let currentTime = 0;
  if (mainVideo) {
    currentTime = mainVideo.currentTime;
    mainVideo.pause();
  }

  screen.innerHTML = `
    <video 
      id="theater-dumpling-video" 
      src="https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/How%20to%20prepare%20half%20cooked%20dumplingsat%20home.mp4" 
      poster="https://media.eatbamboochicken.com/Bamboo%20Chicken%20Main/Bamboo-Chicken-Half-Cooked-Chicken-Dumplings.webp"
      controls 
      playsinline 
      webkit-playsinline
      autoplay
      style="width: 100%; height: 100%; object-fit: contain; background: #000;"
    ></video>
  `;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const theaterVideo = document.getElementById("theater-dumpling-video");
  if (theaterVideo) {
    theaterVideo.currentTime = currentTime;
    theaterVideo.play().catch(() => {});
  }
};

window.closeDumplingVideoTheater = function() {
  const modal = document.getElementById("video-theater-modal");
  const screen = document.getElementById("video-theater-screen");
  const theaterVideo = document.getElementById("theater-dumpling-video");
  const mainVideo = document.getElementById("dumpling-prep-video");

  let currentTime = 0;
  if (theaterVideo) {
    currentTime = theaterVideo.currentTime;
    theaterVideo.pause();
  }

  if (screen) screen.innerHTML = "";
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";

  if (mainVideo) {
    mainVideo.currentTime = currentTime;
  }
};

window.renderPromotionalFeed = function() {
  const container = document.getElementById("promo-feed-container");
  if (!container) return;

  if (!PROMOTIONAL_POSTS || PROMOTIONAL_POSTS.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: var(--color-gray); font-size: 0.88rem;">
        No active promotions at the moment. Explore our full menu for everyday favorites!
      </div>
    `;
    return;
  }

  container.innerHTML = PROMOTIONAL_POSTS.map(post => {
    if (post.type === "video") {
      return `
        <article class="promo-post-card promo-video-card" id="${post.id}">
          <header class="promo-post-header">
            <div class="promo-publisher-info">
              <div class="promo-publisher-avatar" aria-hidden="true">
                <span class="promo-avatar-text">BC</span>
              </div>
              <div class="promo-publisher-details">
                <span class="promo-publisher-name">${post.publisher || "Bamboo Chicken"}</span>
                <span class="promo-category-label">${post.tag || "Half-Cooked Dumplings"}</span>
              </div>
            </div>
            <button type="button" class="promo-card-fullscreen-btn" id="promo-video-fullscreen-btn" onclick="window.openDumplingVideoTheater()" title="Watch full screen" aria-label="Expand video full screen">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              <span>Full Screen</span>
            </button>
          </header>

          <div class="promo-post-artwork promo-video-wrapper" id="promo-video-wrapper">
            <video 
              id="dumpling-prep-video" 
              class="promo-video-element"
              src="${post.videoUrl}" 
              poster="${post.posterUrl}"
              preload="metadata"
              playsinline
              webkit-playsinline
              controls
              tabindex="0"
              aria-label="${post.title || "How to Prepare Dumplings"}"
            >
              Your browser does not support the video tag.
            </video>

            <div class="promo-video-play-overlay" id="promo-video-play-overlay">
              <button type="button" class="promo-video-play-btn" id="promo-video-play-btn" aria-label="Play preparation video">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.5">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </button>
            </div>

            <div class="promo-video-loading" id="promo-video-loading" style="display: none;" aria-live="polite">
              <div class="promo-video-spinner"></div>
              <span>Loading video...</span>
            </div>

            <div class="promo-video-error" id="promo-video-error" style="display: none;" role="alert">
              <span>Unable to load video. Please check connection.</span>
              <button type="button" class="promo-video-retry-btn" id="promo-video-retry-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                Retry
              </button>
            </div>
          </div>

          <footer class="promo-post-footer">
            <div class="promo-video-text-content">
              <h3 class="promo-video-title">${post.title || "How to Prepare Dumplings"}</h3>
            </div>
            <button type="button" class="promo-post-action-btn" onclick="switchTabToCategory('${post.actionCategory || 'dumplings'}')">
              <span>${post.actionLabel || "Explore Dumplings"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </footer>
        </article>
      `;
    }

    const hasCaption = post.caption && post.caption.trim() !== "";
    const hasAction = post.actionLabel && post.actionLabel.trim() !== "";
    const actionOnClick = post.actionCategory 
      ? `switchTabToCategory('${post.actionCategory}')` 
      : `setActiveBottomNav(document.querySelector('.bottom-nav-item[data-page=\"menu\"]'), 'menu', true)`;

    return `
      <article class="promo-post-card" id="${post.id}">
        <header class="promo-post-header">
          <div class="promo-publisher-info">
            <div class="promo-publisher-avatar" aria-hidden="true">
              <span class="promo-avatar-text">BC</span>
            </div>
            <div class="promo-publisher-details">
              <span class="promo-publisher-name">${post.publisher || "Bamboo Chicken"}</span>
              ${post.publisherBadge ? `<span class="promo-publisher-badge">${post.publisherBadge}</span>` : ""}
            </div>
          </div>
          ${post.validity ? `<span class="promo-validity-tag">${post.validity}</span>` : ""}
        </header>

        <div class="promo-post-artwork">
          <img 
            src="${post.imageUrl}" 
            alt="${post.altText || "Bamboo Chicken Promotion"}" 
            class="promo-post-img"
            loading="eager"
            decoding="async"
            referrerpolicy="no-referrer"
          >
        </div>

        <footer class="promo-post-footer">
          ${hasCaption ? `<p class="promo-post-caption">${post.caption}</p>` : ""}
          ${hasAction ? `
            <button type="button" class="promo-post-action-btn" onclick="${actionOnClick}">
              <span>${post.actionLabel}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          ` : ""}
        </footer>
      </article>
    `;
  }).join("");

  window.initDumplingVideoPlayer();
};

const CURRENT_APP_VERSION = "3.5.0";

// Play subtle pleasant chime synthesized with Web Audio API
function playOrderChime() {
  if (localStorage.getItem("bamboo_sound_alerts") === "false") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch(e) {}
}

window.playOrderChime = playOrderChime;

window.renderAccountPanel = function() {
  // Sync sound alerts toggle
  const soundToggle = document.getElementById("account-sound-toggle");
  if (soundToggle) {
    const soundPref = localStorage.getItem("bamboo_sound_alerts");
    soundToggle.checked = (soundPref !== "false");
  }

  // Sync restaurant open/closed status badge
  if (typeof window.updateRestaurantStatus === "function") {
    window.updateRestaurantStatus();
  }

  // Background silent version check
  window.checkForAppUpdates(false);
};

window.toggleAccountSoundPreference = function(enabled) {
  try {
    localStorage.setItem("bamboo_sound_alerts", enabled ? "true" : "false");
    if (enabled) {
      playOrderChime();
      showToast("Order sound alerts enabled");
    } else {
      showToast("Order sound alerts muted");
    }
  } catch(e) {}
};

function compareSemver(v1, v2) {
  const p1 = String(v1 || "0").split(".").map(n => parseInt(n, 10) || 0);
  const p2 = String(v2 || "0").split(".").map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

window.checkForAppUpdates = async function(isManual = false) {
  const statusEl = document.getElementById("account-update-status");
  const checkBtn = document.getElementById("account-check-update-btn");
  const banner = document.getElementById("account-update-notice-banner");

  if (isManual && checkBtn) {
    checkBtn.disabled = true;
    checkBtn.classList.add("checking");
    if (statusEl) {
      statusEl.textContent = "Checking...";
      statusEl.className = "account-update-status checking";
    }
  }

  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
    });

    if (!res.ok) throw new Error("Status: " + res.status);
    const data = await res.json();
    const remoteVersion = data.version || CURRENT_APP_VERSION;

    const hasNewer = compareSemver(remoteVersion, CURRENT_APP_VERSION) > 0;

    if (hasNewer) {
      if (statusEl) {
        statusEl.textContent = `Update available (v${remoteVersion})`;
        statusEl.className = "account-update-status update-ready";
      }

      if (banner) {
        banner.style.display = "flex";
        banner.innerHTML = `
          <div class="update-notice-content">
            <span class="update-notice-badge">NEW</span>
            <div class="update-notice-details">
              <strong class="update-notice-title">Version ${escapeHTML(remoteVersion)} is ready</strong>
              <p class="update-notice-desc">Menu updates & performance improvements ready to load.</p>
            </div>
          </div>
          <button type="button" class="btn-update-reload" onclick="applyAppUpdate()">Reload</button>
        `;
      }

      if (isManual) {
        showToast(`Update available (v${remoteVersion}) • Tap Reload to apply`);
      }
    } else {
      if (statusEl) {
        statusEl.textContent = `v${CURRENT_APP_VERSION} (Latest)`;
        statusEl.className = "account-update-status up-to-date";
      }
      if (banner) {
        banner.style.display = "none";
      }
      if (isManual) {
        showToast(`✓ Up to date (v${CURRENT_APP_VERSION})`);
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = `v${CURRENT_APP_VERSION}`;
      statusEl.className = "account-update-status";
    }
    if (isManual) {
      showToast("Unable to reach update server right now.");
    }
  } finally {
    if (isManual && checkBtn) {
      checkBtn.disabled = false;
      checkBtn.classList.remove("checking");
    }
  }
};

window.applyAppUpdate = function() {
  showToast("Updating application...");
  setTimeout(() => {
    window.location.reload();
  }, 300);
};

// Initialize Application after all definitions
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBambooApp);
} else {
  initBambooApp();
}
