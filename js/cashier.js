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
let inFlightDispatch = new Map(); // orderId -> startedAt
let confirmedDeliveryJobMap = new Map(); // orderId -> deliveryJobId
let activeModalOrderId = null;
let currentAppVersion = null;
let isUpdatingApp = false;
let isFirstLoad = true;
let currentFilter = "all";
let currentMode = "today"; // 'today' or 'history'
let soundEnabled = true;
let isFetching = false;
let queuedFetchWaiters = [];
let lastSuccessfulSyncTime = null;

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
  setInterval(updateSyncTimeDisplay, 1000);
  setInterval(updateOrderAgesLive, 15000);
}

/**
 * Update the "Last synced X sec ago" indicator in the terminal header.
 */
function updateSyncTimeDisplay() {
  const syncEl = document.getElementById("sync-time-text");
  if (!syncEl) return;

  if (!lastSuccessfulSyncTime) {
    syncEl.textContent = "Syncing...";
    return;
  }

  const elapsedSec = Math.floor((Date.now() - lastSuccessfulSyncTime) / 1000);
  if (elapsedSec < 3) {
    syncEl.textContent = "Last synced just now";
  } else if (elapsedSec < 60) {
    syncEl.textContent = `Last synced ${elapsedSec}s ago`;
  } else {
    const elapsedMin = Math.floor(elapsedSec / 60);
    syncEl.textContent = `Last synced ${elapsedMin}m ago`;
  }
}

/**
 * Periodically refreshes order age badges on active screen.
 */
function updateOrderAgesLive() {
  const ageElements = document.querySelectorAll("[data-created-at]");
  ageElements.forEach(el => {
    const createdAt = el.getAttribute("data-created-at");
    if (createdAt) {
      const ageText = getOrderAge(createdAt);
      if (ageText) {
        el.textContent = `⏱️ ${ageText}`;
      }
    }
  });
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

    // 4. Preserve locally confirmed delivery_job_id if server has not reflected it yet
    if (confirmedDeliveryJobMap.has(oidStr)) {
      if (!serverOrder.delivery_job_id) {
        serverOrder.delivery_job_id = confirmedDeliveryJobMap.get(oidStr);
      }
    } else if (serverOrder.delivery_job_id) {
      confirmedDeliveryJobMap.set(oidStr, serverOrder.delivery_job_id);
    }

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
    const res = await fetch(`${API_BASE}/orders?_t=${Date.now()}`);

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
    lastSuccessfulSyncTime = Date.now();
    updateSyncTimeDisplay();
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

window.onSourceFilterChange = function() {
  updateCounts();
  renderOrdersUI();
};

window.setSourceFilter = function(source) {
  const el = document.getElementById("pos-source-filter");
  if (el) el.value = source;
  updateCounts();
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
    // Ensure source is strictly preserved and normalized
    o.source = normalizeOrderSource(o.source);
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

/**
 * Calculate human-readable order age from creation timestamp.
 * Examples: "just now", "2 min ago", "15 min ago", "1 hr ago", "3 hrs ago"
 */
function getOrderAge(dateInput) {
  if (!dateInput) return "";
  try {
    const str = String(dateInput).trim();
    const isoStr = str.includes("T") ? str : str.replace(" ", "T") + (str.includes("Z") ? "" : "Z");
    const d = new Date(isoStr);
    const createdTime = d.getTime();
    if (isNaN(createdTime)) return "";
    const now = Date.now();
    const diffMs = Math.max(0, now - createdTime);
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return "";
  }
}

/**
 * Render the dedicated "Needs Attention" operational alert section for New/Pending orders.
 */
function renderAttentionSection() {
  const container = document.getElementById("attention-container");
  if (!container) return;

  if (currentMode !== "today") {
    container.innerHTML = "";
    return;
  }

  const todayStr = getTodayLocalDateStr();
  const todayOrders = cachedOrders.filter(o => getLocalDateStr(o.created_at) === todayStr);
  const sourceFilter = (document.getElementById("pos-source-filter")?.value || "all").toLowerCase().trim();
  let pendingOrders = todayOrders.filter(o => normalizeStatus(o.order_status) === "pending");
  if (sourceFilter !== "all") {
    pendingOrders = pendingOrders.filter(o => normalizeOrderSource(o.source) === sourceFilter);
  }

  if (pendingOrders.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Sort pending orders oldest first (orders waiting longest require immediate attention)
  pendingOrders.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at.includes("T") ? a.created_at : a.created_at.replace(" ", "T") + (a.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at.includes("T") ? b.created_at : b.created_at.replace(" ", "T") + (b.created_at.includes("Z") ? "" : "Z")).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });

  const count = pendingOrders.length;
  const countLabel = count === 1 ? "1 New Order" : `${count} New Orders`;
  
  const pillsHTML = pendingOrders.slice(0, 4).map(o => {
    const dailyBc = o.daily_bc_num || `BC-${o.id}`;
    const age = getOrderAge(o.created_at);
    const custName = escapeHTML(o.customer_name || "Customer");
    const sourceBadge = getSourceBadgeHTML(o.source);
    return `<span style="background: rgba(0,0,0,0.3); border: 1px solid rgba(253,184,19,0.35); padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: #FFFFFF; display: inline-flex; align-items: center; gap: 6px;">#${dailyBc} ${sourceBadge} (${custName}${age ? ` • ${age}` : ''})</span>`;
  }).join(" ");

  const moreBadge = count > 4 ? `<span style="font-size: 0.8rem; color: #FDB813; font-weight: 700;">+${count - 4} more</span>` : "";

  container.innerHTML = `
    <div class="attention-banner">
      <div class="attention-left">
        <div class="attention-icon-box">⚡</div>
        <div>
          <div class="attention-title">
            <span>${countLabel} Requiring Immediate Acceptance</span>
          </div>
          <div class="attention-subtitle">
            ${pillsHTML} ${moreBadge}
          </div>
        </div>
      </div>
      <div class="attention-actions">
        <button type="button" class="btn-attention-action" onclick="setFilter('pending')">
          ⚡ Focus New Orders (${count})
        </button>
      </div>
    </div>
  `;
}

function updateCounts() {
  const todayStr = getTodayLocalDateStr();
  // Today's Operational Summary Bar strictly calculates from Today's Orders dataset
  const todayOrders = cachedOrders.filter(o => getLocalDateStr(o.created_at) === todayStr);

  const todayCounts = {
    all: todayOrders.length,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0
  };

  todayOrders.forEach(o => {
    const st = normalizeStatus(o.order_status);
    if (todayCounts[st] !== undefined) {
      todayCounts[st]++;
    }
  });

  const setElText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Update Operational Summary Bar (Strictly Today's dataset)
  setElText("summary-total", todayCounts.all);
  setElText("summary-pending", todayCounts.pending);
  setElText("summary-preparing", todayCounts.preparing);
  setElText("summary-ready", todayCounts.ready);
  setElText("summary-completed", todayCounts.completed);
  setElText("summary-cancelled", todayCounts.cancelled);

  // Tab counts reflect active view (Today or History) and source filter
  const viewOrders = getActiveOrdersForCurrentView();
  const sourceFilter = (document.getElementById("pos-source-filter")?.value || "all").toLowerCase().trim();
  const filteredViewOrders = (sourceFilter === "all")
    ? viewOrders
    : viewOrders.filter(o => normalizeOrderSource(o.source) === sourceFilter);

  const tabCounts = {
    all: filteredViewOrders.length,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0
  };
  filteredViewOrders.forEach(o => {
    const st = normalizeStatus(o.order_status);
    if (tabCounts[st] !== undefined) {
      tabCounts[st]++;
    }
  });

  setElText("count-all", tabCounts.all);
  setElText("count-pending", tabCounts.pending);
  setElText("count-preparing", tabCounts.preparing);
  setElText("count-ready", tabCounts.ready);
  setElText("count-completed", tabCounts.completed);
  setElText("count-cancelled", tabCounts.cancelled);
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

/**
 * Dispatch an order to Shopystreet Riders via Bamboo Worker.
 * Explicitly cashier-controlled, with confirmation step, double-click protection,
 * and loading/success/error handling.
 */
window.sendToRiders = async function(orderId) {
  const oidStr = String(orderId);
  if (inFlightDispatch.has(oidStr)) return;

  const order = cachedOrders.find(o => String(o.id) === oidStr);
  if (!order) {
    showToast("⚠️ Order not found.");
    return;
  }

  // Prevent duplicate dispatch if order already has a delivery_job_id
  if (order.delivery_job_id || confirmedDeliveryJobMap.has(oidStr)) {
    const existingJobId = order.delivery_job_id || confirmedDeliveryJobMap.get(oidStr);
    showToast(`⚠️ Order #${order.daily_bc_num || order.id} has already been sent to riders (Job #${existingJobId}).`);
    return;
  }

  // Confirmation step: Ask cashier explicitly
  const confirmed = confirm(`Send this order to Shopystreet Riders?\n\nOrder: #${order.daily_bc_num || order.id}\nCustomer: ${order.customer_name || 'Customer'}\nDestination: ${order.notes || 'Harare'}`);
  if (!confirmed) {
    return;
  }

  // Guard against race conditions after confirm prompt
  if (order.delivery_job_id || confirmedDeliveryJobMap.has(oidStr)) {
    return;
  }

  // Set in-flight dispatch lock & show loading state
  inFlightDispatch.set(oidStr, Date.now());
  renderOrdersUI();
  if (activeModalOrderId === order.id) {
    renderOrderDetailsModalContent(order);
  }

  showToast(`🚀 Sending order #${order.daily_bc_num || order.id} to Shopystreet Riders...`);

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/dispatch-delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const resJson = await res.json().catch(() => ({}));

    if (!res.ok || resJson.success === false || resJson.ok === false) {
      const errMsg = resJson.error || `Server returned status ${res.status}`;
      throw new Error(errMsg);
    }

    const deliveryJobId = resJson.delivery_job_id || resJson.job_id || resJson.id || (resJson.data && resJson.data.id) || "DISPATCHED";

    // Save returned delivery_job_id
    order.delivery_job_id = deliveryJobId;
    confirmedDeliveryJobMap.set(oidStr, deliveryJobId);

    showToast(`✅ Order #${order.daily_bc_num || order.id} SENT TO RIDERS! (Job #${deliveryJobId})`);

    // Force an authoritative fresh sync with D1
    await fetchOrders({ force: true });
  } catch (err) {
    console.error("Failed to send order to riders:", err);
    // If dispatch fails, show a clear error and allow the cashier to retry
    showToast(`❌ Dispatch failed: ${err.message || 'Please check connection and retry.'}`);
  } finally {
    inFlightDispatch.delete(oidStr);
    renderOrdersUI();
    if (activeModalOrderId === order.id) {
      renderOrderDetailsModalContent(order);
    }
  }
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

/**
 * Normalizes order source channel ('menu', 'select', 'uz').
 * Defaults to 'menu' for omitted or historical orders.
 */
function normalizeOrderSource(sourceStr) {
  if (!sourceStr) return "menu";
  const s = String(sourceStr).toLowerCase().trim();
  if (s === "select") return "select";
  if (s === "uz") return "uz";
  return "menu";
}

/**
 * Returns clean, professional HTML badge for order channel source.
 */
function getSourceBadgeHTML(sourceStr) {
  const norm = normalizeOrderSource(sourceStr);
  if (norm === "select") {
    return `<span class="order-source-badge source-select" title="Order Source: Bamboo Chicken Select">⭐ SELECT</span>`;
  }
  if (norm === "uz") {
    return `<span class="order-source-badge source-uz" title="Order Source: Bamboo Chicken UZ">🎓 UZ</span>`;
  }
  return `<span class="order-source-badge source-menu" title="Order Source: Bamboo Chicken Web Menu">🎋 MENU</span>`;
}

/**
 * Safely parses order items array, handling raw arrays, single JSON strings,
 * or doubly encoded JSON strings from older historical orders.
 */
function parseOrderItems(itemsInput) {
  if (Array.isArray(itemsInput)) return itemsInput;
  if (!itemsInput) return [];
  let current = itemsInput;
  for (let i = 0; i < 2; i++) {
    if (typeof current === "string") {
      try {
        current = JSON.parse(current);
      } catch (e) {
        break;
      }
    }
  }
  return Array.isArray(current) ? current : [];
}

/**
 * Calculates authoritative financial breakdown for an order:
 * 1. Food Subtotal: Sum of (item price * item quantity)
 * 2. Delivery Fee: Actual fee for destination, $0.00 / FREE, or PICKUP / $0.00
 * 3. Total Customer Amount: Verified grand total
 * 4. Contextual accounting labels: TOTAL TO COLLECT, TOTAL CASH RECEIVED, TOTAL PAID
 */
function getOrderFinancialBreakdown(order) {
  if (!order) {
    return {
      foodSubtotal: 0,
      deliveryFee: 0,
      deliveryFeeLabel: "$0.00",
      grandTotal: 0,
      isDelivery: false,
      isPickup: true,
      isCash: true,
      isPaid: false,
      paymentMethod: "Cash",
      paymentStatus: "pending",
      paymentStatusDisplay: "PAYMENT PENDING",
      totalLabel: "TOTAL",
      orderSource: "menu"
    };
  }

  const orderSource = normalizeOrderSource(order.source);
  const isSelectOrder = (orderSource === "select");

  const itemsArray = parseOrderItems(order.items);

  // 1. Food Subtotal
  let calculatedFoodSubtotal = 0;
  itemsArray.forEach(item => {
    const qty = parseFloat(item.quantity || item.qty || 1);
    const price = parseFloat(item.price || 0);
    calculatedFoodSubtotal += (qty * price);
  });
  calculatedFoodSubtotal = Math.round(calculatedFoodSubtotal * 100) / 100;

  // 2. Authoritative Total
  let rawTotal = parseFloat(order.total || 0);
  if (isNaN(rawTotal)) rawTotal = 0;
  rawTotal = Math.round(rawTotal * 100) / 100;

  // Detect Delivery vs Pickup (Select orders are STRICTLY DELIVERY ONLY)
  const typeStr = String(order.type || "").toLowerCase().trim();
  const notesStr = String(order.notes || "").toLowerCase().trim();
  const isExplicitPickup = !isSelectOrder && (typeStr.includes("pick") || (!typeStr.includes("deliv") && notesStr.startsWith("pickup")));
  const isExplicitDelivery = isSelectOrder || typeStr.includes("deliv") || notesStr.startsWith("delivery") || notesStr.includes("delivery:");
  const isDelivery = isSelectOrder || isExplicitDelivery || (!isExplicitPickup && (rawTotal - calculatedFoodSubtotal > 0.001));
  const isPickup = isSelectOrder ? false : !isDelivery;

  // 3. Delivery Fee
  let deliveryFee = 0;
  let hasExplicitFee = false;
  if (order.delivery_fee !== undefined && order.delivery_fee !== null && !isNaN(parseFloat(order.delivery_fee))) {
    deliveryFee = Math.round(parseFloat(order.delivery_fee) * 100) / 100;
    hasExplicitFee = true;
  }

  let foodSubtotal = calculatedFoodSubtotal;

  if (isPickup) {
    deliveryFee = 0;
    if (foodSubtotal === 0 && rawTotal > 0) {
      foodSubtotal = rawTotal;
    }
  } else {
    // Delivery Order
    if (!hasExplicitFee) {
      if (rawTotal > 0 && foodSubtotal > 0 && rawTotal >= foodSubtotal) {
        deliveryFee = Math.round((rawTotal - foodSubtotal) * 100) / 100;
      } else if (rawTotal === 0 && foodSubtotal > 0) {
        deliveryFee = 0;
      }
    }
  }

  let grandTotal = rawTotal;
  if (grandTotal === 0 && foodSubtotal > 0) {
    grandTotal = Math.round((foodSubtotal + deliveryFee) * 100) / 100;
  }
  if (foodSubtotal === 0 && grandTotal > 0) {
    foodSubtotal = Math.max(0, Math.round((grandTotal - deliveryFee) * 100) / 100);
  }

  // 4. Payment method & status analysis
  const paymentMethod = String(order.payment_method || "Cash").trim();
  const paymentMethodLower = paymentMethod.toLowerCase();
  const rawPaymentStatus = normalizePayment(order.payment_status);
  const isCash = (paymentMethodLower === "cash" ||
                  paymentMethodLower === "cod" ||
                  paymentMethodLower === "cash on delivery" ||
                  paymentMethodLower.startsWith("cash ") ||
                  paymentMethodLower.endsWith(" cash")) &&
                 !paymentMethodLower.includes("ecocash");
  const isPaid = rawPaymentStatus === "paid";

  let deliveryFeeLabel = `$${deliveryFee.toFixed(2)}`;
  if (isPickup) {
    deliveryFeeLabel = "PICKUP / $0.00";
  } else if (deliveryFee === 0) {
    deliveryFeeLabel = "FREE";
  }

  let totalLabel = "TOTAL";
  let paymentStatusDisplay = isPaid ? "PAID" : "PAYMENT PENDING";

  if (isCash) {
    if (isPaid) {
      totalLabel = isDelivery ? "TOTAL CASH RECEIVED" : "TOTAL PAID";
    } else {
      totalLabel = "TOTAL TO COLLECT";
    }
  } else {
    // Prepaid payment methods (EcoCash, InnBucks, Card, Swipe)
    if (isPaid) {
      totalLabel = "TOTAL PAID";
    } else {
      totalLabel = "TOTAL (PREPAID PENDING)";
    }
  }

  return {
    foodSubtotal,
    deliveryFee,
    deliveryFeeLabel,
    grandTotal,
    isDelivery,
    isPickup,
    isCash,
    isPaid,
    paymentMethod,
    paymentStatus: rawPaymentStatus,
    paymentStatusDisplay,
    totalLabel,
    orderSource
  };
}

function renderOrdersUI() {
  renderAttentionSection();

  const container = document.getElementById("orders-container");
  if (!container) return;

  const searchVal = (document.getElementById("pos-search")?.value || "").toLowerCase().trim();
  const typeFilter = document.getElementById("pos-type-filter")?.value || "all";
  const sourceFilter = (document.getElementById("pos-source-filter")?.value || "all").toLowerCase().trim();

  let baseOrders = getActiveOrdersForCurrentView();

  let filtered = baseOrders.filter(o => {
    const normSt = normalizeStatus(o.order_status);

    if (currentFilter !== "all" && normSt !== currentFilter) {
      return false;
    }

    const orderSource = normalizeOrderSource(o.source);
    if (sourceFilter !== "all" && orderSource !== sourceFilter) {
      return false;
    }

    const breakdown = getOrderFinancialBreakdown(o);
    if (typeFilter !== "all") {
      if (typeFilter === "delivery" && !breakdown.isDelivery) return false;
      if (typeFilter === "pickup" && breakdown.isDelivery) return false;
    }

    if (searchVal) {
      const orderIdStr = String(o.id || "").toLowerCase();
      const dailyNumStr = String(o.daily_bc_num || "").toLowerCase();
      const custName = String(o.customer_name || "").toLowerCase();
      const phone = String(o.phone || "").toLowerCase();
      const notes = String(o.notes || "").toLowerCase();
      const sourceStr = String(orderSource || "").toLowerCase();

      const match = orderIdStr.includes(searchVal) ||
                    dailyNumStr.includes(searchVal) ||
                    custName.includes(searchVal) ||
                    phone.includes(searchVal) ||
                    notes.includes(searchVal) ||
                    sourceStr.includes(searchVal);
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
  const breakdown = getOrderFinancialBreakdown(order);
  const age = getOrderAge(order.created_at);

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
        ${age ? `<span class="order-age-badge" style="font-size: 0.72rem;">⏱️ ${escapeHTML(age)}</span>` : ''}
        ${getSourceBadgeHTML(order.source)}
        <span class="row-customer">👤 ${escapeHTML(order.customer_name || 'Customer')}</span>
        <span class="row-phone">📞 ${escapeHTML(order.phone || 'No phone')}</span>
        <span class="order-type-badge ${breakdown.isDelivery ? 'type-delivery' : 'type-pickup'}" style="font-size: 0.72rem; padding: 2px 8px;">
          ${breakdown.isDelivery ? '🛵 Delivery' : '🛍️ Pickup'}
        </span>
      </div>
      <div class="row-right">
        <div style="text-align: right; line-height: 1.2;">
          <span class="row-total" style="display: block;">$${breakdown.grandTotal.toFixed(2)}</span>
          <span style="font-size: 0.72rem; color: #9CA3AF; font-weight: 600;">
            Food $${breakdown.foodSubtotal.toFixed(2)} ${breakdown.isDelivery ? `+ Del ${escapeHTML(breakdown.deliveryFeeLabel)}` : ''}
          </span>
        </div>
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
  const breakdown = getOrderFinancialBreakdown(order);
  const age = getOrderAge(order.created_at);

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

  const itemsArray = parseOrderItems(order.items);

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
        <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">
          ${escapeHTML(fullTimeFormatted)}
          ${age ? `<span class="order-age-badge" style="margin-left: 6px;">⏱️ ${escapeHTML(age)}</span>` : ''}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        ${getSourceBadgeHTML(order.source)}
        <span class="order-type-badge ${breakdown.isDelivery ? 'type-delivery' : 'type-pickup'}">
          ${breakdown.isDelivery ? '🛵 Delivery' : '🛍️ Pickup'}
        </span>
      </div>
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

    <div class="totals-box" style="background: #23232A; padding: 14px; border-radius: 12px; border-top: none;">
      <div class="breakdown-row" style="padding: 2px 0;">
        <span class="breakdown-label" style="font-size: 0.82rem;">FOOD SUBTOTAL</span>
        <span class="breakdown-value" style="font-size: 0.95rem;">$${breakdown.foodSubtotal.toFixed(2)}</span>
      </div>
      <div class="breakdown-row delivery-row" style="padding: 2px 0;">
        <span class="breakdown-label" style="font-size: 0.82rem;">${breakdown.isPickup ? 'DELIVERY' : 'DELIVERY FEE'}</span>
        <span class="breakdown-value" style="font-size: 0.95rem;">${escapeHTML(breakdown.deliveryFeeLabel)}</span>
      </div>

      <div class="grand-total-row" style="margin-top: 6px; padding-top: 10px;">
        <span class="grand-total-label" style="font-size: 0.95rem;">${escapeHTML(breakdown.totalLabel)}</span>
        <span class="grand-total-value" style="font-size: 1.4rem;">$${breakdown.grandTotal.toFixed(2)}</span>
      </div>

      <div class="payment-method-tag" style="background: #18181B; margin-top: 8px;">
        <span>PAYMENT: <strong>${escapeHTML(breakdown.paymentMethod.toUpperCase())}</strong></span>
        <span class="badge-status ${breakdown.isPaid ? 'badge-paid' : 'badge-unpaid'}">
          ${escapeHTML(breakdown.paymentStatusDisplay)}
        </span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
        <span style="font-size: 0.85rem; color: #9CA3AF;">ORDER SOURCE:</span>
        ${getSourceBadgeHTML(order.source)}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
        <span style="font-size: 0.85rem; color: #9CA3AF;">ORDER STATUS:</span>
        <span class="badge-status badge-${rawStatus}">${rawStatus === 'pending' ? '⚡ AWAITING ACCEPTANCE' : rawStatus.toUpperCase()}</span>
      </div>

      ${order.delivery_job_id ? `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 7px 12px; background: rgba(16, 185, 129, 0.12); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
          <span style="font-size: 0.85rem; color: #10B981; font-weight: 700;">🛵 SHOPYSTREET RIDER:</span>
          <span style="font-size: 0.85rem; font-weight: 800; color: #A7F3D0;">SENT TO RIDERS (#${escapeHTML(String(order.delivery_job_id))})</span>
        </div>
      ` : ''}
    </div>

    ${breakdown.isDelivery && rawStatus !== 'cancelled' ? `
      <div style="margin-top: 10px;">
        ${order.delivery_job_id ? `
          <div class="btn-dispatched-badge" style="padding: 11px 14px; font-size: 0.88rem;">
            <span>🛵</span> SENT TO RIDERS (#${escapeHTML(String(order.delivery_job_id))})
          </div>
        ` : `
          <button type="button" class="btn-action btn-action-dispatch" ${isDispatching ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="sendToRiders(${order.id})">
            ${isDispatching ? '⏳ SENDING TO RIDERS...' : '🛵 SEND TO RIDERS'}
          </button>
        `}
      </div>
    ` : ''}

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
  const breakdown = getOrderFinancialBreakdown(order);
  const age = getOrderAge(order.created_at);

  const itemsArray = parseOrderItems(order.items);

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
  const isUpdating = inFlightUpdates.has(String(order.id));
  const isDispatching = inFlightDispatch.has(String(order.id));

  // Rider Dispatch Action for Delivery Orders
  let riderDispatchHTML = "";
  if (breakdown.isDelivery && rawStatus !== "cancelled") {
    if (order.delivery_job_id) {
      riderDispatchHTML = `
        <div class="btn-dispatched-badge" title="Dispatched to Shopystreet Riders">
          <span>🛵</span> SENT TO RIDERS <span style="font-weight:700; color:#A7F3D0; font-size:0.75rem;">(#${escapeHTML(String(order.delivery_job_id))})</span>
        </div>
      `;
    } else {
      riderDispatchHTML = `
        <button type="button" class="btn-action btn-action-dispatch" ${isDispatching ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="sendToRiders(${order.id})">
          ${isDispatching ? '⏳ SENDING TO RIDERS...' : '🛵 SEND TO RIDERS'}
        </button>
      `;
    }
  }

  // Operational Action Area
  let actionHTML = "";
  if (rawStatus === "pending") {
    actionHTML = `
      <div class="action-area">
        ${riderDispatchHTML}
        <button type="button" class="btn-action btn-action-accept" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="updateOrderStatus(${order.id}, 'preparing')">
          ${isUpdating ? '⏳ ACCEPTING...' : '⚡ ACCEPT ORDER'}
        </button>
        <button type="button" class="btn-cancel-link" ${isUpdating || isDispatching ? 'disabled style="opacity:0.5;"' : ''} onclick="cancelOrderPrompt(${order.id}, '${dailyBcNum}')">
          Cancel Order
        </button>
      </div>
    `;
  } else if (rawStatus === "preparing") {
    actionHTML = `
      <div class="action-area">
        ${riderDispatchHTML}
        <button type="button" class="btn-action btn-action-ready" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="updateOrderStatus(${order.id}, 'ready')">
          ${isUpdating ? '⏳ UPDATING...' : '✅ MARK READY'}
        </button>
        <button type="button" class="btn-cancel-link" ${isUpdating || isDispatching ? 'disabled style="opacity:0.5;"' : ''} onclick="cancelOrderPrompt(${order.id}, '${dailyBcNum}')">
          Cancel Order
        </button>
      </div>
    `;
  } else if (rawStatus === "ready") {
    actionHTML = `
      <div class="action-area">
        ${riderDispatchHTML}
        <button type="button" class="btn-action btn-action-complete" ${isUpdating ? 'disabled style="opacity:0.65; cursor:wait;"' : ''} onclick="updateOrderStatus(${order.id}, 'completed')">
          ${isUpdating ? '⏳ UPDATING...' : '🎉 MARK COMPLETED'}
        </button>
        <button type="button" class="btn-cancel-link" ${isUpdating || isDispatching ? 'disabled style="opacity:0.5;"' : ''} onclick="cancelOrderPrompt(${order.id}, '${dailyBcNum}')">
          Cancel Order
        </button>
      </div>
    `;
  } else if (rawStatus === "completed") {
    actionHTML = `
      <div class="action-area">
        ${riderDispatchHTML}
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

  const ageBadgeHTML = age ? `<span class="order-age-badge ${isNew ? 'age-recent' : ''}" data-created-at="${escapeHTML(order.created_at || '')}">⏱️ ${escapeHTML(age)}</span>` : "";

  return `
    <div class="order-card status-${rawStatus} ${isNew ? 'new-order' : ''}" id="card-${order.id}">
      <div class="card-top">
        <div>
          <div class="order-id-title">
            <span>#${escapeHTML(dailyBcNum)}</span>
            ${ageBadgeHTML}
          </div>
          <div class="order-time">${timeFormatted}</div>
        </div>

        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
          ${getSourceBadgeHTML(order.source)}
          <span class="order-type-badge ${breakdown.isDelivery ? 'type-delivery' : 'type-pickup'}">
            ${breakdown.isDelivery ? '🛵 Delivery' : '🛍️ Pickup'}
          </span>
        </div>
      </div>

      <div class="customer-info">
        <div class="cust-name">👤 ${escapeHTML(order.customer_name || 'Customer')}</div>
        <div>
          📞 <a href="tel:${escapeHTML(order.phone || '')}" class="cust-phone">${escapeHTML(order.phone || 'No phone')}</a>
        </div>
        ${order.notes ? `<div class="cust-address">📍 ${escapeHTML(order.notes)}</div>` : (breakdown.isDelivery ? `<div class="cust-address" style="color: #9CA3AF; font-style: italic;">📍 Delivery (No address notes provided)</div>` : '')}
      </div>

      <div class="items-list">
        ${itemsHTML || '<div style="color: #6B7280; font-size: 0.85rem;">No items recorded</div>'}
      </div>

      <div class="totals-box">
        <div class="breakdown-row">
          <span class="breakdown-label">FOOD SUBTOTAL</span>
          <span class="breakdown-value">$${breakdown.foodSubtotal.toFixed(2)}</span>
        </div>
        <div class="breakdown-row delivery-row">
          <span class="breakdown-label">${breakdown.isPickup ? 'DELIVERY' : 'DELIVERY FEE'}</span>
          <span class="breakdown-value">${escapeHTML(breakdown.deliveryFeeLabel)}</span>
        </div>

        <div class="grand-total-row">
          <span class="grand-total-label">${escapeHTML(breakdown.totalLabel)}</span>
          <span class="grand-total-value">$${breakdown.grandTotal.toFixed(2)}</span>
        </div>

        <div class="payment-method-tag">
          <span>PAYMENT: <strong>${escapeHTML(breakdown.paymentMethod.toUpperCase())}</strong></span>
          <span class="badge-status ${breakdown.isPaid ? 'badge-paid' : 'badge-unpaid'}">
            ${escapeHTML(breakdown.paymentStatusDisplay)}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.8rem; color: #9CA3AF;">CHANNEL:</span>
          ${getSourceBadgeHTML(order.source)}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.8rem; color: #9CA3AF;">STATUS:</span>
          <span class="badge-status badge-${rawStatus}">
            ${rawStatus === 'pending' ? '⚡ AWAITING ACCEPTANCE' : rawStatus.toUpperCase()}
          </span>
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
