/**
 * Bamboo Chicken - Interactive Digital Menu Script
 * Vanilla JavaScript (ES6+)
 * Brand: Fun, Modern, Bright, Family Friendly, Premium Fast Food
 */

// Global Menu Database
const MENU_DATA = [
  // ⭐ Value Combos
  {
    id: "classic-meal",
    category: "value-combos",
    name: "Classic Meal",
    price: 5.00,
    description: "🍔 Burger • 🍗 1 Piece Chicken • 🍟 Small Chips • 🥤 FREE 50c Drink",
    comboIncludes: ["Burger", "1 Piece Chicken", "Small Chips", "FREE 50c Drink"],
    image: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?auto=format&fit=crop&w=600&q=80",
    details: "Burger, 1 piece chicken, small chips and a free 50c drink."
  },
  {
    id: "bamboo-duo",
    category: "value-combos",
    name: "Bamboo Duo",
    price: 4.00,
    description: "🍢 2 Bamboo Chicken • 🍟 Chips • 🥤 FREE 50c Drink",
    comboIncludes: ["2 Bamboo Chicken", "Chips", "FREE 50c Drink"],
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    details: "2 Bamboo Chicken sticks, chips and a free 50c drink."
  },
  {
    id: "wrap-combo",
    category: "value-combos",
    name: "Wrap Combo",
    price: 4.00,
    description: "🌯 Chicken Wrap • 🍟 Medium Chips • 💧 FREE Water",
    comboIncludes: ["Chicken Wrap", "Medium Chips", "FREE Water"],
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80",
    details: "Chicken wrap, medium chips and free bottled water."
  },
  {
    id: "shawarma-feast",
    category: "value-combos",
    name: "Shawarma Feast",
    price: 6.00,
    description: "🌯 Shawarma • 🍗 2 Chicken Pieces • 🥤 FREE Tall Drink",
    comboIncludes: ["Shawarma", "2 Chicken Pieces", "FREE Tall Drink"],
    image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80",
    details: "Shawarma, 2 chicken pieces and a free tall drink."
  },
  {
    id: "bamboo-value",
    category: "value-combos",
    name: "Bamboo Value",
    price: 3.50,
    description: "🥟 Bamboo Pie • 🍢 Bamboo Chicken • 🍟 Small Chips • 💧 FREE Water",
    comboIncludes: ["Bamboo Pie", "Bamboo Chicken", "Small Chips", "FREE Water"],
    image: "https://images.unsplash.com/photo-1601561951601-141fea956550?auto=format&fit=crop&w=600&q=80",
    details: "Bamboo pie, Bamboo Chicken stick, small chips and free bottled water."
  },
  {
    id: "fillet-combo",
    category: "value-combos",
    name: "Fillet Combo",
    price: 3.00,
    description: "🍗 Chicken Fillet • 🍟 Small Chips • 🥤 FREE Drink",
    comboIncludes: ["Chicken Fillet", "Small Chips", "FREE Drink"],
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
    details: "Chicken fillet, small chips and a free drink."
  },

  // 🍳 Breakfast
  {
    id: "egg-sandwich",
    category: "breakfast",
    name: "Egg Sandwich",
    price: 1.00,
    description: "Fried egg and lettuce on toasted bread.",
    comboIncludes: ["Fried Egg", "Fresh Lettuce", "Toasted Bread"],
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
    details: "Fried egg and lettuce on toasted bread."
  },
  {
    id: "polony-sandwich",
    category: "breakfast",
    name: "Polony Sandwich",
    price: 1.00,
    description: "Sliced polony and cheese on toasted bread.",
    comboIncludes: ["Sliced Polony", "Cheese", "Toasted Bread"],
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
    details: "Sliced polony and cheese on toasted bread."
  },

  // 🍗 Signature Chicken
  {
    id: "bamboo-chicken",
    category: "signature-chicken",
    name: "Bamboo Chicken",
    price: 1.50,
    description: "Chicken served on a bamboo stick.",
    comboIncludes: ["Grilled Bamboo Chicken Stick"],
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    details: "Chicken served on a bamboo stick."
  },
  {
    id: "one-piecer",
    category: "signature-chicken",
    name: "1 Piecer",
    price: 2.00,
    description: "1 piece of fried chicken served with chips.",
    comboIncludes: ["1 Piece Fried Chicken", "Small Chips"],
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80",
    details: "1 piece of fried chicken served with chips."
  },
  {
    id: "two-piecer",
    category: "signature-chicken",
    name: "2 Piecer",
    price: 3.50,
    description: "2 pieces of fried chicken served with chips.",
    comboIncludes: ["2 Pieces Fried Chicken", "Small Chips"],
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    details: "2 pieces of fried chicken served with chips."
  },
  {
    id: "three-piecer",
    category: "signature-chicken",
    name: "3 Piecer",
    price: 4.50,
    description: "3 pieces of fried chicken served with chips.",
    comboIncludes: ["3 Pieces Fried Chicken", "Small Chips"],
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80",
    details: "3 pieces of fried chicken served with chips."
  },
  {
    id: "eight-piece-bucket",
    category: "signature-chicken",
    name: "8 Piece Bucket",
    price: 9.00,
    description: "8 pieces of fried chicken. Chicken only.",
    comboIncludes: ["8 Pieces Fried Chicken"],
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80",
    details: "An 8-piece bucket of fried chicken. Chicken only (no chips)."
  },

  // 🍚 Rice Meals
  {
    id: "fried-rice-meal",
    category: "rice-meals",
    name: "Fried Rice Meal",
    price: 3.00,
    description: "Fried rice served with chicken nuggets and coleslaw.",
    comboIncludes: ["Fried Rice", "Chicken Nuggets", "Coleslaw"],
    image: "https://images.unsplash.com/photo-1603133872878-685f586b641d?auto=format&fit=crop&w=600&q=80",
    details: "Fried rice served with chicken nuggets and coleslaw."
  },
  {
    id: "sadza-meal",
    category: "rice-meals",
    name: "Sadza Meal",
    price: 3.00,
    description: "Sadza served with your choice of chicken or beef stew.",
    comboIncludes: ["Hot Fluffy Sadza", "Stew Choice (Chicken or Beef)"],
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    details: "Sadza served with your choice of chicken or beef stew.",
    customizable: true,
    optionType: "select-meat",
    optionLabel: "Choose Meat Option",
    options: ["Chicken", "Beef"]
  },

  // 🍔 Burgers & Wraps
  {
    id: "chicken-burger",
    category: "burgers-wraps",
    name: "Chicken Burger",
    price: 3.00,
    description: "Chicken patty with lettuce and mayonnaise on a bun.",
    comboIncludes: ["Chicken Patty", "Lettuce", "Mayonnaise", "Burger Bun"],
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
    details: "Chicken patty with lettuce and mayonnaise on a bun."
  },
  {
    id: "boss-burger",
    category: "burgers-wraps",
    name: "Boss Burger",
    price: 5.50,
    description: "Double chicken fillet burger with cheese, lettuce and sauce.",
    comboIncludes: ["2 Chicken Fillets", "Cheese", "Lettuce", "Boss Sauce", "Burger Bun"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    details: "Double chicken fillet burger with cheese, lettuce and sauce."
  },
  {
    id: "chicken-wrap",
    category: "burgers-wraps",
    name: "Chicken Wrap",
    price: 3.00,
    description: "Chicken strips, lettuce, tomatoes and dressing wrapped in a tortilla.",
    comboIncludes: ["Chicken Strips", "Lettuce & Tomatoes", "Dressing", "Tortilla Wrap"],
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80",
    details: "Chicken strips, lettuce, tomatoes and dressing wrapped in a tortilla."
  },
  {
    id: "chicken-fillet",
    category: "burgers-wraps",
    name: "Chicken Fillet",
    price: 3.00,
    description: "Chicken breast fillet.",
    comboIncludes: ["Grilled Chicken Breast Fillet"],
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
    details: "Chicken breast fillet."
  },
  {
    id: "shawarma",
    category: "burgers-wraps",
    name: "Shawarma",
    price: 3.00,
    description: "Sliced chicken wrapped in pita bread with garlic sauce.",
    comboIncludes: ["Sliced Roasted Chicken", "Garlic Sauce", "Pita Bread"],
    image: "https://images.unsplash.com/photo-1642353381622-c80f08960fa2?auto=format&fit=crop&w=600&q=80",
    details: "Sliced chicken wrapped in pita bread with garlic sauce."
  },

  // 🎋 Bamboo Specials
  {
    id: "bamboo-pie",
    category: "bamboo-specials",
    name: "Bamboo Pie",
    price: 1.50,
    description: "A savoury baked pie.",
    comboIncludes: ["Chicken & Mushroom Baked Pie"],
    image: "https://images.unsplash.com/photo-1601561951601-141fea956550?auto=format&fit=crop&w=600&q=80",
    details: "A savoury baked pie filled with chicken and mushroom."
  },
  {
    id: "chicken-bones",
    category: "bamboo-specials",
    name: "Chicken Bones",
    price: 1.50,
    description: "Seasoned chicken wing pieces and riblets.",
    comboIncludes: ["Seasoned Wing Pieces & Riblets"],
    image: "https://images.unsplash.com/photo-1585325701165-351af916e5ec?auto=format&fit=crop&w=600&q=80",
    details: "Seasoned chicken wing pieces and riblets."
  },
  {
    id: "garden-salad",
    category: "bamboo-specials",
    name: "Garden Salad",
    price: 1.50,
    description: "Mixed greens, cucumbers and tomatoes with dressing.",
    comboIncludes: ["Mixed Greens", "Cucumbers & Tomatoes", "Salad Dressing"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    details: "Mixed greens, cucumbers and tomatoes with dressing."
  },

  // 🍟 Chips
  {
    id: "small-chips",
    category: "chips",
    name: "Small Chips",
    price: 1.00,
    description: "A small portion of seasoned potato chips.",
    comboIncludes: ["Small Portion Seasoned Chips"],
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    details: "A small portion of seasoned potato chips."
  },
  {
    id: "mega-chips",
    category: "chips",
    name: "Mega Chips",
    price: 2.00,
    description: "A large portion of seasoned potato chips.",
    comboIncludes: ["Large Portion Seasoned Chips"],
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=600&q=80",
    details: "A large portion of seasoned potato chips."
  }
];

// Active State Managers
let currentCategory = "all";
let searchQuery = "";
let cart = JSON.parse(localStorage.getItem("bamboo_cart")) || [];
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

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
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
});

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
    { id: "all", name: "All Magic", icon: "✨" },
    { id: "value-combos", name: "Value Combos", icon: "⭐" },
    { id: "breakfast", name: "Breakfast", icon: "🍳" },
    { id: "signature-chicken", name: "Signature Chicken", icon: "🍗" },
    { id: "burgers-wraps", name: "Burgers & Wraps", icon: "🍔" },
    { id: "rice-meals", name: "Rice Meals", icon: "🍚" },
    { id: "bamboo-specials", name: "Bamboo Specials", icon: "🎋" },
    { id: "chips", name: "Chips", icon: "🍟" }
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
    // Category check: "all" displays everything except value-combos
    const matchesCategory = currentCategory === "all" 
      ? item.category !== "value-combos" 
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
    if (item.id === "sadza-meal") {
      quickOptionsHtml = `
        <div class="card-quick-options" onclick="event.stopPropagation()">
          <select id="card-sel-${item.id}" class="sadza-dropdown" onchange="changeSadzaMeatChoice('${item.id}', this.value)">
            <option value="Chicken">🍖 Stew: Chicken</option>
            <option value="Beef">🥩 Stew: Beef</option>
          </select>
        </div>
      `;
    }

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
  if (!item) return 1.50;
  
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
  // Save preference locally if needed, but primarily showcases active interactive state
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
  showToast(`🛒 Added ${modalCurrentQty}x ${selectedProduct.name} to your bucket!`);
  closeDetailsModal();
};

function getCategoryPill(category) {
  switch (category) {
    case "value-combos": return "⭐ VALUE COMBO";
    case "breakfast": return "🍳 BREAKFAST";
    case "signature-chicken": return "🍗 SIGNATURE CHICKEN";
    case "rice-meals": return "🍚 RICE MEALS";
    case "burgers-wraps": return "🍔 BURGERS & WRAPS";
    case "bamboo-specials": return "🎋 BAMBOO SPECIALS";
    case "chips": return "🍟 CHIPS";
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

window.saveCartAndSync = function() {
  localStorage.setItem("bamboo_cart", JSON.stringify(cart));
  syncCartUI();
};

window.openCheckoutModal = function() {
  if (cart.length === 0) {
    showToast("⚠️ Your bucket is empty! Add some delicious food first.");
    return;
  }
  
  // Close the cart sidebar to avoid overlapping UI
  closeCart();
  
  // Open Checkout Modal
  const checkoutModal = document.getElementById("checkout-modal");
  if (checkoutModal) {
    checkoutModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  
  updateCheckoutSummaries();
};

window.closeCheckoutModal = function() {
  const checkoutModal = document.getElementById("checkout-modal");
  if (checkoutModal) {
    checkoutModal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

window.setOrderMethod = function(method) {
  currentOrderMethod = method;
  
  const deliveryBtn = document.getElementById("method-btn-delivery");
  const collectionBtn = document.getElementById("method-btn-collection");
  const deliveryGroup = document.getElementById("group-delivery-address");
  const branchGroup = document.getElementById("group-collection-branch");
  const timeGroup = document.getElementById("group-collection-time");
  
  const addressInput = document.getElementById("checkout-address");
  
  if (method === "delivery") {
    deliveryBtn.classList.add("active");
    collectionBtn.classList.remove("active");
    
    deliveryGroup.style.display = "block";
    addressInput.setAttribute("required", "required");
    
    branchGroup.style.display = "none";
    timeGroup.style.display = "none";
  } else {
    collectionBtn.classList.add("active");
    deliveryBtn.classList.remove("active");
    
    deliveryGroup.style.display = "none";
    addressInput.removeAttribute("required");
    
    branchGroup.style.display = "block";
    timeGroup.style.display = "block";
  }
  
  updateCheckoutSummaries();
};

function updateCheckoutSummaries() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const deliveryFee = currentOrderMethod === "delivery" ? 3.00 : 0.00;
  const grandTotal = subtotal + deliveryFee;
  
  const modalQty = document.querySelector("#checkout-modal #checkout-summary-qty");
  const modalDelivery = document.querySelector("#checkout-modal #checkout-summary-delivery");
  const modalGrand = document.querySelector("#checkout-modal #checkout-summary-grand");
  
  if (modalQty) modalQty.textContent = totalQuantity;
  if (modalDelivery) {
    modalDelivery.textContent = deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "FREE";
  }
  if (modalGrand) {
    modalGrand.textContent = `$${grandTotal.toFixed(2)}`;
  }
}

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
    showToast("⚠️ Please enter your name.");
    if (nameInput) nameInput.focus();
    return;
  }
  if (!customerPhone) {
    showToast("⚠️ Please enter your WhatsApp number.");
    if (phoneInput) phoneInput.focus();
    return;
  }
  
  let orderDetailsPart = "";
  if (currentOrderMethod === "delivery") {
    const addressVal = addressInput ? addressInput.value.trim() : "";
    if (!addressVal) {
      showToast("⚠️ Please enter your delivery address.");
      if (addressInput) addressInput.focus();
      return;
    }
    orderDetailsPart = `• *Delivery Address:* ${addressVal}`;
  } else {
    const branchVal = branchSelect ? branchSelect.value : "";
    const timeVal = timeInput && timeInput.value.trim() ? timeInput.value.trim() : "As soon as possible";
    orderDetailsPart = `• *Collection Branch:* ${branchVal}\n• *Est. Pickup Time:* ${timeVal}`;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = currentOrderMethod === "delivery" ? 3.00 : 0.00;
  const grandTotal = subtotal + deliveryFee;
  const paymentMethodStr = currentPaymentMethod;
  const specialNotes = notesInput && notesInput.value.trim() ? notesInput.value.trim() : "";
  const specialNotesPart = specialNotes ? `\n📝 *SPECIAL INSTRUCTIONS:*\n${specialNotes}\n` : "";

  // Prepare complete JSON payload for Cloudflare Worker API
  const apiPayload = {
    customer_name: customerName,
    phone: customerPhone,
    items: cart.map(item => ({
      name: item.name,
      qty: item.quantity,
      quantity: item.quantity,
      price: item.price,
      options: item.customization || ""
    })),
    total: parseFloat(grandTotal.toFixed(2)),
    notes: specialNotes || (currentOrderMethod === "delivery" ? `Delivery: ${addressInput ? addressInput.value.trim() : ''}` : `Pickup at ${branchSelect ? branchSelect.value : ''}`),
    payment_method: paymentMethodStr,
    type: currentOrderMethod,
    order_status: "new",
    status: "new"
  };

  const submitBtn = document.querySelector("#checkout-modal .btn-submit-whatsapp") || document.getElementById("btn-submit-whatsapp");
  let originalBtnText = "";
  if (submitBtn) {
    originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
  }

  // Send complete order as JSON to POST https://bamboo-orders-api.warstreett.workers.dev/orders
  try {
    const response = await fetch("https://bamboo-orders-api.warstreett.workers.dev/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
      throw new Error(`API error: status ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to save order to Cloudflare Worker API:", error);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.innerHTML = originalBtnText;
    }
    showToast("Unable to submit order. Please try again.");
    return; // Do NOT open WhatsApp if the order was not saved
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.innerHTML = originalBtnText;
  }
  
  // Format items ordered
  let itemsFormattedList = "";
  cart.forEach(item => {
    const customText = item.customization ? ` (${item.customization})` : "";
    itemsFormattedList += `${item.quantity}x ${item.name}${customText} - $${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  // Build professional WhatsApp message
  const whatsappMessage = `🎋 *BAMBOO CHICKEN - NEW ORDER* 🎋
----------------------------------------
👤 *CUSTOMER DETAILS:*
• *Name:* ${customerName}
• *Phone:* ${customerPhone}
• *Type:* ${currentOrderMethod.toUpperCase()}
${orderDetailsPart}
• *Payment Method:* ${paymentMethodStr}

🛒 *ITEMS ORDERED:*
${itemsFormattedList}
💵 *ORDER SUMMARY:*
• *Subtotal:* $${subtotal.toFixed(2)}
• *Delivery Fee:* ${deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "FREE"}
• *Grand Total:* $${grandTotal.toFixed(2)}
${specialNotesPart}
----------------------------------------
_Order submitted via Bamboo Chicken Digital Menu_ 🍗✨`;

  // Encode URL
  const encodedText = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/263789951127?text=${encodedText}`;
  
  // Open WhatsApp in a safe, standard manner
  const anchor = document.createElement("a");
  anchor.href = whatsappUrl;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  
  // Show order success receipt screen within checkout modal
  showOrderSuccessScreen();
};

window.syncCartUI = function() {
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
  const subtotalSum = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (floatingCartQty) floatingCartQty.textContent = totalQuantity;
  if (floatingCartTotal) floatingCartTotal.textContent = `$${subtotalSum.toFixed(2)}`;
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
    
    cartSummaryQty.textContent = "0";
    cartSummarySubtotal.textContent = "$0.00";
    cartSummaryGrand.textContent = "$0.00";
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

    cartSummaryQty.textContent = totalQuantity;
    cartSummarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartSummaryGrand.textContent = `$${subtotal.toFixed(2)}`;
  }
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

  showToast(`🛒 Added ${displayName} to your bucket!`);
  openCart();
};

// Custom Toast Alert System
function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-success-icon"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    <span style="font-weight: 600;">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Clear toast after animation sequence concludes
  setTimeout(() => {
    toast.remove();
  }, 4000);
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
      const orderNum = Math.floor(Math.random() * 900) + 100;
      successOrderIdLabel.textContent = `Order #${orderNum}`;
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
      const deliveryFee = currentOrderMethod === "delivery" ? 3.00 : 0.00;
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
