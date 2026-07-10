/**
 * Bamboo Chicken - Interactive Digital Menu Script
 * Vanilla JavaScript (ES6+)
 * Brand: Fun, Modern, Bright, Family Friendly, Premium Fast Food
 */

// Global Menu Database
const MENU_DATA = [
  // 🍳 Breakfast
  {
    id: "egg-sandwich",
    category: "breakfast",
    name: "Egg Sandwich",
    price: 1.00,
    description: "Fluffy seasoned egg and fresh garnish between two toasted slices of house-baked bread.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
    details: "Wake up to magic! A beautifully fried egg, fresh crispy lettuce, and a touch of our signature house sauce on buttered, golden toast. Perfect, simple, and satisfying."
  },
  {
    id: "polony-sandwich",
    category: "breakfast",
    name: "Polony Sandwich",
    price: 1.00,
    description: "Savory, thinly sliced polony toasted sandwich with melted cheese and fresh greens.",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
    details: "A classic favorite! Slices of savory prime polony lightly seared, layered with custom condiments on freshly sliced white sandwich bread and toasted to perfection."
  },

  // 🍗 Signature Chicken
  {
    id: "bamboo-stick-chicken",
    category: "signature-chicken",
    name: "Bamboo Stick Chicken",
    price: 1.50,
    description: "Succulent, grilled chicken pieces threaded on bamboo skewers. Served without chips.",
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    details: "Our true namesake dish! Fresh chicken pieces marinated in our secret Bamboo spice blend, threaded onto traditional bamboo skewers and flame-grilled for that perfect juicy bite. Served without chips.",
    customizable: true,
    optionType: "add-chips",
    optionLabel: "Add Small Chips (+$0.50)",
    optionPrice: 0.50
  },
  {
    id: "one-piecer",
    category: "signature-chicken",
    name: "1 Piecer",
    price: 2.00,
    description: "1 piece of legendary crispy fried chicken. Includes chips.",
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80",
    details: "One huge piece of our golden, double-breaded crispy fried chicken. Crispy on the outside, incredibly juicy on the inside. Served with a piping hot side of golden chips."
  },
  {
    id: "two-piecer",
    category: "signature-chicken",
    name: "2 Piecer",
    price: 3.50,
    description: "2 pieces of legendary crispy fried chicken. Includes chips.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    details: "Double the pleasure! Two pieces of our signature golden crispy chicken, served fresh and piping hot with our freshly seasoned chips."
  },
  {
    id: "three-piecer",
    category: "signature-chicken",
    name: "3 Piecer",
    price: 4.50,
    description: "3 pieces of legendary crispy fried chicken. Includes chips.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80",
    details: "The ultimate individual feast! Three pieces of crispy-and-juicy fried chicken. Prepared with the bamboo magic spice. Accompanied by a generous serving of seasoned chips."
  },
  {
    id: "eight-piece-bucket",
    category: "signature-chicken",
    name: "8 Piece Bucket",
    price: 9.00,
    description: "A sharing bucket containing 8 premium pieces of signature chicken. Chicken only.",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80",
    details: "Gather the family or crew! An 8-piece bucket of delicious, crispy fried chicken, hand-breaded and pressure-cooked to seal in the juices. Chicken only (no chips)."
  },

  // 🍚 Rice Meals
  {
    id: "fried-rice-meal",
    category: "rice-meals",
    name: "Fried Rice Meal",
    price: 3.00,
    description: "Fragrant wok-fried rice, crispy chicken nuggets, and cool, creamy coleslaw.",
    image: "https://images.unsplash.com/photo-1603133872878-685f586b641d?auto=format&fit=crop&w=600&q=80",
    details: "A perfect fusion meal. Fragrant fried rice wok-tossed with local herbs and vegetables, paired with 5 premium golden chicken nuggets and a side of fresh, creamy house coleslaw."
  },
  {
    id: "sadza-meal",
    category: "rice-meals",
    name: "Sadza Meal",
    price: 3.00,
    description: "Traditional premium Sadza meal with delicious choice of rich Chicken or Beef stew.",
    image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    details: "Comfort food at its finest. Fluffy, steaming hot traditional Sadza served alongside a rich, slow-simmered savory gravy and leafy greens. Customise with your choice of protein.",
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
    description: "Classic golden chicken patty, custom sauces, lettuce, and warm toasted sesame buns.",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
    details: "A crowd pleaser! Crispy golden chicken breast patty topped with cool shredded lettuce, fresh tomato, and our classic mayonnaise on a toasted sesame seed bun."
  },
  {
    id: "boss-burger",
    category: "burgers-wraps",
    name: "Boss Burger",
    price: 5.50,
    description: "Huge double fillet burger with layers of cheese, specialty sauces, and fresh salad.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    details: "Be the Boss! Two premium crispy chicken breast fillets stacked high with double melted cheddar cheese, fresh sliced onions, crispy lettuce, sliced gherkins, and our secret premium Boss sauce."
  },
  {
    id: "chicken-wrap",
    category: "burgers-wraps",
    name: "Chicken Wrap",
    price: 3.00,
    description: "Crispy chicken strips, ripe tomatoes, fresh lettuce, and dressing in a warm tortilla.",
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80",
    details: "Vibrant and easy eating! Crispy tenders rolled together with crunchy green lettuce, juicy diced tomatoes, and a drizzle of cool garlic ranch dressing, all wrapped snug in a grilled flour tortilla."
  },
  {
    id: "chicken-fillet",
    category: "burgers-wraps",
    name: "Chicken Fillet",
    price: 3.00,
    description: "Premium grilled chicken breast fillet marinated in local aromatics and lemon herbs.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
    details: "Pure tender breast fillet, grilled flawlessly on our iron grid plate. Infused with freshly picked local lemon herbs, garlic, and wild spices. A high-protein, flavorful choice."
  },
  {
    id: "shawarma",
    category: "burgers-wraps",
    name: "Shawarma",
    price: 3.00,
    description: "Traditional spit-roasted chicken shawarma wrapped in warm pita with garlic spread.",
    image: "https://images.unsplash.com/photo-1642353381622-c80f08960fa2?auto=format&fit=crop&w=600&q=80",
    details: "Authentic street food vibe! Fine shavings of seasoned chicken slow-roasted on a vertical rotisserie, wrapped in Lebanese pita bread with thick toum garlic paste, crunchy pickles, and parsley onion mix."
  },

  // 🎋 Bamboo Specials
  {
    id: "bamboo-pie",
    category: "bamboo-specials",
    name: "Bamboo Pie",
    price: 1.50,
    description: "Flaky puff pastry stuffed with shredded chicken and rich creamy mushroom sauce.",
    image: "https://images.unsplash.com/photo-1601561951601-141fea956550?auto=format&fit=crop&w=600&q=80",
    details: "Baked golden-brown every single morning. A rich, buttery, flaky puff pastry shell encasing a generous, savory filling of tender shredded chicken and hot creamed forest mushrooms."
  },
  {
    id: "chicken-bones",
    category: "bamboo-specials",
    name: "Chicken Bones",
    price: 1.50,
    description: "Our famous crispy, crunchy roasted seasoned wings and riblets.",
    image: "https://images.unsplash.com/photo-1585325701165-351af916e5ec?auto=format&fit=crop&w=600&q=80",
    details: "A local legend! Savory roasted chicken frame parts and wing riblets tossed in a highly addictive sticky sweet and smoky barbecue spice dry rub. Deeply flavorful and incredibly crunchy."
  },
  {
    id: "garden-salad",
    category: "bamboo-specials",
    name: "Garden Salad",
    price: 1.50,
    description: "Crispy romaine, cucumbers, fresh cherry tomatoes, and local vinaigrette.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    details: "A light, healthy, and colorful addition to any meal. Crisp cucumbers, crunchy shredded carrots, sweet red cherry tomatoes, and mixed greens, paired with our house herb vinaigrette."
  },

  // 🍟 Chips
  {
    id: "small-chips",
    category: "chips",
    name: "Small Chips",
    price: 1.00,
    description: "A small serving of golden-brown french fries seasoned with signature spice.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    details: "Premium cut Idaho potatoes, fried to a brilliant golden crisp on the outside, fluffy on the inside. Tossed in our secret signature spiced seasoning dust."
  },
  {
    id: "mega-chips",
    category: "chips",
    name: "Mega Chips",
    price: 2.00,
    description: "A massive sharing box of hot golden fries with double magic seasoning dusting.",
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=600&q=80",
    details: "For the absolute chips lover! A gigantic bucket of our fresh, sizzling hot french fries, loaded up with double layers of our magical, salty seasoned spice mix."
  }
];

// Active State Managers
let currentCategory = "all";
let searchQuery = "";
let cart = JSON.parse(localStorage.getItem("bamboo_cart")) || [];
let selectedProduct = null;
let currentOrderMethod = "delivery"; // 'delivery' or 'collection'

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
});

// Scroll Listener for Navbar Elevation
function setupNavbarScroll() {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// Generate the horizontal scrollable Category Pill buttons
function generateCategoryPills() {
  const categories = [
    { id: "all", name: "All Magic", icon: "✨" },
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
    // Category check
    const matchesCategory = (currentCategory === "all" || item.category === currentCategory);
    
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

  // Generate and Append Cards with micro fade-in delay (Stagger animation effect)
  filteredData.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("menu-card");
    card.setAttribute("id", `menu-card-${item.id}`);

    // Map Category display names neatly
    const categoryLabel = item.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Check if the item has quick choices we want to display directly on the card
    let quickOptionsHtml = "";
    if (item.id === "bamboo-stick-chicken") {
      quickOptionsHtml = `
        <div class="card-quick-options" onclick="event.stopPropagation()">
          <label class="option-checkbox-label" for="card-opt-${item.id}">
            <input type="checkbox" id="card-opt-${item.id}" class="option-checkbox-input" onchange="toggleCardOption('${item.id}', this.checked)">
            <span>Add Small Chips</span>
          </label>
          <span class="option-total-display" id="card-opt-price-${item.id}">Total: $1.50</span>
        </div>
      `;
    } else if (item.id === "sadza-meal") {
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
        <span class="card-category-badge">${categoryLabel}</span>
        <span class="card-price-badge" id="card-badge-price-${item.id}">$${item.price.toFixed(2)}</span>
      </div>
      <div class="menu-card-details">
        <h4>${item.name}</h4>
        <p class="menu-card-description">${item.description}</p>
        ${quickOptionsHtml}
        <div class="card-actions-row">
          <button class="btn-card-secondary" onclick="openDetailsModal('${item.id}')">
            <span>Details</span>
          </button>
          <button class="btn-card-primary" onclick="addToCart('${item.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span>Add to Bucket</span>
          </button>
        </div>
      </div>
    `;

    // Append card
    menuGrid.appendChild(card);
    
    // Smooth stagger entrance effect
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 40);
  });
}

// Interactive toggle helper for Bamboo Stick Chicken on Main Card
window.toggleCardOption = function(itemId, isChecked) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  const badgePrice = document.getElementById(`card-badge-price-${itemId}`);
  const totalDisplay = document.getElementById(`card-opt-price-${itemId}`);
  
  const finalPrice = isChecked ? (item.price + item.optionPrice) : item.price;
  
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
  // Keep inputs synchronized
  if (searchInputHeader.value !== query) {
    searchInputHeader.value = query;
  }
  if (searchInputMobile.value !== query) {
    searchInputMobile.value = query;
  }
  renderMenu();
}

// Setup Event Listeners
function setupEventListeners() {
  // Search Box - Desktop header
  searchInputHeader.addEventListener("input", (e) => {
    handleSearch(e.target.value);
  });

  // Search Box - Mobile view
  searchInputMobile.addEventListener("input", (e) => {
    handleSearch(e.target.value);
  });

  // Clear Search text
  clearSearchBtn.addEventListener("click", () => {
    handleSearch("");
  });

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
  
  // Set basic content
  modalImg.src = product.image;
  modalImg.alt = product.name;
  modalTitle.textContent = product.name;
  modalCategory.textContent = product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  modalDescription.textContent = product.details || product.description;
  modalPrice.textContent = `$${product.price.toFixed(2)}`;

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

window.submitOrderToWhatsApp = function() {
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
  const paymentMethod = currentOrderMethod === "delivery" ? "Cash on Delivery" : "Cash on Collection";
  const specialNotes = notesInput && notesInput.value.trim() ? notesInput.value.trim() : "";
  const specialNotesPart = specialNotes ? `\n📝 *SPECIAL INSTRUCTIONS:*\n${specialNotes}\n` : "";
  
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
• *Payment Method:* ${paymentMethod} (USD Cash Only)

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
  
  // Clear cart, notify success & close checkout modal
  cart = [];
  saveCartAndSync();
  closeCheckoutModal();
  
  // Reset form fields
  if (nameInput) nameInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (addressInput) addressInput.value = "";
  if (timeInput) timeInput.value = "";
  if (notesInput) notesInput.value = "";
  
  showToast("🍗 Order confirmed! WhatsApp is opening to complete your message...");
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
  if (itemId === "bamboo-stick-chicken") {
    const checkbox = document.getElementById(`card-opt-${itemId}`);
    if (checkbox && checkbox.checked) {
      cartItemId = `${itemId}-chips`;
      displayName = `${item.name} (+ Chips)`;
      finalPrice = item.price + item.optionPrice;
      customizationDetails = "Includes Small Chips";
    } else {
      customizationDetails = "Without chips";
    }
  } else if (itemId === "sadza-meal") {
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
