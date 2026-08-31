/**
 * Bamboo Chicken - Cashier Terminal Script
 * Production API Base: https://bamboo-orders-api.warstreett.workers.dev
 */

const API_BASE = "https://bamboo-orders-api.warstreett.workers.dev";
const POLL_INTERVAL_MS = 4000;
const TARGET_TIMEZONE = "Africa/Harare";

// Strict forward status rank hierarchy
const STATUS_RANK = {
  pending: 1,
  preparing: 2,
  ready: 3,
  completed: 4,
  cancelled: 5
};

let cachedOrders = [];
let knownOrderIds = new Set();
let inFlightUpdates = new Map(); // orderId -> { targetStatus, startedAt }
let confirmedStatusMap = new Map(); // orderId -> { status, confirmedAt }
let activeModalOrderId = null;
let currentAppVersion = null;
let isUpdatingApp = false;
let isFirstLoad = true;
let currentFilter = "all";
let currentMode = "today"; // 'today' or 'history'
let soundEnabled = true;
let isFetching = false;
let queuedFetchWaiters = [];

document.addEventListener("DOMContentLoaded", () => {
  initCashier();
});

function initCashier() {
  initAppVersionTracking();
  fetchOrders();
  setInterval(() => {
    fetchOrders({ force: false });
  }, POLL_INTERVAL_MS);
  setInterval(checkApplicationVersion, 45000);
}

/**
 * Initialize application version tracking to automatically detect new builds/deployments.
 */
async function initAppVersionTracking() {
  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      currentAppVersion = data.buildTime || data.version || "1.0.0";
    }
  } catch (e) {
    currentAppVersion = "1.0.0";
  }
}

/**
 * Periodically check if a newer application version has been deployed.
 * If detected and the terminal is idle (no in-flight updates), safely reloads the terminal.
 */
async function checkApplicationVersion() {
  if (inFlightUpdates.size > 0 || isUpdatingApp) return;

  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const serverVersion = data.buildTime || data.version;

    if (currentAppVersion && serverVersion && String(serverVersion) !== String(currentAppVersion)) {
      if (inFlightUpdates.size === 0 && !isUpdatingApp) {
        isUpdatingApp = true;
        console.log(`[Bamboo Terminal] New version deployed: ${serverVersion}. Updating terminal...`);
        showToast("🚀 New cashier version detected. Updating terminal...");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } else if (!currentAppVersion && serverVersion) {
      currentAppVersion = serverVersion;
    }
  } catch (e) {
    // Non-blocking check
  }
}

/**
 * Reconcile incoming server orders with local confirmed status and active in-flight PATCHes.
 * Guarantees that a stale background GET or race condition can NEVER downgrade a confirmed status,
 * while seamlessly reflecting forward status transitions made across other cashier terminals.
 */
function reconcileOrders(serverOrders) {
  if (!Array.isArray(serverOrders)) return cachedOrders;

  const processed = processOrdersData(serverOrders);
  const now = Date.now();
  const CONFIRMATION_TTL_MS = 60000;

  const reconciled = processed.map(serverOrder => {
    const oidStr = String(serverOrder.id);
    const serverNormStatus = normalizeStatus(serverOrder.order_status);
    const serverRank = STATUS_RANK[serverNormStatus] || 1;

    // 1. If an update is actively in flight for this order, preserve target status
    if (inFlightUpdates.has(oidStr)) {
      const inFlight = inFlightUpdates.get(oidStr);
      return {
        ...serverOrder,
        order_status: inFlight.targetStatus
      };
    }

    // 2. If we have a locally confirmed status from a recent successful PATCH on this terminal
    if (confirmedStatusMap.has(oidStr)) {
      const confirmed = confirmedStatusMap.get(oidStr);
      const confirmedNorm = normalizeStatus(confirmed.status);
      const confirmedRank = STATUS_RANK[confirmedNorm] || 1;
      const isFreshConfirmation = (now - (confirmed.confirmedAt || 0)) < CONFIRMATION_TTL_MS;

      // If server rank is equal or higher (progressed locally or from another terminal)
      if (serverRank >= confirmedRank || !isFreshConfirmation) {
        confirmedStatusMap.set(oidStr, { status: serverOrder.order_status, confirmedAt: now });
        return serverOrder;
      } else {
        // Server returned older/stale status within TTL window: PRESERVE our higher confirmed status
        return {
          ...serverOrder,
          order_status: confirmed.status
        };
      }
    }

    // 3. Normal case: record server status as authoritative
    confirmedStatusMap.set(oidStr, { status: serverOrder.order_status, confirmedAt: now });
    return serverOrder;
  });

  return reconciled;
}

// Fetch Orders from Cloudflare Worker + D1 with anti-stale cache busting
async function fetchOrders({ force = false } = {}) {
  if (isFetching) {
    if (force) {
      return new Promise(resolve => queuedFetchWaiters.push(resolve)).then(() => fetchOrders({ force: false }));
    }
    return;
  }

  isFetching = true;
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  try {
    const res = await fetch(`${API_BASE}/orders?_t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache" }
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response format from Worker");
    }

    if (statusDot) statusDot.className = "dot";
    if (statusText) statusText.textContent = "Connected to D1";

    let hasNewOrder = false;
    const currentBatchIds = new Set();

    data.forEach(order => {
      const oid = String(order.id);
      currentBatchIds.add(oid);

      if (!isFirstLoad && !knownOrderIds.has(oid)) {
        hasNewOrder = true;
      }
    });

    knownOrderIds = currentBatchIds;

    if (hasNewOrder && soundEnabled) {
      playNewOrderChime();
      showToast("🔔 New Order Received!");
    }

    isFirstLoad = false;
    cachedOrders = reconcileOrders(data);
    updateCounts();
    renderOrdersUI();

  } catch (err) {
    console.error("Cashier fetch error:", err);

    if (statusDot) statusDot.className = "dot error";
    if (statusText) statusText.textContent = "Connection problem";

    if (cachedOrders.length === 0) {
      renderErrorState("Connection problem - unable to reach order server.");
    }
  } finally {
    isFetching = false;
    const waiters = queuedFetchWaiters.splice(0, queuedFetchWaiters.length);
    waiters.forEach(fn => fn());
  }
}

window.fetchOrdersManual = async function() {
  showToast("🔄 Syncing with D1...");
  await fetchOrders({ force: true });
};

window.toggleSoundAlert = function() {
  soundEnabled = !soundEnabled;
  const soundIcon = document.getElementById("sound-icon");
  const btn = document.getElementById("btn-toggle-sound");

  if (soundEnabled) {
    if (soundIcon) soundIcon.textContent = "🔔";
    if (btn) btn.innerHTML = '<span id="sound-icon">🔔</span> Sound: ON';
    playNewOrderChime();
  } else {
    if (soundIcon) soundIcon.textContent = "🔕";
    if (btn) btn.innerHTML = '<span id="sound-icon">🔕</span> Sound: OFF';
  }
};

window.switchView = function(mode) {
  currentMode = mode;
  const btnToday = document.getElementById("btn-view-today");
  const btnHistory = document.getElementById("btn-view-history");
  const dateWrap = document.getElementById("history-date-wrap");
  const summaryBar = document.getElementById("summary-bar");

  if (mode === "today") {
    if (btnToday) { btnToday.style.background = "#FDB813"; btnToday.style.color = "#121214"; }
    if (btnHistory) { btnHistory.style.background = "transparent"; btnHistory.style.color = "#9CA3AF"; }
    if (dateWrap) dateWrap.style.display = "none";
    if (summaryBar) summaryBar.style.display = "grid";
  } else {
    if (btnToday) { btnToday.style.background = "transparent"; btnToday.style.color = "#9CA3AF"; }
    if (btnHistory) { btnHistory.style.background = "#FDB813"; btnHistory.style.color = "#121214"; }
    if (dateWrap) dateWrap.style.display = "flex";
    if (summaryBar) summaryBar.style.display = "none";
  }

  updateCounts();
  renderOrdersUI();
};

window.clearHistoryDateFilter = function() {
  const picker = document.getElementById("history-date-picker");
  if (picker) picker.value = "";
  renderOrdersUI();
};

window.shiftHistoryDate = function(delta) {
  const picker = document.getElementById("history-date-picker");
  if (!picker) return;

  let baseDateStr = picker.value;
  if (!baseDateStr) {
    baseDateStr = getTodayLocalDateStr();
  }

  const parts = baseDateStr.split("-");
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    picker.value = `${y}-${m}-${day}`;
  }

  renderOrdersUI();
};

window.setFilter = function(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filter-tab").forEach(tab => {
    if (tab.getAttribute("data-filter") === filter) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  renderOrdersUI();
};

/**
 * Utility functions for Date & Daily BC Sequence Numbers
 */
function getLocalDateStr(dateInput) {
  if (!dateInput) return "";
  try {
    const str = String(dateInput).trim();
    const isoStr = str.includes("T") ? str : str.replace(" ", "T") + (str.includes("Z") ? "" : "Z");
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) {
      return str.substring(0, 10);
    }
    return d.toLocaleDateString("en-CA", { timeZone: TARGET_TIMEZONE });
  } catch (e) {
    return String(dateInput).substring(0, 10);
  }
}

function getTodayLocalDateStr() {
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: TARGET_TIMEZONE });
  } catch (e) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Process raw D1 orders:
 * 1. Groups all orders by calendar date (YYYY-MM-DD in Africa/Harare).
 * 2. Assigns sequence index per date (BC-01, BC-02, etc.) sorted chronologically ascending by creation time.
 * 3. Preserves original D1 database ID (order.id) intact.
 */
function processOrdersData(rawOrders) {
  if (!Array.isArray(rawOrders)) return [];

  const groups = {};
  rawOrders.forEach(o => {
    const dateKey = getLocalDateStr(o.created_at) || "unknown";
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(o);
  });

  Object.keys(groups).forEach(dateKey => {
    groups[dateKey].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at.includes("T") ? a.created_at : a.created_at.replace(" ", "T") + (a.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at.includes("T") ? b.created_at : b.created_at.replace(" ", "T") + (b.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });

    groups[dateKey].forEach((order, index) => {
      const seq = String(index + 1).padStart(2, '0');
      order.daily_bc_num = `BC-${seq}`;
    });
  });

  return rawOrders;
}

function getActiveOrdersForCurrentView() {
  const todayStr = getTodayLocalDateStr();

  if (currentMode === "today") {
    return cachedOrders.filter(o => getLocalDateStr(o.created_at) === todayStr);
  } else {
    // History mode
    const selectedDate = document.getElementById("history-date-picker")?.value;
    if (selectedDate) {
      return cachedOrders.filter(o => getLocalDateStr(o.created_at) === selectedDate);
    }
    // Default History View: Show ONLY orders that are NOT today's orders
    return cachedOrders.filter(o => getLocalDateStr(o.created_at) !== todayStr);
  }
}

function formatHistoryDateHeader(dateStr) {
  if (!dateStr || dateStr.length < 10) return dateStr || "UNKNOWN DATE";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    if (months[monthIdx]) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }
  return dateStr.toUpperCase();
}

function updateCounts() {
  const viewOrders = getActiveOrdersForCurrentView();

  const counts = {
    all: viewOrders.length,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0
  };

  viewOrders.forEach(o => {
    const st = normalizeStatus(o.order_status);
    if (counts[st] !== undefined) {
      counts[st]++;
    }
  });

  const setElText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Update Toolbar Tab Badges
  setElText("count-all", counts.all);
  setElText("count-pending", counts.pending);
  setElText("count-preparing", counts.preparing);
  setElText("count-ready", counts.ready);
  setElText("count-completed", counts.completed);
  setElText("count-cancelled", counts.cancelled);

  // Update Operational Summary Bar
  setElText("summary-total", counts.all);
  setElText("summary-pending", counts.pending);
  setElText("summary-preparing", counts.preparing);
  setElText("summary-ready", counts.ready);
  setElText("summary-completed", counts.completed);
  setElText("summary-cancelled", counts.cancelled);
}

window.updateOrderStatus = async function(orderId, newStatus) {
  const oidStr = String(orderId);
  if (inFlightUpdates.has(oidStr)) return;

  const order = cachedOrders.find(o => String(o.id) === oidStr);
  if (!order) {
    console.warn(`Order #${orderId} not found in cached orders.`);
    return;
  }

  const currentNormalized = normalizeStatus(order.order_status);
  const targetNormalized = normalizeStatus(newStatus);

  // Safety confirmation for destructive cancel action
  if (targetNormalized === "cancelled") {
    const bcDisplay = order.daily_bc_num || `#${order.id}`;
    if (!confirm(`Are you sure you want to CANCEL order ${bcDisplay}?`)) {
      return;
    }
  }

  // Authorized status transition map
  const ALLOWED_TRANSITIONS = {
    pending: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["completed", "cancelled"],
    completed: [],
    cancelled: []
  };

  const allowedNext = ALLOWED_TRANSITIONS[currentNormalized] || [];
  if (!allowedNext.includes(targetNormalized)) {
    console.warn(`Unauthorized status transition from ${currentNormalized} to ${targetNormalized} for order #${order.daily_bc_num || orderId}`);
    showToast(`⚠️ Cannot transition order from ${currentNormalized.toUpperCase()} to ${targetNormalized.toUpperCase()}`);
    return;
  }

  // Register in-flight update lock to prevent double clicks and race conditions
  inFlightUpdates.set(oidStr, { targetStatus: newStatus, startedAt: Date.now() });

  const oldStatus = order.order_status;

  // Optimistically update
  order.order_status = newStatus;
  updateCounts();
  renderOrdersUI();

  showToast(`Updating #${order.daily_bc_num || orderId} to ${newStatus.toUpperCase()}...`);

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_status: newStatus })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const resJson = await res.json().catch(() => ({}));
    if (resJson && resJson.success === false) {
      throw new Error(resJson.error || "Update rejected by server");
    }

    // Authoritatively record confirmed status in local memory
    confirmedStatusMap.set(oidStr, { status: newStatus, confirmedAt: Date.now() });

    showToast(`✅ Order #${order.daily_bc_num || orderId} updated to ${newStatus.toUpperCase()}`);

    // Unlock and force an authoritative fresh sync with D1
    inFlightUpdates.delete(oidStr);
    await fetchOrders({ force: true });
  } catch (err) {
    console.error("Failed to update order status:", err);
    showToast(`⚠️ Could not update order #${order.daily_bc_num || orderId}. Please check network connection.`);
    
    // Unlock and revert to previous confirmed status on error
    inFlightUpdates.delete(oidStr);
    if (order && oldStatus) {
      order.order_status = oldStatus;
      confirmedStatusMap.set(oidStr, { status: oldStatus, confirmedAt: Date.now() });
      updateCounts();
      renderOrdersUI();
    }
  }
};

window.cancelOrderPrompt = function(orderId, bcNum) {
  window.updateOrderStatus(orderId, "cancelled");
};

function normalizeStatus(statusStr) {
  if (!statusStr) return "pending";
  const s = String(statusStr).toLowerCase().trim();
  if (s === "new" || s === "pending" || s === "accepted") return "pending";
  if (s.includes("prep") || s.includes("kitchen")) return "preparing";
  if (s.includes("ready") || s.includes("assigned") || s.includes("pick") || s.includes("way")) return "ready";
  if (s.includes("comp") || s.includes("deliv") || s.includes("done")) return "completed";
  if (s.includes("canc")) return "cancelled";
  return "pending";
}

function normalizePayment(statusStr) {
  if (!statusStr) return "pending";
  const s = String(statusStr).toLowerCase().trim();
  if (s.includes("paid")) return "paid";
  if (s.includes("fail")) return "failed";
  if (s.includes("refun")) return "refunded";
  return "pending";
}

function renderOrdersUI() {
  const container = document.getElementById("orders-container");
  if (!container) return;

  const searchVal = (document.getElementById("pos-search")?.value || "").toLowerCase().trim();
  const typeFilter = document.getElementById("pos-type-filter")?.value || "all";

  let baseOrders = getActiveOrdersForCurrentView();

  let filtered = baseOrders.filter(o => {
    const normSt = normalizeStatus(o.order_status);

    if (currentFilter !== "all" && normSt !== currentFilter) {
      return false;
    }

    const oType = String(o.type || "pickup").toLowerCase();
    if (typeFilter !== "all") {
      if (typeFilter === "delivery" && !oType.includes("deliv")) return false;
      if (typeFilter === "pickup" && oType.includes("deliv")) return false;
    }

    if (searchVal) {
      const orderIdStr = String(o.id || "").toLowerCase();
      const dailyNumStr = String(o.daily_bc_num || "").toLowerCase();
      const custName = String(o.customer_name || "").toLowerCase();
      const phone = String(o.phone || "").toLowerCase();
      const notes = String(o.notes || "").toLowerCase();

      const match = orderIdStr.includes(searchVal) ||
                    dailyNumStr.includes(searchVal) ||
                    custName.includes(searchVal) ||
                    phone.includes(searchVal) ||
                    notes.includes(searchVal);
      if (!match) return false;
    }

    return true;
  });

  if (baseOrders.length === 0) {
    if (currentMode === "today") {
      renderEmptyState("No orders today.", "Customer orders placed on the web menu today will appear here automatically.");
    } else {
      renderEmptyState("No historical orders found.", "Select a different date or click 'Show All Dates' to view historical orders.");
    }
    return;
  }

  if (filtered.length === 0) {
    renderEmptyState("No matching orders.", "Try adjusting your search query or status filter tab.");
    return;
  }

  if (currentMode === "today") {
    // Sort Today's orders: Newest First
    filtered.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at.includes("T") ? a.created_at : a.created_at.replace(" ", "T") + (a.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at.includes("T") ? b.created_at : b.created_at.replace(" ", "T") + (b.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    container.className = "orders-grid";
    container.innerHTML = filtered.map(order => createOrderCardHTML(order)).join("");
  } else {
    // HISTORY MODE: Group by Date
    container.className = "history-container";

    const groups = {};
    filtered.forEach(o => {
      const dKey = getLocalDateStr(o.created_at) || "UNKNOWN";
      if (!groups[dKey]) groups[dKey] = [];
      groups[dKey].push(o);
    });

    // Sort dates descending (newest historical date first)
    const sortedDates = Object.keys(groups).sort().reverse();

    let historyHTML = sortedDates.map(dateKey => {
      const groupOrders = groups[dateKey];
      // Sort orders within date descending
      groupOrders.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at.includes("T") ? a.created_at : a.created_at.replace(" ", "T") + (a.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at.includes("T") ? b.created_at : b.created_at.replace(" ", "T") + (b.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });

      const formattedTitle = formatHistoryDateHeader(dateKey);
      const rowsHTML = groupOrders.map(o => createCompactHistoryRowHTML(o)).join("");

      return `
        <div class="history-date-group">
          <div class="history-date-header">
            <div class="history-date-title">
              📅 ${escapeHTML(formattedTitle)}
            </div>
            <div class="history-date-count">
              ${groupOrders.length} order${groupOrders.length === 1 ? '' : 's'}
            </div>
          </div>
          <div class="history-orders-list">
            ${rowsHTML}
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = historyHTML;
  }

  // Live synchronize open modal with latest production state
  if (activeModalOrderId) {
    const modal = document.getElementById("order-details-modal");
    if (modal && modal.classList.contains("active")) {
      renderModalContent(activeModalOrderId);
    }
  }
}

function createCompactHistoryRowHTML(order) {
  const dailyBcNum = order.daily_bc_num || `BC-${order.id}`;
  const rawStatus = normalizeStatus(order.order_status);
  const isDelivery = String(order.type || "").toLowerCase().includes("deliv");
  const grandTotal = parseFloat(order.total || 0);

  let timeFormatted = "";
  if (order.created_at) {
    try {
      const isoStr = order.created_at.includes("T") ? order.created_at : order.created_at.replace(" ", "T") + (order.created_at.includes("Z") ? "" : "Z");
      const d = new Date(isoStr);
      timeFormatted = d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TARGET_TIMEZONE });
    } catch(e) {
      timeFormatted = order.created_at;
    }
  }

  return `
    <div class="history-order-row" onclick="openOrderDetailsModal(${order.id})">
      <div class="row-left">
        <span class="row-bc-num">#${escapeHTML(dailyBcNum)}</span>
        <span class="row-time">⏰ ${escapeHTML(timeFormatted)}</span>
        <span class="row-customer">👤 ${escapeHTML(order.customer_name || 'Customer')}</span>
        <span class="row-phone">📞 ${escapeHTML(order.phone || 'No phone')}</span>
        <span class="order-type-badge ${isDelivery ? 'type-delivery' : 'type-pickup'}" style="font-size: 0.72rem; padding: 2px 8px;">
          ${isDelivery ? '🛵 Delivery' : '🛍️ Pickup'}
        </span>
      </div>
      <div class="row-right">
        <span class="row-total">$${grandTotal.toFixed(2)}</span>
        <span class="badge-status badge-${rawStatus}">${rawStatus.toUpperCase()}</span>
        <button type="button" class="btn-pos" style="font-size: 0.78rem; padding: 4px 10px;" onclick="event.stopPropagation(); openOrderDetailsModal(${order.id})">
          👁️ Details
        </button>
      </div>
    </div>
  `;
}

window.openOrderDetailsModal = function(orderId) {
  activeModalOrderId = String(orderId);
  renderModalContent(activeModalOrderId);
  const modal = document.getElementById("order-details-modal");
  if (modal) modal.classList.add("active");
};

window.closeOrderDetailsModal = function(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("modal-close-btn")) {
    return;
  }
  activeModalOrderId = null;
  const modal = document.getElementById("order-details-modal");
  if (modal) modal.classList.remove("active");
};

function renderModalContent(orderId) {
  const order = cachedOrders.find(o => String(o.id) === String(orderId));
  if (!order) return;

  const modal = document.getElementById("order-details-modal");
  const titleEl = document.getElementById("modal-order-title");
  const bodyEl = document.getElementById("modal-order-body");
  if (!modal || !bodyEl) return;

  const dailyBcNum = order.daily_bc_num || `BC-${order.id}`;
  const rawStatus = normalizeStatus(order.order_status);
  const rawPayment = normalizePayment(order.payment_status);
  const isDelivery = String(order.type || "").toLowerCase().includes("deliv");
  const grandTotal = parseFloat(order.total || 0);

  let fullTimeFormatted = "";
  if (order.created_at) {
    try {
      const isoStr = order.created_at.includes("T") ? order.created_at : order.created_at.replace(" ", "T") + (order.created_at.includes("Z") ? "" : "Z");
      const d = new Date(isoStr);
      fullTimeFormatted = d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TARGET_TIMEZONE }) +
                          " • " + d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric', timeZone: TARGET_TIMEZONE });
    } catch(e) {
      fullTimeFormatted = order.created_at;
    }
  }

  let itemsArray = [];
  if (Array.isArray(order.items)) {
    itemsArray = order.items;
  } else if (typeof order.items === "string") {
    try { itemsArray = JSON.parse(order.items); } catch (e) { itemsArray = []; }
  }

  const itemsHTML = itemsArray.map(item => {
    const qty = item.quantity || item.qty || 1;
    const price = parseFloat(item.price || 0);
    const itemTotal = price * qty;
    const name = escapeHTML(item.name || "Item");
    const custom = item.customization || item.options ? ` (${escapeHTML(item.customization || item.options)})` : "";

    return `
      <div class="item-row" style="padding: 6px 0; border-bottom: 1px solid #2A2A30;">
        <div class="item-qty-name">
          <span class="item-qty">${qty}x</span>
          <span>${name}${custom}</span>
        </div>
        <div class="item-price">$${itemTotal.toFixed(2)}</div>
      </div>
    `;
  }).join("");

  if (titleEl) {
    titleEl.textContent = `📋 Order #${dailyBcNum} Details`;
  }

  const isUpdating = inFlightUpdates.has(String(order.id));

  bodyEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; background: #23232A; padding: 12px; border-radius: 10px;">
      <div>
        <div style="font-size: 0.8rem; color: #9CA3AF;">Order Time</div>
        <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">${escapeHTML(fullTimeFormatted)}</div>
      </div>
      <span class="order-type-badge ${isDelivery ? 'type-delivery' : 'type-pickup'}">
        ${isDelivery ? '🛵 Delivery' : '🛍️ Pickup'}
      </span>
    </div>

    <div class="customer-info" style="margin: 0;">
      <div class="cust-name">👤 Customer: ${escapeHTML(order.customer_name || 'Customer')}</div>
      <div>📞 Phone: <a href="tel:${escapeHTML(order.phone || '')}" class="cust-phone">${escapeHTML(order.phone || 'No phone')}</a></div>
      ${order.notes ? `<div class="cust-address">📍 Address / Notes: ${escapeHTML(order.notes)}</div>` : ''}
    </div>

    <div>
      <div style="font-size: 0.82rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; margin-bottom: 8px;">Order Items</div>
      <div style="background: #121214; padding: 12px; border-radius: 10px;">
        ${itemsHTML || '<div style="color: #6B7280; font-size: 0.85rem;">No items recorded</div>'}
      </div>
    </div>

    <div class="totals-box" style="background: #23232A; padding: 12px; border-radius: 10px;">
      <div class="payment-method-tag" style="background: transparent; padding: 0;">
        <span>Payment: <strong>${escapeHTML(order.payment_method || 'Cash')}</strong></span>
        <span class="badge-status ${rawPayment === 'paid' ? 'badge-paid' : 'badge-unpaid'}">
          ${rawPayment.toUpperCase()}
        </span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
        <span style="font-size: 0.85rem; color: #9CA3AF;">Current Status:</span>
        <span class="badge-status badge-${rawStatus}">${rawStatus.toUpperCase()}</span>
      </div>

      <div class="grand-total-row">
        <span>Total Amount:</span>
        <span style="color: #FDB813;">$${grandTotal.toFixed(2)}</span>
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 8px;">
      ${rawStatus === 'pending' ? `<button type="button" class="btn-action btn-action-accept" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="closeOrderDetailsModal(); updateOrderStatus(${order.id}, 'preparing')">${isUpdating ? '⏳ ACCEPTING...' : '⚡ ACCEPT ORDER'}</button>` : ''}
      ${rawStatus === 'preparing' ? `<button type="button" class="btn-action btn-action-ready" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="closeOrderDetailsModal(); updateOrderStatus(${order.id}, 'ready')">${isUpdating ? '⏳ UPDATING...' : '✅ MARK READY'}</button>` : ''}
      ${rawStatus === 'ready' ? `<button type="button" class="btn-action btn-action-complete" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="closeOrderDetailsModal(); updateOrderStatus(${order.id}, 'completed')">${isUpdating ? '⏳ UPDATING...' : '🎉 MARK COMPLETED'}</button>` : ''}
      <button type="button" class="btn-pos" style="width: 100%; padding: 10px; font-weight: 700;" onclick="closeOrderDetailsModal()">Close Details</button>
    </div>
  `;
}

function renderEmptyState(title, desc) {
  const container = document.getElementById("orders-container");
  if (!container) return;

  container.innerHTML = `
    <div class="state-banner">
      <div class="state-icon">🍗</div>
      <div class="state-title">${escapeHTML(title)}</div>
      <div class="state-desc">${escapeHTML(desc)}</div>
    </div>
  `;
}

function renderErrorState(title) {
  const container = document.getElementById("orders-container");
  if (!container) return;

  container.innerHTML = `
    <div class="state-banner" style="border-color: rgba(239, 68, 68, 0.3);">
      <div class="state-icon">⚠️</div>
      <div class="state-title" style="color: #F87171;">${escapeHTML(title)}</div>
      <div class="state-desc">Retrying connection to production Cloudflare Worker...</div>
      <button type="button" class="btn-pos btn-pos-primary" onclick="fetchOrdersManual()" style="margin-top: 8px;">
        Retry Connection
      </button>
    </div>
  `;
}

function createOrderCardHTML(order) {
  const dailyBcNum = order.daily_bc_num || `BC-${order.id}`;
  const rawStatus = normalizeStatus(order.order_status);
  const rawPayment = normalizePayment(order.payment_status);
  const isDelivery = String(order.type || "").toLowerCase().includes("deliv");

  let itemsArray = [];
  if (Array.isArray(order.items)) {
    itemsArray = order.items;
  } else if (typeof order.items === "string") {
    try {
      itemsArray = JSON.parse(order.items);
    } catch (e) {
      itemsArray = [];
    }
  }

  const itemsHTML = itemsArray.map(item => {
    const qty = item.quantity || item.qty || 1;
    const price = parseFloat(item.price || 0);
    const itemTotal = price * qty;
    const name = escapeHTML(item.name || "Item");
    const custom = item.customization || item.options ? ` (${escapeHTML(item.customization || item.options)})` : "";

    return `
      <div class="item-row">
        <div class="item-qty-name">
          <span class="item-qty">${qty}x</span>
          <span>${name}${custom}</span>
        </div>
        <div class="item-price">$${itemTotal.toFixed(2)}</div>
      </div>
    `;
  }).join("");

  let timeFormatted = "";
  if (order.created_at) {
    try {
      const isoStr = order.created_at.includes("T") ? order.created_at : order.created_at.replace(" ", "T") + (order.created_at.includes("Z") ? "" : "Z");
      const d = new Date(isoStr);
      timeFormatted = d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TARGET_TIMEZONE }) +
                      " • " + d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric', timeZone: TARGET_TIMEZONE });
    } catch(e) {
      timeFormatted = order.created_at;
    }
  }

  const isNew = rawStatus === "pending";
  const grandTotal = parseFloat(order.total || 0);
  const isUpdating = inFlightUpdates.has(String(order.id));

  // Operational Action Area
  let actionHTML = "";
  if (rawStatus === "pending") {
    actionHTML = `
      <div class="action-area">
        <button type="button" class="btn-action btn-action-accept" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="updateOrderStatus(${order.id}, 'preparing')">
          ${isUpdating ? '⏳ ACCEPTING...' : '⚡ ACCEPT ORDER'}
        </button>
        <button type="button" class="btn-cancel-link" ${isUpdating ? 'disabled style="opacity:0.5;"' : ''} onclick="cancelOrderPrompt(${order.id}, '${dailyBcNum}')">
          Cancel Order
        </button>
      </div>
    `;
  } else if (rawStatus === "preparing") {
    actionHTML = `
      <div class="action-area">
        <button type="button" class="btn-action btn-action-ready" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="updateOrderStatus(${order.id}, 'ready')">
          ${isUpdating ? '⏳ UPDATING...' : '✅ MARK READY'}
        </button>
        <button type="button" class="btn-cancel-link" ${isUpdating ? 'disabled style="opacity:0.5;"' : ''} onclick="cancelOrderPrompt(${order.id}, '${dailyBcNum}')">
          Cancel Order
        </button>
      </div>
    `;
  } else if (rawStatus === "ready") {
    actionHTML = `
      <div class="action-area">
        <button type="button" class="btn-action btn-action-complete" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="updateOrderStatus(${order.id}, 'completed')">
          ${isUpdating ? '⏳ UPDATING...' : '🎉 MARK COMPLETED'}
        </button>
        <button type="button" class="btn-cancel-link" ${isUpdating ? 'disabled style="opacity:0.5;"' : ''} onclick="cancelOrderPrompt(${order.id}, '${dailyBcNum}')">
          Cancel Order
        </button>
      </div>
    `;
  } else if (rawStatus === "completed") {
    actionHTML = `
      <div class="action-area">
        <div class="action-done-label">✓ Order Completed</div>
      </div>
    `;
  } else if (rawStatus === "cancelled") {
    actionHTML = `
      <div class="action-area">
        <div class="action-done-label" style="color: #F87171;">✕ Order Cancelled</div>
      </div>
    `;
  }

  return `
    <div class="order-card ${isNew ? 'new-order' : ''}" id="card-${order.id}">
      <div class="card-top">
        <div>
          <div class="order-id-title">
            <span>#${escapeHTML(dailyBcNum)}</span>
          </div>
          <div class="order-time">${timeFormatted}</div>
        </div>

        <span class="order-type-badge ${isDelivery ? 'type-delivery' : 'type-pickup'}">
          ${isDelivery ? '🛵 Delivery' : '🛍️ Pickup'}
        </span>
      </div>

      <div class="customer-info">
        <div class="cust-name">👤 ${escapeHTML(order.customer_name || 'Customer')}</div>
        <div>
          📞 <a href="tel:${escapeHTML(order.phone || '')}" class="cust-phone">${escapeHTML(order.phone || 'No phone')}</a>
        </div>
        ${order.notes ? `<div class="cust-address">📍 ${escapeHTML(order.notes)}</div>` : ''}
      </div>

      <div class="items-list">
        ${itemsHTML || '<div style="color: #6B7280; font-size: 0.85rem;">No items recorded</div>'}
      </div>

      <div class="totals-box">
        <div class="payment-method-tag">
          <span>Payment: <strong>${escapeHTML(order.payment_method || 'Cash')}</strong></span>
          <span class="badge-status ${rawPayment === 'paid' ? 'badge-paid' : 'badge-unpaid'}">
            ${rawPayment.toUpperCase()}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.8rem; color: #9CA3AF;">Status:</span>
          <span class="badge-status badge-${rawStatus}">
            ${rawStatus.toUpperCase()}
          </span>
        </div>

        <div class="grand-total-row">
          <span>Total:</span>
          <span style="color: #FDB813;">$${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      ${actionHTML}
    </div>
  `;
}

function playNewOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

    osc2.frequency.setValueAtTime(293.66, ctx.currentTime);
    osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 0.5);
  } catch(e) {
    console.warn("Could not play order chime:", e);
  }
}

function showToast(message) {
  const toast = document.getElementById("pos-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
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
