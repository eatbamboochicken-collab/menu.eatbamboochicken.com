/**
 * Bamboo Chicken - Cashier Terminal Script (Phase 2A - Read Only)
 * Production API Base: https://bamboo-orders-api.warstreett.workers.dev
 */

const API_BASE = "https://bamboo-orders-api.warstreett.workers.dev";
const POLL_INTERVAL_MS = 4000;

let cachedOrders = [];
let knownOrderIds = new Set();
let isFirstLoad = true;
let currentFilter = "all";
let soundEnabled = true;
let isFetching = false;

document.addEventListener("DOMContentLoaded", () => {
  initCashier();
});

function initCashier() {
  fetchOrders();
  setInterval(fetchOrders, POLL_INTERVAL_MS);
}

// Fetch Orders from Cloudflare Worker + D1
async function fetchOrders() {
  if (isFetching) return;
  isFetching = true;

  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  try {
    const res = await fetch(`${API_BASE}/orders`);

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
    cachedOrders = processOrdersData(data);
    updateCounts();
    renderOrdersUI();

  } catch (err) {
    console.error("Cashier fetch error:", err);

    if (statusDot) statusDot.className = "dot error";
    if (statusText) statusText.textContent = "Unable to connect to production order server.";

    if (cachedOrders.length === 0) {
      renderErrorState("Unable to connect to production order server.");
    }
  } finally {
    isFetching = false;
  }
}

window.fetchOrdersManual = function() {
  showToast("🔄 Syncing with D1...");
  fetchOrders();
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
    const str = String(dateInput);
    const isoStr = str.includes("T") ? str : str.replace(" ", "T") + (str.includes("Z") ? "" : "Z");
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) {
      return str.substring(0, 10);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch (e) {
    return String(dateInput).substring(0, 10);
  }
}

function getTodayLocalDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Process raw D1 orders:
 * 1. Groups all orders by calendar date (YYYY-MM-DD).
 * 2. Assigns sequence index per date (BC-01, BC-02, etc.) sorted chronologically ascending by ID/timestamp.
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
      const timeA = a.created_at ? new Date(a.created_at.includes("T") ? a.created_at : a.created_at.replace(" ", "T")).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at.includes("T") ? b.created_at : b.created_at.replace(" ", "T")).getTime() : 0;
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

function updateCounts() {
  const todayStr = getTodayLocalDateStr();
  const todaysOrders = cachedOrders.filter(o => getLocalDateStr(o.created_at) === todayStr);

  const counts = {
    all: todaysOrders.length,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0
  };

  todaysOrders.forEach(o => {
    const st = normalizeStatus(o.order_status);
    if (counts[st] !== undefined) {
      counts[st]++;
    }
  });

  const setElText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setElText("count-all", counts.all);
  setElText("count-pending", counts.pending);
  setElText("count-preparing", counts.preparing);
  setElText("count-ready", counts.ready);
  setElText("count-completed", counts.completed);
  setElText("count-cancelled", counts.cancelled);
}

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
  const todayStr = getTodayLocalDateStr();

  // Filter 1: Today's Orders Only
  let todaysOrders = cachedOrders.filter(o => getLocalDateStr(o.created_at) === todayStr);

  // Sort Today's Orders: Newest First
  todaysOrders.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at.includes("T") ? a.created_at : a.created_at.replace(" ", "T")).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at.includes("T") ? b.created_at : b.created_at.replace(" ", "T")).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });

  let filtered = todaysOrders.filter(o => {
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

  if (todaysOrders.length === 0) {
    renderEmptyState("No orders today.", "Customer orders placed on the web menu today will appear here automatically.");
    return;
  }

  if (filtered.length === 0) {
    renderEmptyState("No matching orders for today.", "Try adjusting your search query or status filter tab.");
    return;
  }

  container.innerHTML = filtered.map(order => createOrderCardHTML(order)).join("");
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
  const d1Id = order.id;
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
      const d = new Date(order.created_at.includes("Z") ? order.created_at : order.created_at + "Z");
      timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) +
                      " • " + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch(e) {
      timeFormatted = order.created_at;
    }
  }

  const isNew = rawStatus === "pending";
  const grandTotal = parseFloat(order.total || 0);

  return `
    <div class="order-card ${isNew ? 'new-order' : ''}" id="card-${order.id}">
      <div class="card-top">
        <div>
          <div class="order-id-title">
            <span>${escapeHTML(dailyBcNum)}</span>
            <span style="font-size: 0.78rem; font-weight: 600; color: #9CA3AF;">(D1 ID: #${d1Id})</span>
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
        ${order.notes ? `<div class="cust-address">📍 Notes/Address: ${escapeHTML(order.notes)}</div>` : ''}
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

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
          <span style="font-size: 0.8rem; color: #9CA3AF;">Order Status:</span>
          <span class="badge-status badge-${rawStatus}">
            ${rawStatus.toUpperCase()}
          </span>
        </div>

        <div class="grand-total-row">
          <span>Total:</span>
          <span style="color: #FDB813;">$${grandTotal.toFixed(2)}</span>
        </div>
      </div>
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
