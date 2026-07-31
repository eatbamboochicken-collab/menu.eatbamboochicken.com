/**
 * Bamboo Chicken POS - Multi-Role Dashboard Engine
 * Handles Kitchen, Cashier, and Administrator views & rider dispatching.
 */

const API_URL = "/orders";

// Live Datasets
let orders = [];
let riders = [];
let auditLogs = [];

// App State
let soundEnabled = true;
let currentFilter = "all"; // "all" | "pickup" | "delivery"
let searchQuery = "";
let hasApiError = false;
let isInitialLoad = true;
let currentRole = localStorage.getItem("bamboo_role") || "cashier"; // "kitchen" | "cashier" | "admin"
let assigningOrderId = null;

// Universal Offline Queue Processor
function queueOfflineRequest(url, method, body, headers = {}) {
  const queue = JSON.parse(localStorage.getItem("bamboo_offline_queue") || "[]");
  queue.push({
    id: `REQ-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    url,
    method,
    body,
    headers,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem("bamboo_offline_queue", JSON.stringify(queue));
  showToast("⚠️ Network offline. Change queued and will retry automatically.");
}

async function processOfflineQueue() {
  const queue = JSON.parse(localStorage.getItem("bamboo_offline_queue") || "[]");
  if (queue.length === 0) return;

  const remainingQueue = [];
  for (const reqItem of queue) {
    try {
      const res = await fetch(reqItem.url, {
        method: reqItem.method,
        headers: { "Content-Type": "application/json", ...(reqItem.headers || {}) },
        body: typeof reqItem.body === 'string' ? reqItem.body : JSON.stringify(reqItem.body)
      });
      if (!res.ok) remainingQueue.push(reqItem);
    } catch (err) {
      remainingQueue.push(reqItem);
    }
  }
  localStorage.setItem("bamboo_offline_queue", JSON.stringify(remainingQueue));
  if (remainingQueue.length < queue.length) {
    showToast("✅ Offline changes synchronized with server!");
    fetchOrders();
  }
}

window.addEventListener("online", processOfflineQueue);
setInterval(processOfflineQueue, 10000);

// Initialize App on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  setupEventListeners();
  switchRole(currentRole);

  // Initial fetches
  fetchOrders();
  fetchRiders();

  // Poll API every 4 seconds
  setInterval(() => {
    fetchOrders();
    fetchRiders();
  }, 4000);
});

// Role Switcher
window.switchRole = function(role) {
  currentRole = role;
  localStorage.setItem("bamboo_role", role);

  // Highlight active role button
  ["kitchen", "cashier", "admin"].forEach(r => {
    const btn = document.getElementById(`role-btn-${r}`);
    if (btn) btn.classList.toggle("active", r === role);
  });

  // Update role badge & buttons
  const badge = document.getElementById("role-badge");
  const deliveryPanel = document.getElementById("section-delivery-assignment");
  const auditBtn = document.getElementById("btn-audit-logs");

  if (badge) {
    if (role === "kitchen") {
      badge.textContent = "👨‍🍳 Kitchen View (Accepted, Prep, Ready Only)";
      badge.className = "pos-badge";
      badge.style.background = "rgba(253, 184, 19, 0.2)";
      badge.style.color = "#FDB813";
      badge.style.borderColor = "rgba(253, 184, 19, 0.4)";
    } else if (role === "cashier") {
      badge.textContent = "💵 Cashier Terminal (Payments, Riders, Complete)";
      badge.className = "pos-badge pos-badge-green";
      badge.style.background = "";
      badge.style.color = "";
      badge.style.borderColor = "";
    } else if (role === "admin") {
      badge.textContent = "👑 Administrator (Full Control & Logs)";
      badge.className = "pos-badge";
      badge.style.background = "rgba(239, 68, 68, 0.2)";
      badge.style.color = "#EF4444";
      badge.style.borderColor = "rgba(239, 68, 68, 0.4)";
    }
  }

  // Delivery assignment panel visible to Cashier & Admin
  if (deliveryPanel) {
    deliveryPanel.style.display = (role === "cashier" || role === "admin") ? "block" : "none";
  }

  // Audit Logs button visible to Admin only
  if (auditBtn) {
    auditBtn.style.display = (role === "admin") ? "inline-flex" : "none";
  }

  renderDashboard();
};

// Normalize API order objects into POS format
function normalizeOrder(item) {
  const rawId = item.id || item.order_id || item.order_number || item.orderId || "";
  const idStr = String(rawId);
  const id = idStr ? (idStr.startsWith("BC-") ? idStr : `BC-${idStr}`) : "BC-ORDER";

  const customerName = item.customer_name || item.customerName || item.name || "Customer";
  const phone = item.phone || item.customer_phone || item.customerPhone || "";

  let orderTime = item.order_time || item.orderTime || item.created_at || item.createdAt || "Just now";
  if (typeof orderTime === 'number' || (typeof orderTime === 'string' && !isNaN(Date.parse(orderTime)))) {
    const d = new Date(orderTime);
    if (!isNaN(d.getTime())) {
      orderTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  const rawType = String(item.type || item.order_type || item.orderType || "Pickup");
  const type = rawType.toLowerCase().includes("delivery") ? "Delivery" : "Pickup";

  let paymentStatus = String(item.payment_status || item.paymentStatus || "pending").toLowerCase().trim();
  if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
    paymentStatus = paymentStatus.includes("paid") ? "paid" : "pending";
  }

  let status = String(item.order_status || item.status || "pending").toLowerCase().trim().replace(/[\s\-]/g, "_");
  if (!["pending", "accepted", "preparing", "ready", "assigned", "picked_up", "on_the_way", "delivered", "completed", "cancelled"].includes(status)) {
    if (status.includes("prep")) status = "preparing";
    else if (status.includes("read")) status = "ready";
    else if (status.includes("assign")) status = "assigned";
    else if (status.includes("pick")) status = "picked_up";
    else if (status.includes("way")) status = "on_the_way";
    else if (status.includes("deliv")) status = "delivered";
    else if (status.includes("comp") || status.includes("done")) status = "completed";
    else if (status.includes("canc")) status = "cancelled";
    else if (status.includes("accept")) status = "accepted";
    else status = "pending";
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
    status,
    items,
    total,
    instructions,
    customerLat: item.customer_lat || null,
    customerLng: item.customer_lng || null,
    riderId: item.rider_id || null,
    rider: item.rider || null
  };
}

// Fetch orders from API
async function fetchOrders() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        "X-User-Role": currentRole,
        "X-User-Name": `${currentRole.toUpperCase()} Terminal`
      }
    });
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    let rawList = Array.isArray(data) ? data : (data.orders || data.data || []);

    const previousCount = orders.length;
    orders = rawList.map(normalizeOrder);
    hasApiError = false;

    if (!isInitialLoad && orders.length > previousCount && soundEnabled) {
      playChime();
      showToast("🔔 New live order received!");
    }
    isInitialLoad = false;
  } catch (error) {
    console.error("Error fetching orders:", error);
    hasApiError = true;
  } finally {
    renderDashboard();
  }
}

// Fetch riders list
async function fetchRiders() {
  try {
    const res = await fetch("/riders");
    if (res.ok) {
      riders = await res.json();
      renderRidersPanel();
    }
  } catch (e) {
    console.error("Failed to fetch riders:", e);
  }
}

function renderRidersPanel() {
  const container = document.getElementById("available-riders-grid");
  const statRiders = document.getElementById("stat-riders");
  if (!container) return;

  const onlineCount = riders.filter(r => r.status === "online").length;
  if (statRiders) statRiders.textContent = `${onlineCount} Online`;

  if (riders.length === 0) {
    container.innerHTML = `<div style="color:#9CA3AF; font-size:0.85rem;">No registered riders.</div>`;
    return;
  }

  container.innerHTML = riders.map(r => {
    const isOnline = r.status === "online";
    const dotClass = isOnline ? "rider-online-dot" : "rider-offline-dot";
    const statusText = isOnline ? "ONLINE" : "OFFLINE";
    const deliveriesCount = r.active_deliveries || 0;

    return `
      <div class="rider-card-mini">
        <div>
          <div style="font-weight: 800; color: #FFF; font-size: 0.9rem;">
            <span class="${dotClass}"></span> ${escapeHTML(r.name)}
          </div>
          <div style="font-size: 0.75rem; color: #9CA3AF; margin-top: 2px;">
            ${escapeHTML(r.vehicle)} • ${deliveriesCount} active
          </div>
        </div>
        <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; background: ${isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; color: ${isOnline ? '#10B981' : '#9CA3AF'};">
          ${statusText}
        </span>
      </div>
    `;
  }).join("");
}

// Clock Updater
function initClock() {
  const clockEl = document.getElementById("pos-clock");
  if (!clockEl) return;
  function update() {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  update();
  setInterval(update, 1000);
}

// Setup listeners
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

window.setFilter = function(filter) {
  currentFilter = filter;
  document.querySelectorAll(".pos-filter-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.filter === filter);
  });
  renderDashboard();
};

function renderDashboard() {
  renderKPIs();
  renderColumns();
}

function renderKPIs() {
  const totalSales = orders
    .filter(o => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const ordersCount = orders.length;
  const prepCount = orders.filter(o => o.status === "accepted" || o.status === "preparing").length;
  const readyCount = orders.filter(o => o.status === "ready" || o.status === "assigned" || o.status === "picked_up" || o.status === "on_the_way").length;
  const completedCount = orders.filter(o => o.status === "completed" || o.status === "delivered").length;

  document.getElementById("stat-sales").textContent = `$${totalSales.toFixed(2)}`;
  document.getElementById("stat-orders").textContent = ordersCount;
  document.getElementById("stat-prep").textContent = prepCount;
  document.getElementById("stat-ready").textContent = readyCount;

  document.getElementById("count-new").textContent = orders.filter(o => o.status === "pending" || o.status === "new").length;
  document.getElementById("count-prep").textContent = prepCount;
  document.getElementById("count-ready").textContent = readyCount;
  document.getElementById("count-completed").textContent = completedCount;
}

function renderColumns() {
  const columnsMap = {
    new: ["pending", "new"],
    preparing: ["accepted", "preparing"],
    ready: ["ready", "assigned", "picked_up", "on_the_way"],
    completed: ["delivered", "completed", "cancelled"]
  };

  Object.keys(columnsMap).forEach(colKey => {
    const columnContainer = document.getElementById(`cards-list-${colKey}`);
    if (!columnContainer) return;

    if (hasApiError && orders.length === 0) {
      columnContainer.innerHTML = `
        <div class="pos-empty-state" style="border-color: rgba(239, 68, 68, 0.3);">
          <span style="color: #EF4444; font-weight: 600;">Connecting to cloud server...</span>
        </div>
      `;
      return;
    }

    const validStatuses = columnsMap[colKey];
    let filtered = orders.filter(o => validStatuses.includes(o.status));

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
      columnContainer.innerHTML = `<div class="pos-empty-state"><span>No orders</span></div>`;
      return;
    }

    columnContainer.innerHTML = filtered.map(order => createOrderCardHTML(order)).join("");
  });
}

function createOrderCardHTML(o) {
  const isNew = o.status === "pending" || o.status === "new";
  const isPrep = o.status === "accepted" || o.status === "preparing";
  const isReady = o.status === "ready" || o.status === "assigned" || o.status === "picked_up" || o.status === "on_the_way";

  const cardClass = isNew ? "new-order" : isPrep ? "preparing-order" : isReady ? "ready-order" : "completed-order";
  const typeTagClass = o.type.toLowerCase() === "delivery" ? "tag-delivery" : "tag-pickup";
  const paymentClass = o.paymentStatus === "paid" ? "status-paid" : o.paymentStatus === "refunded" ? "status-pending" : "status-pending";

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
      <span>Address/Notes: ${escapeHTML(o.instructions)}</span>
    </div>
  ` : "";

  // Assigned rider tag
  let riderTag = "";
  if (o.type.toLowerCase() === "delivery") {
    const assignedRider = riders.find(r => r.id === o.riderId);
    if (assignedRider) {
      riderTag = `<div style="font-size:0.75rem; color:#10B981; margin-top:4px; font-weight:700;">🛵 Rider: ${escapeHTML(assignedRider.name)}</div>`;
    } else {
      riderTag = `<div style="font-size:0.75rem; color:#FF5A00; margin-top:4px; font-weight:700;">⚠️ Unassigned Rider</div>`;
    }
  }

  // Display status badge text
  const statusDisplayMap = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    preparing: "PREPARING",
    ready: "READY",
    assigned: "ASSIGNED",
    picked_up: "PICKED UP",
    on_the_way: "ON THE WAY",
    delivered: "DELIVERED",
    completed: "COMPLETED",
    cancelled: "CANCELLED"
  };

  const currentStatusText = statusDisplayMap[o.status] || o.status.toUpperCase();

  // Action buttons based on Role
  let actionsHTML = "";

  if (currentRole === "kitchen") {
    // Kitchen staff CAN: View, Accept Order, Preparing, Ready. NOTHING else.
    if (isNew) {
      actionsHTML = `
        <button class="pos-action-btn btn-accept" onclick="updateOrderStatus(event, '${o.id}', 'accepted')">Accept Order</button>
        <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Items</button>
      `;
    } else if (o.status === "accepted") {
      actionsHTML = `
        <button class="pos-action-btn btn-accept" onclick="updateOrderStatus(event, '${o.id}', 'preparing')">Start Cooking</button>
        <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Items</button>
      `;
    } else if (o.status === "preparing") {
      actionsHTML = `
        <button class="pos-action-btn btn-ready" onclick="updateOrderStatus(event, '${o.id}', 'ready')">Mark Ready</button>
        <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Items</button>
      `;
    } else {
      actionsHTML = `<button class="pos-action-btn btn-details" style="grid-column: span 2;" onclick="openReceiptModal('${o.id}')">View Ticket</button>`;
    }
  } else if (currentRole === "cashier") {
    // Cashier Role
    if (isNew) {
      actionsHTML = `
        <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Receipt</button>
        ${o.type.toLowerCase() === 'delivery' ? `<button class="pos-action-btn btn-accept" onclick="openAssignRiderModal('${o.id}')">Assign Rider</button>` : `<button class="pos-action-btn btn-ready" onclick="updateOrderStatus(event, '${o.id}', 'completed')">Complete</button>`}
      `;
    } else if (isPrep) {
      actionsHTML = `
        ${o.type.toLowerCase() === 'delivery' ? `<button class="pos-action-btn btn-accept" onclick="openAssignRiderModal('${o.id}')">Assign Rider</button>` : `<button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Receipt</button>`}
        <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Receipt</button>
      `;
    } else if (isReady) {
      actionsHTML = `
        <button class="pos-action-btn btn-complete" onclick="updateOrderStatus(event, '${o.id}', 'completed')">Complete Order</button>
        ${o.type.toLowerCase() === 'delivery' ? `<button class="pos-action-btn btn-details" onclick="openAssignRiderModal('${o.id}')">Reassign Rider</button>` : `<button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Receipt</button>`}
      `;
    } else {
      actionsHTML = `<button class="pos-action-btn btn-details" style="grid-column: span 2;" onclick="openReceiptModal('${o.id}')">View Receipt</button>`;
    }
  } else {
    // Admin Role: Full Access
    actionsHTML = `
      <button class="pos-action-btn btn-details" onclick="openReceiptModal('${o.id}')">Receipt</button>
      ${o.type.toLowerCase() === 'delivery' ? `<button class="pos-action-btn btn-accept" onclick="openAssignRiderModal('${o.id}')">Assign Rider</button>` : ''}
      ${o.status !== 'completed' && o.status !== 'cancelled' ? `<button class="pos-action-btn btn-complete" onclick="updateOrderStatus(event, '${o.id}', 'completed')">Complete</button>` : ''}
      ${o.status !== 'cancelled' ? `<button class="pos-action-btn btn-details" style="background:#DC2626; color:#FFF;" onclick="updateOrderStatus(event, '${o.id}', 'cancelled')">Cancel</button>` : ''}
    `;
  }

  const paymentSelectHTML = (currentRole === "cashier" || currentRole === "admin") ? `
    <select onchange="updateOrderPayment(event, '${o.id}')" style="background: #111; color: #FFF; border: 1px solid #444; border-radius: 6px; padding: 2px 6px; font-size: 0.72rem; font-weight: 700;">
      <option value="pending" ${o.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
      <option value="paid" ${o.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
      <option value="failed" ${o.paymentStatus === 'failed' ? 'selected' : ''}>Failed</option>
      <option value="refunded" ${o.paymentStatus === 'refunded' ? 'selected' : ''}>Refunded</option>
    </select>
  ` : `
    <span class="pos-payment-status ${paymentClass}">
      ${o.paymentStatus.toUpperCase()}
    </span>
  `;

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
          <div style="font-size: 0.72rem; font-weight: 800; color: #FDB813; margin-top: 2px;">
            Status: ${currentStatusText}
          </div>
          ${riderTag}
        </div>
        <div>
          ${paymentSelectHTML}
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

      <div class="pos-card-actions" style="grid-template-columns: repeat(2, 1fr);">
        ${actionsHTML}
      </div>
    </div>
  `;
}

// Assign Rider Modal
window.openAssignRiderModal = function(orderId) {
  if (currentRole === "kitchen") {
    showToast("⚠️ Kitchen role cannot assign riders.");
    return;
  }

  assigningOrderId = orderId;
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const infoEl = document.getElementById("assign-modal-order-info");
  const selectEl = document.getElementById("modal-rider-select");

  if (infoEl) {
    infoEl.innerHTML = `Order ${order.id} • ${escapeHTML(order.customerName)} ($${order.total.toFixed(2)})`;
  }

  if (selectEl) {
    selectEl.innerHTML = riders.map(r => `
      <option value="${r.id}" ${order.riderId === r.id ? 'selected' : ''}>
        ${escapeHTML(r.name)} (${r.vehicle}) - ${r.status.toUpperCase()}
      </option>
    `).join("");
  }

  const modal = document.getElementById("assign-rider-modal");
  if (modal) modal.style.display = "flex";
};

window.closeAssignRiderModal = function() {
  const modal = document.getElementById("assign-rider-modal");
  if (modal) modal.style.display = "none";
};

window.confirmRiderAssignment = async function() {
  if (!assigningOrderId) return;
  const selectEl = document.getElementById("modal-rider-select");
  const selectedRiderId = selectEl ? selectEl.value : null;
  if (!selectedRiderId) return;

  try {
    const res = await fetch("/assign-rider", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": currentRole,
        "X-User-Name": `${currentRole.toUpperCase()} Terminal`
      },
      body: JSON.stringify({ order_id: assigningOrderId, rider_id: selectedRiderId })
    });

    if (res.ok) {
      showToast("🛵 Rider assigned successfully!");
      closeAssignRiderModal();
      fetchOrders();
      fetchRiders();
    } else {
      queueOfflineRequest("/assign-rider", "POST", { order_id: assigningOrderId, rider_id: selectedRiderId }, { "X-User-Role": currentRole });
      closeAssignRiderModal();
    }
  } catch (e) {
    console.error("Failed to assign rider:", e);
    queueOfflineRequest("/assign-rider", "POST", { order_id: assigningOrderId, rider_id: selectedRiderId }, { "X-User-Role": currentRole });
    closeAssignRiderModal();
  }
};

window.updateOrderPayment = async function(evt, orderId) {
  if (currentRole === "kitchen") return;
  const newStatus = evt.target.value;

  try {
    const res = await fetch(`${API_URL}/${orderId.replace(/^BC-/, '')}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": currentRole,
        "X-User-Name": `${currentRole.toUpperCase()} Terminal`
      },
      body: JSON.stringify({ payment_status: newStatus })
    });

    if (res.ok) {
      showToast(`Payment updated to ${newStatus.toUpperCase()}`);
      fetchOrders();
    } else {
      queueOfflineRequest(`${API_URL}/${orderId.replace(/^BC-/, '')}`, "PATCH", { payment_status: newStatus }, { "X-User-Role": currentRole });
    }
  } catch (e) {
    console.error("Failed to update payment status:", e);
    queueOfflineRequest(`${API_URL}/${orderId.replace(/^BC-/, '')}`, "PATCH", { payment_status: newStatus }, { "X-User-Role": currentRole });
  }
};

window.updateOrderStatus = async function(evt, orderId, newStatus) {
  const btn = evt && evt.currentTarget ? evt.currentTarget : (evt && evt.target ? evt.target.closest('button') : null);
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Updating...";
  }

  const rawId = orderId.replace(/^BC-/, '');

  try {
    const res = await fetch(`${API_URL}/${rawId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": currentRole,
        "X-User-Name": `${currentRole.toUpperCase()} Terminal`
      },
      body: JSON.stringify({ order_status: newStatus })
    });

    if (res.ok) {
      fetchOrders();
    } else {
      queueOfflineRequest(`${API_URL}/${rawId}`, "PATCH", { order_status: newStatus }, { "X-User-Role": currentRole });
    }
  } catch (e) {
    console.error("Error updating status:", e);
    queueOfflineRequest(`${API_URL}/${rawId}`, "PATCH", { order_status: newStatus }, { "X-User-Role": currentRole });
  }
};

window.refreshOrders = function() {
  fetchOrders();
  fetchRiders();
  showToast("🔄 Syncing live orders...");
};

// Audit Logs Modal
window.openAuditLogsModal = async function() {
  if (currentRole !== "admin") return;

  const modal = document.getElementById("audit-modal-overlay");
  const listEl = document.getElementById("audit-logs-list");

  if (modal) modal.style.display = "flex";
  if (listEl) listEl.innerHTML = `<div style="color:#9CA3AF;">Loading audit log trail...</div>`;

  try {
    const res = await fetch("/audit-logs");
    if (res.ok) {
      auditLogs = await res.json();
      renderAuditLogs();
    }
  } catch (e) {
    console.error("Failed to fetch audit logs:", e);
  }
};

function renderAuditLogs() {
  const listEl = document.getElementById("audit-logs-list");
  if (!listEl) return;

  if (auditLogs.length === 0) {
    listEl.innerHTML = `<div style="color:#9CA3AF;">No audit logs recorded yet.</div>`;
    return;
  }

  listEl.innerHTML = auditLogs.map(log => `
    <div style="background: #1C1C22; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
      <div>
        <div style="font-weight: 800; color: #FFF;">
          <span style="color: var(--pos-orange);">${escapeHTML(log.order_id)}</span> • ${escapeHTML(log.action)}
        </div>
        <div style="font-size: 0.75rem; color: #9CA3AF; margin-top: 2px;">
          By <strong>${escapeHTML(log.user_name)}</strong> (${escapeHTML(log.role.toUpperCase())})
        </div>
      </div>
      <div style="font-size: 0.75rem; color: #6B7280; font-family: monospace;">
        ${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  `).join("");
}

window.closeAuditLogsModal = function() {
  const modal = document.getElementById("audit-modal-overlay");
  if (modal) modal.style.display = "none";
};

// Receipt Modal
window.openReceiptModal = function(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const content = document.getElementById("modal-receipt-content");
  if (!content) return;

  content.innerHTML = `
    <div style="font-family: monospace; font-size: 0.9rem; background: #000; color: #00FF66; padding: 16px; border-radius: 8px;">
      <div style="text-align: center; font-weight: bold;">🎋 BAMBOO CHICKEN 🎋</div>
      <div style="text-align: center; font-size: 0.8rem;">Roadport Main Branch, Harare</div>
      <hr style="border-color: #00FF66; margin: 8px 0;" />
      <div>Order ID: ${order.id}</div>
      <div>Customer: ${escapeHTML(order.customerName)} (${escapeHTML(order.phone)})</div>
      <div>Type: ${order.type.toUpperCase()}</div>
      <div>Payment: ${order.paymentStatus.toUpperCase()}</div>
      <div>Status: ${order.status.toUpperCase()}</div>
      <hr style="border-color: #00FF66; margin: 8px 0;" />
      ${order.items.map(i => `<div>${i.qty}x ${escapeHTML(i.name)} - $${(i.price * i.qty).toFixed(2)}</div>`).join("")}
      <hr style="border-color: #00FF66; margin: 8px 0;" />
      <div style="font-weight: bold; font-size: 1.1rem; text-align: right;">Total: $${order.total.toFixed(2)}</div>
    </div>
  `;

  const modal = document.getElementById("receipt-modal-overlay");
  if (modal) modal.style.display = "flex";
};

window.closeReceiptModal = function() {
  const modal = document.getElementById("receipt-modal-overlay");
  if (modal) modal.style.display = "none";
};

window.printReceipt = function() {
  window.print();
};

/* ==========================================
   ADMIN MODULE TAB SWITCHING & INVENTORY ENGINE
   ========================================== */
let currentAdminTab = "orders"; // "orders" | "inventory" | "bi" | "suppliers" | "reports"
let inventoryData = [];
let suppliersData = [];
let recipeMappingsData = [];
let currentReportData = null;

window.switchAdminTab = function(tabName) {
  currentAdminTab = tabName;

  // Update tab button active state
  document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
  const activeTabBtn = document.getElementById(`tab-${tabName}`);
  if (activeTabBtn) activeTabBtn.classList.add("active");

  // Hide all module views
  const modules = ["orders", "inventory", "bi", "suppliers", "reports"];
  modules.forEach(m => {
    const el = document.getElementById(`module-view-${m}`);
    if (el) el.style.display = (m === tabName) ? "block" : "none";
  });

  // Fetch or render module specific data
  if (tabName === "inventory") {
    fetchInventory();
    fetchSuppliers();
  } else if (tabName === "bi") {
    fetchBIData();
  } else if (tabName === "suppliers") {
    fetchSuppliers();
  } else if (tabName === "reports") {
    fetchAndRenderReport();
  }
};

/* ==========================================
   INVENTORY MANAGEMENT & LOW STOCK ALERTS
   ========================================== */
async function fetchInventory() {
  try {
    const res = await fetch("/inventory", {
      headers: { "x-user-role": currentRole }
    });
    if (res.ok) {
      inventoryData = await res.json();
      renderInventoryTable();
      checkLowStockAlerts();
    }
  } catch (err) {
    console.error("Error fetching inventory:", err);
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById("inventory-table-body");
  if (!tbody) return;

  if (!inventoryData || inventoryData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #9CA3AF; padding: 24px;">No ingredients found. Click "Add New Ingredient" to populate inventory.</td></tr>`;
    return;
  }

  tbody.innerHTML = inventoryData.map(item => {
    const qty = parseFloat(item.current_quantity || 0);
    const minQty = parseFloat(item.minimum_stock || 0);
    let badgeClass = "badge-stock-normal";
    let statusText = "OK";

    if (qty <= 0) {
      badgeClass = "badge-stock-out";
      statusText = "OUT OF STOCK";
    } else if (qty <= minQty) {
      badgeClass = "badge-stock-low";
      statusText = "LOW STOCK";
    }

    const supplier = suppliersData.find(s => String(s.id) === String(item.supplier_id));
    const supplierName = supplier ? supplier.name : (item.supplier_id || "Unassigned");

    const updatedDate = item.last_updated ? new Date(item.last_updated).toLocaleString() : "Recently";

    return `
      <tr>
        <td style="font-weight: 700; color: #9CA3AF;">#${escapeHTML(item.id)}</td>
        <td style="font-weight: 700; color: #FFF;">${escapeHTML(item.name)}</td>
        <td><span style="background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; font-size: 0.8rem;">${escapeHTML(item.category || "General")}</span></td>
        <td style="font-weight: 800; font-size: 1rem; color: #FFF;">${qty.toFixed(2)} <span style="font-size: 0.8rem; color: #9CA3AF;">${escapeHTML(item.unit)}</span></td>
        <td style="color: #9CA3AF;">${minQty.toFixed(2)} ${escapeHTML(item.unit)}</td>
        <td><span class="badge-stock ${badgeClass}">${statusText}</span></td>
        <td style="color: #D1D5DB;">${escapeHTML(supplierName)}</td>
        <td style="font-size: 0.78rem; color: #9CA3AF;">${updatedDate}</td>
        <td style="text-align: right;">
          <button type="button" class="pos-btn pos-btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="openStockModal('${escapeHTML(item.id)}')">
            📦 Restock / Adjust
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function checkLowStockAlerts() {
  const banner = document.getElementById("low-stock-alert-banner");
  if (!banner) return;

  const lowOrOutItems = inventoryData.filter(i => {
    const q = parseFloat(i.current_quantity || 0);
    const m = parseFloat(i.minimum_stock || 0);
    return q <= m;
  });

  if (lowOrOutItems.length > 0) {
    banner.style.display = "flex";
    const titleEl = document.getElementById("alert-banner-title");
    const descEl = document.getElementById("alert-banner-desc");
    if (titleEl) titleEl.textContent = `⚠️ INVENTORY ALERT: ${lowOrOutItems.length} Low / Out of Stock Ingredient(s)`;
    if (descEl) descEl.textContent = `Alerting items: ${lowOrOutItems.map(i => i.name).join(", ")}. Please restock to maintain menu availability.`;
  } else {
    banner.style.display = "none";
  }
}

/* Restock / Adjust Modal Handlers */
window.openStockModal = function(id) {
  const item = inventoryData.find(i => String(i.id) === String(id));
  if (!item) return;

  document.getElementById("stock-item-id").value = item.id;
  document.getElementById("stock-item-name").textContent = `${item.name} (Current: ${item.current_quantity} ${item.unit})`;
  document.getElementById("stock-qty-input").value = "";
  document.getElementById("stock-reason-input").value = "";
  document.getElementById("modal-inventory-stock").style.display = "flex";
};

window.closeStockModal = function() {
  document.getElementById("modal-inventory-stock").style.display = "none";
};

window.submitStockUpdate = async function() {
  const id = document.getElementById("stock-item-id").value;
  const actionType = document.getElementById("stock-action-type").value;
  const qtyInput = parseFloat(document.getElementById("stock-qty-input").value);
  const reason = document.getElementById("stock-reason-input").value.trim();

  if (isNaN(qtyInput) || qtyInput <= 0) {
    showToast("❌ Please enter a valid quantity greater than 0");
    return;
  }
  if (!reason) {
    showToast("❌ Reason or invoice notes are required for audit trail");
    return;
  }

  const item = inventoryData.find(i => String(i.id) === String(id));
  let newQuantity = qtyInput;
  if (actionType === "receive" && item) {
    newQuantity = parseFloat(item.current_quantity || 0) + qtyInput;
  }

  try {
    const res = await fetch("/inventory", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": currentRole
      },
      body: JSON.stringify({
        id,
        current_quantity: newQuantity,
        reason: `${actionType === "receive" ? "Received shipment: +" + qtyInput : "Adjusted stock level to " + newQuantity}. Note: ${reason}`
      })
    });

    if (res.ok) {
      showToast("✅ Stock level updated successfully!");
      closeStockModal();
      fetchInventory();
    } else {
      const err = await res.json();
      showToast(`❌ Update failed: ${err.error || "Permission denied"}`);
    }
  } catch (err) {
    console.error("Error updating stock:", err);
    showToast("❌ Network error while updating stock");
  }
};

/* Add New Ingredient Modal Handlers */
window.openAddInventoryModal = function() {
  if (currentRole !== "admin") {
    showToast("🔒 Administrator privileges required to create ingredients");
    return;
  }

  // Populate supplier dropdown
  const supSelect = document.getElementById("new-inv-supplier");
  if (supSelect) {
    supSelect.innerHTML = suppliersData.map(s => `<option value="${escapeHTML(s.id)}">${escapeHTML(s.name)}</option>`).join("");
  }

  document.getElementById("new-inv-name").value = "";
  document.getElementById("new-inv-category").value = "Poultry";
  document.getElementById("new-inv-unit").value = "pieces";
  document.getElementById("new-inv-qty").value = "100";
  document.getElementById("new-inv-min").value = "20";
  document.getElementById("modal-add-inventory").style.display = "flex";
};

window.closeAddInventoryModal = function() {
  document.getElementById("modal-add-inventory").style.display = "none";
};

window.submitNewInventoryItem = async function() {
  const name = document.getElementById("new-inv-name").value.trim();
  const category = document.getElementById("new-inv-category").value.trim();
  const unit = document.getElementById("new-inv-unit").value.trim();
  const qty = parseFloat(document.getElementById("new-inv-qty").value || 0);
  const min = parseFloat(document.getElementById("new-inv-min").value || 0);
  const supplier_id = document.getElementById("new-inv-supplier").value;

  if (!name) {
    showToast("❌ Ingredient name is required");
    return;
  }

  try {
    const res = await fetch("/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": currentRole
      },
      body: JSON.stringify({
        name,
        category,
        current_quantity: qty,
        unit,
        minimum_stock: min,
        supplier_id
      })
    });

    if (res.ok) {
      showToast("✅ Ingredient created successfully!");
      closeAddInventoryModal();
      fetchInventory();
    } else {
      const err = await res.json();
      showToast(`❌ Failed: ${err.error || "Permission denied"}`);
    }
  } catch (err) {
    showToast("❌ Network error creating ingredient");
  }
};

/* ==========================================
   SUPPLIER MANAGEMENT MODULE
   ========================================== */
async function fetchSuppliers() {
  try {
    const res = await fetch("/suppliers", {
      headers: { "x-user-role": currentRole }
    });
    if (res.ok) {
      suppliersData = await res.json();
      renderSuppliers();
    }
  } catch (err) {
    console.error("Error fetching suppliers:", err);
  }
}

function renderSuppliers() {
  const grid = document.getElementById("suppliers-list-grid");
  if (!grid) return;

  if (!suppliersData || suppliersData.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #9CA3AF; padding: 24px;">No suppliers registered. Click "Add New Supplier" to get started.</div>`;
    return;
  }

  grid.innerHTML = suppliersData.map(sup => `
    <div class="supplier-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <span class="supplier-card-title">${escapeHTML(sup.name)}</span>
        ${currentRole === "admin" ? `
          <div style="display: flex; gap: 6px;">
            <button type="button" class="pos-btn pos-btn-secondary" style="padding: 2px 8px; font-size: 0.75rem;" onclick="openEditSupplierModal('${escapeHTML(sup.id)}')">✏️</button>
            <button type="button" class="pos-btn pos-btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; color: #EF4444;" onclick="deleteSupplier('${escapeHTML(sup.id)}')">🗑️</button>
          </div>
        ` : ""}
      </div>
      <div class="supplier-card-meta">
        <div><strong>📞 Phone:</strong> ${escapeHTML(sup.phone || "N/A")}</div>
        <div><strong>✉️ Email:</strong> ${escapeHTML(sup.email || "N/A")}</div>
        <div><strong>📦 Items Supplied:</strong> <span style="color: var(--pos-orange); font-weight: 600;">${escapeHTML(sup.items_supplied || "General Supplies")}</span></div>
        <div style="margin-top: 4px; font-style: italic; color: #6B7280; font-size: 0.8rem;">${escapeHTML(sup.notes || "")}</div>
      </div>
    </div>
  `).join("");
}

window.openAddSupplierModal = function() {
  document.getElementById("supplier-edit-id").value = "";
  document.getElementById("supplier-modal-title").textContent = "➕ Add New Supplier";
  document.getElementById("sup-name").value = "";
  document.getElementById("sup-phone").value = "";
  document.getElementById("sup-email").value = "";
  document.getElementById("sup-items").value = "";
  document.getElementById("sup-notes").value = "";
  document.getElementById("modal-supplier").style.display = "flex";
};

window.openEditSupplierModal = function(id) {
  const sup = suppliersData.find(s => String(s.id) === String(id));
  if (!sup) return;

  document.getElementById("supplier-edit-id").value = sup.id;
  document.getElementById("supplier-modal-title").textContent = "✏️ Edit Supplier Record";
  document.getElementById("sup-name").value = sup.name || "";
  document.getElementById("sup-phone").value = sup.phone || "";
  document.getElementById("sup-email").value = sup.email || "";
  document.getElementById("sup-items").value = sup.items_supplied || "";
  document.getElementById("sup-notes").value = sup.notes || "";
  document.getElementById("modal-supplier").style.display = "flex";
};

window.closeSupplierModal = function() {
  document.getElementById("modal-supplier").style.display = "none";
};

window.submitSupplierForm = async function() {
  const id = document.getElementById("supplier-edit-id").value;
  const name = document.getElementById("sup-name").value.trim();
  const phone = document.getElementById("sup-phone").value.trim();
  const email = document.getElementById("sup-email").value.trim();
  const items_supplied = document.getElementById("sup-items").value.trim();
  const notes = document.getElementById("sup-notes").value.trim();

  if (!name) {
    showToast("❌ Supplier name is required");
    return;
  }

  const method = id ? "PATCH" : "POST";
  const bodyData = { name, phone, email, items_supplied, notes };
  if (id) bodyData.id = id;

  try {
    const res = await fetch("/suppliers", {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-user-role": currentRole
      },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      showToast(`✅ Supplier ${id ? "updated" : "added"} successfully!`);
      closeSupplierModal();
      fetchSuppliers();
    } else {
      const err = await res.json();
      showToast(`❌ Action failed: ${err.error || "Permission denied"}`);
    }
  } catch (err) {
    showToast("❌ Network error updating supplier");
  }
};

window.deleteSupplier = async function(id) {
  if (!confirm("Are you sure you want to delete this supplier?")) return;

  try {
    const res = await fetch(`/suppliers?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-user-role": currentRole }
    });

    if (res.ok) {
      showToast("🗑️ Supplier removed");
      fetchSuppliers();
    } else {
      showToast("❌ Could not delete supplier");
    }
  } catch (err) {
    showToast("❌ Network error deleting supplier");
  }
};

/* ==========================================
   MENU INGREDIENT RECIPE MAPPING MODAL
   ========================================== */
window.openRecipeModal = async function() {
  try {
    const res = await fetch("/inventory/recipes");
    if (res.ok) {
      recipeMappingsData = await res.json();
    }
  } catch (e) {}

  const selectEl = document.getElementById("recipe-menu-item-select");
  if (selectEl) {
    // Unique list of menu items from recipes and hardcoded defaults
    const itemsList = ["The Bamboo Chicken", "Chicken Wrap", "Quarter Chicken & Chips", "Value Meal Combo"];
    selectEl.innerHTML = itemsList.map(name => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join("");
    loadRecipeForSelectedItem();
  }

  document.getElementById("modal-recipe").style.display = "flex";
};

window.closeRecipeModal = function() {
  document.getElementById("modal-recipe").style.display = "none";
};

window.loadRecipeForSelectedItem = function() {
  const selectedName = document.getElementById("recipe-menu-item-select").value;
  const listContainer = document.getElementById("recipe-ingredients-list");
  if (!listContainer) return;

  const recipe = recipeMappingsData.find(r => r.menu_item_name === selectedName);
  const ingredients = recipe ? recipe.ingredients : [];

  if (ingredients.length === 0) {
    listContainer.innerHTML = `
      <div class="recipe-row" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 10px; align-items: center;">
        <select class="form-control recipe-ing-select" style="background: #222; color: #FFF; padding: 8px; border-radius: 6px; border: 1px solid #444;">
          ${inventoryData.map(i => `<option value="${escapeHTML(i.id)}">${escapeHTML(i.name)} (${escapeHTML(i.unit)})</option>`).join("")}
        </select>
        <input type="number" step="0.1" value="1" class="form-control recipe-qty-input" style="background: #222; color: #FFF; padding: 8px; border-radius: 6px; border: 1px solid #444;" placeholder="Qty">
        <button type="button" class="pos-btn pos-btn-secondary" onclick="this.parentElement.remove()" style="color: #EF4444;">✕</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = ingredients.map(ing => `
    <div class="recipe-row" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 10px; align-items: center;">
      <select class="form-control recipe-ing-select" style="background: #222; color: #FFF; padding: 8px; border-radius: 6px; border: 1px solid #444;">
        ${inventoryData.map(i => `<option value="${escapeHTML(i.id)}" ${String(i.id) === String(ing.ingredient_id) ? "selected" : ""}>${escapeHTML(i.name)} (${escapeHTML(i.unit)})</option>`).join("")}
      </select>
      <input type="number" step="0.1" value="${ing.quantity_required}" class="form-control recipe-qty-input" style="background: #222; color: #FFF; padding: 8px; border-radius: 6px; border: 1px solid #444;" placeholder="Qty">
      <button type="button" class="pos-btn pos-btn-secondary" onclick="this.parentElement.remove()" style="color: #EF4444;">✕</button>
    </div>
  `).join("");
};

window.addIngredientRowToRecipe = function() {
  const listContainer = document.getElementById("recipe-ingredients-list");
  if (!listContainer) return;

  const div = document.createElement("div");
  div.className = "recipe-row";
  div.style.cssText = "display: grid; grid-template-columns: 2fr 1fr auto; gap: 10px; align-items: center;";
  div.innerHTML = `
    <select class="form-control recipe-ing-select" style="background: #222; color: #FFF; padding: 8px; border-radius: 6px; border: 1px solid #444;">
      ${inventoryData.map(i => `<option value="${escapeHTML(i.id)}">${escapeHTML(i.name)} (${escapeHTML(i.unit)})</option>`).join("")}
    </select>
    <input type="number" step="0.1" value="1" class="form-control recipe-qty-input" style="background: #222; color: #FFF; padding: 8px; border-radius: 6px; border: 1px solid #444;" placeholder="Qty">
    <button type="button" class="pos-btn pos-btn-secondary" onclick="this.parentElement.remove()" style="color: #EF4444;">✕</button>
  `;
  listContainer.appendChild(div);
};

window.saveRecipeMapping = async function() {
  const menuItemName = document.getElementById("recipe-menu-item-select").value;
  const rows = document.querySelectorAll("#recipe-ingredients-list .recipe-row");

  const ingredients = [];
  rows.forEach(row => {
    const ingId = row.querySelector(".recipe-ing-select").value;
    const qty = parseFloat(row.querySelector(".recipe-qty-input").value || 0);
    if (ingId && qty > 0) {
      ingredients.push({ ingredient_id: ingId, quantity_required: qty });
    }
  });

  try {
    const res = await fetch("/inventory/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": currentRole
      },
      body: JSON.stringify({
        menu_item_name: menuItemName,
        ingredients
      })
    });

    if (res.ok) {
      showToast(`✅ Recipe mapped for "${menuItemName}"!`);
      closeRecipeModal();
    } else {
      showToast("❌ Failed to save recipe mapping");
    }
  } catch (err) {
    showToast("❌ Network error saving recipe");
  }
};

/* ==========================================
   BUSINESS INTELLIGENCE & ANALYTICS DASHBOARD
   ========================================== */
async function fetchBIData() {
  try {
    const res = await fetch("/reports?timeframe=today", {
      headers: { "x-user-role": currentRole }
    });
    if (res.ok) {
      const biData = await res.json();
      renderBIDashboard(biData);
    }
  } catch (err) {
    console.error("Error loading BI data:", err);
  }
}

function renderBIDashboard(data) {
  if (!data) return;

  // KPI Metrics
  const revEl = document.getElementById("bi-val-revenue");
  if (revEl) revEl.textContent = `$${parseFloat(data.total_revenue || 0).toFixed(2)}`;

  const prepEl = document.getElementById("bi-val-preptime");
  if (prepEl) prepEl.textContent = `${data.kitchen_performance?.avg_prep_time_minutes || 0} min`;

  const delivEl = document.getElementById("bi-val-delivtime");
  if (delivEl) delivEl.textContent = `${data.rider_performance?.avg_delivery_time_minutes || 0} min`;

  const popEl = document.getElementById("bi-val-popitem");
  if (popEl && data.top_menu_items && data.top_menu_items[0]) {
    popEl.textContent = `${data.top_menu_items[0].name} (${data.top_menu_items[0].count} sold)`;
  }

  const areaEl = document.getElementById("bi-val-toparea");
  if (areaEl && data.top_delivery_areas && data.top_delivery_areas[0]) {
    areaEl.textContent = `${data.top_delivery_areas[0].area} (${data.top_delivery_areas[0].orders} orders)`;
  }

  // Payment method breakdown
  const payBox = document.getElementById("bi-payment-split-box");
  if (payBox && data.payment_methods) {
    payBox.innerHTML = `
      <div style="display: flex; justify-content: space-between;">
        <span>💵 Cash on Delivery / Counter:</span>
        <strong>${data.payment_methods.cash || 0} orders</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>📱 EcoCash / Mobile Money:</span>
        <strong>${data.payment_methods.ecocash || 0} orders</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>💳 Card / Online POS:</span>
        <strong>${data.payment_methods.card || 0} orders</strong>
      </div>
    `;
  }

  // Customer Insights
  const custBox = document.getElementById("bi-customer-insights-box");
  if (custBox && data.customer_retention) {
    custBox.innerHTML = `
      <div><strong>New Customers Today:</strong> ${data.customer_retention.new_customers}</div>
      <div><strong>Repeat Customers:</strong> ${data.customer_retention.repeat_customers}</div>
      <div><strong>Retention Rate:</strong> <span style="color: #10B981; font-weight: 700;">${data.customer_retention.retention_rate_pct}%</span></div>
    `;
  }

  // Rider performance
  const riderBox = document.getElementById("bi-rider-performance-box");
  if (riderBox && data.rider_performance) {
    riderBox.innerHTML = `
      <div style="color: #FFF;"><strong>Total Deliveries Completed:</strong> ${data.rider_performance.total_completed}</div>
      <div style="color: #9CA3AF;">Active fleet response time: &lt; 3 minutes dispatch</div>
    `;
  }

  // Kitchen performance
  const kitchBox = document.getElementById("bi-kitchen-performance-box");
  if (kitchBox && data.kitchen_performance) {
    kitchBox.innerHTML = `
      <div><strong>Orders Processed:</strong> ${data.kitchen_performance.orders_processed}</div>
      <div><strong>Speed Rating:</strong> <span style="color: #10B981; font-weight: 700;">${data.kitchen_performance.speed_rating}</span></div>
    `;
  }
}

/* ==========================================
   EXECUTIVE REPORTS & PRINT / CSV EXPORT
   ========================================== */
window.fetchAndRenderReport = async function() {
  const timeframe = document.getElementById("report-timeframe-select")?.value || "today";
  try {
    const res = await fetch(`/reports?timeframe=${encodeURIComponent(timeframe)}`, {
      headers: { "x-user-role": currentRole }
    });
    if (res.ok) {
      currentReportData = await res.json();
      renderPrintableReport(currentReportData);
    }
  } catch (err) {
    console.error("Error generating report:", err);
  }
};

function renderPrintableReport(rep) {
  const box = document.getElementById("report-printable-area");
  if (!box || !rep) return;

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px;">
      <div>
        <h1 style="font-size: 1.6rem; font-weight: 800; color: #111;">🎋 BAMBOO CHICKEN RESTAURANT</h1>
        <p style="font-size: 0.9rem; color: #4B5563;">Executive Operational & Financial Performance Report</p>
      </div>
      <div style="text-align: right; font-size: 0.85rem; color: #6B7280;">
        <div><strong>Report Timeframe:</strong> ${rep.timeframe.toUpperCase()}</div>
        <div><strong>Generated At:</strong> ${new Date(rep.generated_at).toLocaleString()}</div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
      <div style="background: #F3F4F6; padding: 12px; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: #6B7280; font-weight: 700;">TOTAL REVENUE</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #059669;">$${parseFloat(rep.total_revenue).toFixed(2)}</div>
      </div>
      <div style="background: #F3F4F6; padding: 12px; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: #6B7280; font-weight: 700;">TOTAL ORDERS</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #1F2937;">${rep.total_orders}</div>
      </div>
      <div style="background: #F3F4F6; padding: 12px; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: #6B7280; font-weight: 700;">AVG. PREP TIME</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #1F2937;">${rep.kitchen_performance.avg_prep_time_minutes} min</div>
      </div>
      <div style="background: #F3F4F6; padding: 12px; border-radius: 8px;">
        <div style="font-size: 0.75rem; color: #6B7280; font-weight: 700;">COMPLETED DELIVERIES</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #1F2937;">${rep.rider_performance.total_completed}</div>
      </div>
    </div>

    <!-- Inventory Stock Summary -->
    <h3 style="font-size: 1.1rem; font-weight: 800; color: #111; margin-bottom: 8px;">🍱 Raw Material Inventory Consumption</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 24px;">
      <thead>
        <tr style="background: #E5E7EB; color: #374151;">
          <th style="padding: 8px; text-align: left;">Ingredient</th>
          <th style="padding: 8px; text-align: left;">Stock Level</th>
          <th style="padding: 8px; text-align: left;">Unit</th>
          <th style="padding: 8px; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${(rep.inventory_status || []).map(i => `
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 8px;">${escapeHTML(i.name)}</td>
            <td style="padding: 8px; font-weight: 700;">${i.current_quantity}</td>
            <td style="padding: 8px;">${escapeHTML(i.unit)}</td>
            <td style="padding: 8px; font-weight: 700; color: ${i.status === 'LOW STOCK' ? '#D97706' : (i.status === 'OUT OF STOCK' ? '#DC2626' : '#059669')};">${i.status}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div style="border-top: 1px solid #E5E7EB; pt-12; font-size: 0.8rem; color: #9CA3AF; text-align: center;">
      Bamboo Chicken Restaurant POS Operating System &bull; Confidential Executive Document
    </div>
  `;
}

window.printExecutiveReport = function() {
  window.print();
};

window.exportReportCSV = function() {
  if (!currentReportData) return;

  let csv = "Category,Metric,Value\n";
  csv += `Financial,Total Revenue,$${currentReportData.total_revenue}\n`;
  csv += `Financial,Total Orders,${currentReportData.total_orders}\n`;
  csv += `Operations,Avg Prep Time Mins,${currentReportData.kitchen_performance.avg_prep_time_minutes}\n`;
  csv += `Operations,Avg Delivery Time Mins,${currentReportData.rider_performance.avg_delivery_time_minutes}\n`;

  (currentReportData.inventory_status || []).forEach(i => {
    csv += `Inventory,${i.name},${i.current_quantity} ${i.unit} (${i.status})\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bamboo_chicken_report_${currentReportData.timeframe}_${Date.now()}.csv`;
  a.click();
  showToast("📥 CSV Export downloaded successfully");
};

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch(e) {}
}

function showToast(msg) {
  const container = document.getElementById("pos-toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "pos-toast";
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
