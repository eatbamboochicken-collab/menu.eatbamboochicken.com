/**
 * Bamboo Chicken POS - Cashier Dashboard Engine
 * Connects to live Cloudflare Worker API: https://bamboo-orders-api.warstreett.workers.dev/orders
 */

const API_URL = "https://bamboo-orders-api.warstreett.workers.dev/orders";

// Live Orders Dataset (replaces dummy data)
let orders = [];

// App State
let soundEnabled = true;
let currentFilter = "all"; // "all" | "pickup" | "delivery"
let searchQuery = "";
let hasApiError = false;
let isInitialLoad = true;

// Initialize App on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  setupEventListeners();
  
  // Initial fetch on load
  fetchOrders();

  // Poll API every 5 seconds
  setInterval(() => {
    fetchOrders();
  }, 5000);
});

// Normalize API order objects into POS format
function normalizeOrder(item) {
  const rawId = item.id || item.order_id || item.order_number || item.orderId || Math.floor(1000 + Math.random() * 9000);
  const idStr = String(rawId);
  const id = idStr.startsWith("BC-") ? idStr : `BC-${idStr}`;

  const customerName = item.customer_name || item.customerName || item.name || "Walk-in Customer";
  const phone = item.customer_phone || item.phone || item.customerPhone || "";

  let orderTime = item.order_time || item.orderTime || item.created_at || item.createdAt || "Just now";
  if (typeof orderTime === 'number' || (typeof orderTime === 'string' && !isNaN(Date.parse(orderTime)))) {
    const d = new Date(orderTime);
    if (!isNaN(d.getTime())) {
      orderTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  const rawType = String(item.type || item.order_type || item.orderType || "Pickup");
  const type = rawType.toLowerCase().includes("delivery") ? "Delivery" : "Pickup";

  const paymentStatus = item.payment_status || item.paymentStatus || item.payment_state || "Paid (EcoCash)";
  const paymentState = (paymentStatus.toLowerCase().includes("pending") || item.payment_state === "pending") ? "pending" : "paid";

  let status = String(item.order_status || item.status || "new").toLowerCase().trim();
  if (!["new", "preparing", "ready", "completed"].includes(status)) {
    if (status.includes("prep")) status = "preparing";
    else if (status.includes("read")) status = "ready";
    else if (status.includes("comp") || status.includes("done")) status = "completed";
    else status = "new";
  }

  const total = parseFloat(item.total || item.total_amount || item.amount || 0);

  let items = [];
  let rawItems = item.items || item.ordered_items || item.order_items || [];
  if (typeof rawItems === 'string') {
    try {
      rawItems = JSON.parse(rawItems);
    } catch(e) {
      rawItems = [{ name: rawItems, qty: 1, price: total, options: "" }];
    }
  }
  if (Array.isArray(rawItems)) {
    items = rawItems.map(i => ({
      name: i.name || i.item_name || i.title || "Item",
      qty: parseInt(i.qty || i.quantity || 1, 10),
      price: parseFloat(i.price || i.unit_price || 0),
      options: i.options || i.special_instructions || i.notes || ""
    }));
  }

  const instructions = item.instructions || item.notes || item.special_instructions || "";

  return {
    id,
    rawId,
    customerName,
    phone,
    orderTime,
    type,
    paymentStatus,
    paymentState,
    status,
    items,
    total,
    instructions
  };
}

// Fetch orders from Cloudflare Worker API
async function fetchOrders(showToastOnSuccess = false) {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    let rawList = [];

    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && Array.isArray(data.orders)) {
      rawList = data.orders;
    } else if (data && Array.isArray(data.data)) {
      rawList = data.data;
    } else if (data && typeof data === 'object') {
      rawList = Object.values(data);
    }

    const previousCount = orders.length;
    orders = rawList.map(normalizeOrder);
    hasApiError = false;

    // Trigger audio chime on newly arrived orders after initial load
    if (!isInitialLoad && orders.length > previousCount && soundEnabled) {
      playChime();
      showToast("🔔 New order received!");
    }

    isInitialLoad = false;

    if (showToastOnSuccess) {
      showToast("Orders updated from server");
    }
  } catch (error) {
    console.error("Error fetching orders from Cloudflare Worker API:", error);
    hasApiError = true;
  } finally {
    renderDashboard();
  }
}

// Clock Updater
function initClock() {
  const clockEl = document.getElementById("pos-clock");
  if (!clockEl) return;
  
  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  update();
  setInterval(update, 1000);
}

// Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById("pos-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderDashboard();
    });
  }

  const soundBtn = document.getElementById("pos-sound-btn");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundBtn.classList.toggle("active", soundEnabled);
      showToast(soundEnabled ? "🔊 Sound alerts enabled" : "🔇 Sound alerts muted");
      if (soundEnabled) playChime();
    });
  }
}

// Filter Selection
window.setFilter = function(filter) {
  currentFilter = filter;
  document.querySelectorAll(".pos-filter-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.filter === filter);
  });
  renderDashboard();
};

// Render Dashboard (KPI Stats & Columns)
function renderDashboard() {
  renderKPIs();
  renderColumns();
}

// Calculate and render KPIs
function renderKPIs() {
  const totalSales = orders
    .filter(o => o.status === "completed" || o.status === "ready" || o.status === "preparing")
    .reduce((sum, o) => sum + o.total, 0);

  const ordersCount = orders.length;
  const prepCount = orders.filter(o => o.status === "preparing").length;
  const readyCount = orders.filter(o => o.status === "ready").length;
  const completedCount = orders.filter(o => o.status === "completed").length;

  document.getElementById("stat-sales").textContent = `$${totalSales.toFixed(2)}`;
  document.getElementById("stat-orders").textContent = ordersCount;
  document.getElementById("stat-prep").textContent = prepCount;
  document.getElementById("stat-ready").textContent = readyCount;
  document.getElementById("stat-completed").textContent = completedCount;

  // Update Column Header Badges
  document.getElementById("count-new").textContent = orders.filter(o => o.status === "new").length;
  document.getElementById("count-prep").textContent = prepCount;
  document.getElementById("count-ready").textContent = readyCount;
  document.getElementById("count-completed").textContent = completedCount;
}

// Render Kanban Columns
function renderColumns() {
  const statuses = ["new", "preparing", "ready", "completed"];

  statuses.forEach(status => {
    const columnContainer = document.getElementById(`cards-list-${status}`);
    if (!columnContainer) return;

    if (hasApiError && orders.length === 0) {
      columnContainer.innerHTML = `
        <div class="pos-empty-state" style="border-color: rgba(239, 68, 68, 0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style="color: #EF4444; font-weight: 600;">Unable to connect to server.</span>
        </div>
      `;
      return;
    }

    // Filter orders
    let filtered = orders.filter(o => o.status === status);

    if (currentFilter !== "all") {
      filtered = filtered.filter(o => o.type.toLowerCase() === currentFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchQuery) ||
        o.customerName.toLowerCase().includes(searchQuery) ||
        o.phone.toLowerCase().includes(searchQuery) ||
        o.items.some(i => i.name.toLowerCase().includes(searchQuery))
      );
    }

    if (filtered.length === 0) {
      columnContainer.innerHTML = `
        <div class="pos-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>No orders yet</span>
        </div>
      `;
      return;
    }

    columnContainer.innerHTML = filtered.map(order => createOrderCardHTML(order)).join("");
  });
}

// Generate Order Card HTML
function createOrderCardHTML(o) {
  const isNew = o.status === "new";
  const isPrep = o.status === "preparing";
  const isReady = o.status === "ready";
  const isCompleted = o.status === "completed";

  const cardClass = isNew ? "new-order" : isPrep ? "preparing-order" : isReady ? "ready-order" : "completed-order";
  const typeTagClass = o.type.toLowerCase() === "delivery" ? "tag-delivery" : "tag-pickup";
  const paymentClass = o.paymentState === "paid" ? "status-paid" : "status-pending";

  const itemsHTML = o.items.map(item => `
    <div class="pos-item-row">
      <span class="pos-item-qty">${item.qty}x</span>
      <div class="pos-item-name">
        <div>${escapeHTML(item.name)}</div>
        ${item.options ? `<div class="pos-item-options">• ${escapeHTML(item.options)}</div>` : ""}
      </div>
      <div style="font-weight: 600; color: #9CA3AF;">$${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join("");

  const instructionsHTML = o.instructions ? `
    <div class="pos-special-instructions">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8h.01"/><path d="M11 12h1v4h1"/><circle cx="12" cy="12" r="10"/></svg>
      <span>Note: ${escapeHTML(o.instructions)}</span>
    </div>
  ` : "";

  // Dynamic Action Buttons
  let actionsHTML = "";
  if (isNew) {
    actionsHTML = `
      <button class="pos-action-btn btn-accept" onclick="updateOrderStatus('${o.id}', 'preparing')">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Accept
      </button>
      <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">
        Details
      </button>
    `;
  } else if (isPrep) {
    actionsHTML = `
      <button class="pos-action-btn btn-ready" onclick="updateOrderStatus('${o.id}', 'ready')">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Mark Ready
      </button>
      <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">
        Receipt
      </button>
    `;
  } else if (isReady) {
    actionsHTML = `
      <button class="pos-action-btn btn-complete" onclick="updateOrderStatus('${o.id}', 'completed')">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        Complete Order
      </button>
      <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">
        Receipt
      </button>
    `;
  } else {
    actionsHTML = `
      <button class="pos-action-btn btn-details" style="grid-column: span 2;" onclick="openReceiptModal('${o.id}')">
        View Receipt
      </button>
    `;
  }

  return `
    <div class="pos-order-card ${cardClass}" id="card-${o.id}">
      <div class="pos-card-header">
        <div class="pos-order-id">${o.id}</div>
        <div class="pos-order-meta-group">
          <span class="pos-type-tag ${typeTagClass}">${o.type}</span>
          <span class="pos-time-badge">${o.orderTime}</span>
        </div>
      </div>

      <div class="pos-customer-row">
        <div>
          <div class="pos-customer-name">${escapeHTML(o.customerName)}</div>
          <div style="font-size: 0.75rem; color: #9CA3AF;">${escapeHTML(o.phone)}</div>
        </div>
        <div class="pos-payment-status ${paymentClass}">
          ${o.paymentStatus}
        </div>
      </div>

      <div class="pos-items-list">
        ${itemsHTML}
        ${instructionsHTML}
      </div>

      <div class="pos-card-footer">
        <span class="pos-total-label">Total Amount</span>
        <span class="pos-total-amount">$${o.total.toFixed(2)}</span>
      </div>

      <div class="pos-card-actions">
        ${actionsHTML}
      </div>
    </div>
  `;
}

// Order Status Update Handler
window.updateOrderStatus = async function(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const oldStatus = order.status;
  order.status = newStatus;

  renderDashboard();

  const statusNames = {
    preparing: "Preparing 👨‍🍳",
    ready: "Ready for Pickup 🟢",
    completed: "Completed ⚪"
  };

  showToast(`Order ${orderId} moved to ${statusNames[newStatus] || newStatus}`);
  if (soundEnabled) playChime();

  // Attempt API patch/update if backend supports it
  try {
    const rawId = order.rawId || orderId.replace(/^BC-/, '');
    await fetch(`${API_URL}/${rawId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_status: newStatus, status: newStatus })
    }).catch(() => {
      fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rawId, order_status: newStatus, status: newStatus })
      }).catch(() => {});
    });
  } catch(e) {
    // Ignore API update errors for smooth UX
  }
};

// Play Web Audio Chime
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context may be blocked before interaction
  }
}

// Show Toast Notification
function showToast(message) {
  const container = document.getElementById("pos-toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "pos-toast";
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Modal Receipts & Order Detail
window.openReceiptModal = function(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const modalBody = document.getElementById("modal-receipt-content");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="receipt-stub">
      <div class="receipt-header">
        <div class="receipt-title">BAMBOO CHICKEN</div>
        <div style="font-size: 0.8rem; margin-top: 4px;">Crispy & Juicy Fast Food</div>
        <div style="font-size: 0.75rem;">Terminal #01 • Cashier Shift</div>
      </div>

      <div class="receipt-row">
        <span>Order #:</span>
        <strong>${order.id}</strong>
      </div>
      <div class="receipt-row">
        <span>Customer:</span>
        <span>${escapeHTML(order.customerName)}</span>
      </div>
      <div class="receipt-row">
        <span>Time:</span>
        <span>${order.orderTime}</span>
      </div>
      <div class="receipt-row">
        <span>Type:</span>
        <span>${order.type}</span>
      </div>
      <div class="receipt-row">
        <span>Payment:</span>
        <span>${order.paymentStatus}</span>
      </div>

      <div class="receipt-divider"></div>

      ${order.items.map(item => `
        <div class="receipt-row">
          <span>${item.qty}x ${escapeHTML(item.name)}</span>
          <span>$${(item.price * item.qty).toFixed(2)}</span>
        </div>
      `).join("")}

      <div class="receipt-divider"></div>

      <div class="receipt-row" style="font-size: 1.1rem; font-weight: bold; margin-top: 8px;">
        <span>TOTAL AMOUNT:</span>
        <span>$${order.total.toFixed(2)}</span>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 0.75rem;">
        *** Thank you for dining with Bamboo Chicken! ***
      </div>
    </div>
  `;

  const overlay = document.getElementById("receipt-modal-overlay");
  if (overlay) overlay.classList.add("active");
};

window.closeReceiptModal = function() {
  const overlay = document.getElementById("receipt-modal-overlay");
  if (overlay) overlay.classList.remove("active");
};

window.printReceipt = function() {
  window.print();
};

// Create Test Order Modal & Simulation
window.openTestOrderModal = function() {
  const overlay = document.getElementById("test-order-modal-overlay");
  if (overlay) overlay.classList.add("active");
};

window.closeTestOrderModal = function() {
  const overlay = document.getElementById("test-order-modal-overlay");
  if (overlay) overlay.classList.remove("active");
};

window.submitTestOrder = async function(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("test-cust-name");
  const typeInput = document.getElementById("test-order-type");
  const itemInput = document.getElementById("test-item-preset");

  const name = nameInput ? nameInput.value.trim() || "Walk-in Customer" : "Walk-in Customer";
  const type = typeInput ? typeInput.value : "Pickup";
  const itemType = itemInput ? itemInput.value : "wings";

  let items = [];
  let total = 0;

  if (itemType === "wings") {
    items = [{ name: "6-Pce Crispy Spiced Wings", qty: 2, price: 8.50, options: "Extra Chili Dip" }];
    total = 17.00;
  } else if (itemType === "sadza") {
    items = [{ name: "Sadza & Beef Stew Special", qty: 2, price: 6.00, options: "Extra Gravy" }];
    total = 12.00;
  } else if (itemType === "bucket") {
    items = [
      { name: "Bamboo Family Bucket (12 Pce)", qty: 1, price: 22.00, options: "Crispy" },
      { name: "2L Coca-Cola", qty: 1, price: 2.50, options: "" }
    ];
    total = 24.50;
  } else {
    items = [{ name: "Flame-Grilled Double Burger", qty: 1, price: 9.00, options: "Cheese" }];
    total = 9.00;
  }

  const payload = {
    customer_name: name,
    customer_phone: "+263 77 " + Math.floor(100000 + Math.random() * 900000),
    type: type,
    order_type: type,
    payment_status: "Paid (EcoCash)",
    order_status: "new",
    status: "new",
    items: items,
    total_amount: total,
    total: total,
    instructions: "Generated order from POS cashier terminal."
  };

  // POST to live API endpoint if supported
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch(err) {
    // Local fallback
    const newOrder = normalizeOrder({
      id: Math.floor(1000 + Math.random() * 9000),
      ...payload
    });
    orders.unshift(newOrder);
  }

  fetchOrders();
  closeTestOrderModal();
  showToast("Order submitted!");
  if (soundEnabled) playChime();
};

// Refresh Dashboard Handler
window.refreshOrders = function() {
  fetchOrders(true);
};

// Helper: Escape HTML
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

