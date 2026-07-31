/**
 * Bamboo Chicken — Dedicated Kitchen Display System (KDS) Engine
 * Touchscreen-optimized real-time kitchen workflow controller.
 */

const API_URL = "/orders";

// App Datasets & State
let kitchenOrders = [];
let knownOrderIds = new Set();
let searchQuery = "";
let soundEnabled = true;
let isInitialLoad = true;
let timerInterval = null;

// Universal Offline Queue for Kitchen Actions
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
    fetchKitchenOrders();
  }
}

window.addEventListener("online", processOfflineQueue);
setInterval(processOfflineQueue, 10000);

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  setupSearch();
  
  // Initial fetch
  fetchKitchenOrders();

  // Poll server for new orders every 3 seconds
  setInterval(fetchKitchenOrders, 3000);

  // Live timer tick every second for high precision elapsed time updates
  timerInterval = setInterval(updateLiveTimers, 1000);
});

function initClock() {
  const clockEl = document.getElementById("kds-clock");
  if (!clockEl) return;
  function tick() {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

function setupSearch() {
  const input = document.getElementById("kds-search-input");
  if (input) {
    input.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderKDSBoard();
    });
  }
}

window.toggleSoundAlerts = function() {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById("kds-sound-icon");
  const label = document.getElementById("kds-sound-label");
  const btn = document.getElementById("kds-sound-btn");

  if (soundEnabled) {
    if (icon) icon.textContent = "🔊";
    if (label) label.textContent = "Sound ON";
    if (btn) btn.classList.remove("muted");
    playKitchenChime();
  } else {
    if (icon) icon.textContent = "🔇";
    if (label) label.textContent = "Sound OFF";
    if (btn) btn.classList.add("muted");
  }
};

// Normalize API order format
function normalizeKitchenOrder(item) {
  const rawId = item.id || item.order_id || "";
  const idStr = String(rawId);
  const id = idStr ? (idStr.startsWith("BC-") ? idStr : `BC-${idStr}`) : "BC-ORDER";

  const customerName = item.customer_name || item.customerName || item.name || "Customer";
  const phone = item.phone || item.customer_phone || "";
  const createdTime = item.created_at || item.order_time || new Date().toISOString();

  const rawType = String(item.type || item.order_type || "Pickup");
  const type = rawType.toLowerCase().includes("delivery") ? "Delivery" : "Pickup";

  let status = String(item.order_status || item.status || "pending").toLowerCase().trim().replace(/[\s\-]/g, "_");
  if (!["pending", "accepted", "preparing", "ready", "assigned", "picked_up", "on_the_way", "delivered", "completed", "cancelled"].includes(status)) {
    if (status.includes("prep")) status = "preparing";
    else if (status.includes("read")) status = "ready";
    else if (status.includes("accept")) status = "accepted";
    else if (status.includes("comp") || status.includes("done")) status = "completed";
    else if (status.includes("canc")) status = "cancelled";
    else status = "pending";
  }

  let paymentStatus = String(item.payment_status || "pending").toLowerCase();
  paymentStatus = paymentStatus.includes("paid") ? "paid" : "pending";

  let items = [];
  let rawItems = item.items || [];
  if (typeof rawItems === 'string') {
    try {
      rawItems = JSON.parse(rawItems);
    } catch(e) {
      rawItems = [{ name: rawItems, qty: 1, options: "" }];
    }
  }
  if (Array.isArray(rawItems)) {
    items = rawItems.map(i => ({
      name: i.name || i.item_name || "Item",
      qty: parseInt(i.qty || i.quantity || 1, 10),
      options: i.options || i.notes || ""
    }));
  }

  return {
    id,
    rawId,
    customerName,
    phone,
    createdTime,
    type,
    status,
    paymentStatus,
    items,
    notes: item.notes || item.instructions || "",
    riderName: item.rider ? item.rider.name : null
  };
}

// Fetch orders from API
async function fetchKitchenOrders() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        "X-User-Role": "kitchen",
        "X-User-Name": "Kitchen Display Terminal"
      }
    });

    if (!res.ok) return;

    const data = await res.json();
    const rawList = Array.isArray(data) ? data : (data.orders || []);

    const parsedOrders = rawList.map(normalizeKitchenOrder);

    // AUTO CLEANUP: Filter out completed, delivered, and cancelled orders
    kitchenOrders = parsedOrders.filter(o => 
      !["completed", "delivered", "cancelled"].includes(o.status)
    );

    // Check for NEW incoming orders to trigger notification sound ONCE
    let hasNewArrival = false;
    kitchenOrders.forEach(o => {
      if ((o.status === "pending" || o.status === "new") && !knownOrderIds.has(o.id)) {
        hasNewArrival = true;
      }
      knownOrderIds.add(o.id);
    });

    if (hasNewArrival && !isInitialLoad && soundEnabled) {
      playKitchenChime();
    }
    isInitialLoad = false;

    renderKDSBoard();
  } catch (e) {
    console.error("Failed to fetch kitchen orders:", e);
  }
}

// Render 4 Columns Board
function renderKDSBoard() {
  const colNew = [];
  const colAccepted = [];
  const colPreparing = [];
  const colReady = [];

  kitchenOrders.forEach(o => {
    // Apply search filter if active
    if (searchQuery) {
      const matchId = o.id.toLowerCase().includes(searchQuery);
      const matchName = o.customerName.toLowerCase().includes(searchQuery);
      const matchItems = o.items.some(i => i.name.toLowerCase().includes(searchQuery));
      if (!matchId && !matchName && !matchItems) return;
    }

    if (o.status === "pending" || o.status === "new") {
      colNew.push(o);
    } else if (o.status === "accepted") {
      colAccepted.push(o);
    } else if (o.status === "preparing") {
      colPreparing.push(o);
    } else if (["ready", "assigned", "picked_up", "on_the_way"].includes(o.status)) {
      colReady.push(o);
    }
  });

  // Update Summary Counts
  document.getElementById("stat-total-active").textContent = kitchenOrders.length;
  document.getElementById("stat-new").textContent = colNew.length;
  document.getElementById("stat-accepted").textContent = colAccepted.length;
  document.getElementById("stat-preparing").textContent = colPreparing.length;
  document.getElementById("stat-ready").textContent = colReady.length;

  document.getElementById("count-new").textContent = colNew.length;
  document.getElementById("count-accepted").textContent = colAccepted.length;
  document.getElementById("count-preparing").textContent = colPreparing.length;
  document.getElementById("count-ready").textContent = colReady.length;

  // Render Columns
  renderColumnCards("cards-new", colNew, "No new incoming orders");
  renderColumnCards("cards-accepted", colAccepted, "No accepted orders");
  renderColumnCards("cards-preparing", colPreparing, "No orders currently cooking");
  renderColumnCards("cards-ready", colReady, "No ready orders waiting");

  // Immediate timer update after DOM render
  updateLiveTimers();
}

function renderColumnCards(containerId, orderList, emptyText) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (orderList.length === 0) {
    container.innerHTML = `<div class="kds-empty-state">${emptyText}</div>`;
    return;
  }

  container.innerHTML = orderList.map(o => createKitchenCardHTML(o)).join("");
}

function createKitchenCardHTML(o) {
  const typeClass = o.type.toLowerCase() === "delivery" ? "kds-type-delivery" : "kds-type-pickup";
  const typeLabel = o.type.toLowerCase() === "delivery" ? "DELIVERY 🛵" : "PICKUP 🛍️";

  const paymentClass = o.paymentStatus === "paid" ? "kds-paid" : "kds-unpaid";
  const paymentText = o.paymentStatus === "paid" ? "PAID ✅" : "UNPAID 💵";

  const itemsHTML = o.items.map(item => `
    <div class="kds-item-row">
      <span class="kds-item-qty">${item.qty}x</span>
      <div class="kds-item-details">
        <div class="kds-item-name">${escapeHTML(item.name)}</div>
        ${item.options ? `<div class="kds-item-options">⚠️ ${escapeHTML(item.options)}</div>` : ""}
      </div>
    </div>
  `).join("");

  const notesHTML = o.notes ? `
    <div class="kds-notes-box">
      <strong>Notes:</strong> ${escapeHTML(o.notes)}
    </div>
  ` : "";

  const riderHTML = o.riderName ? `
    <div style="font-size:0.85rem; color:#10B981; font-weight:800;">
      🛵 Rider: ${escapeHTML(o.riderName)}
    </div>
  ` : "";

  // Dedicated Kitchen Actions ONLY
  let actionBtnHTML = "";
  if (o.status === "pending" || o.status === "new") {
    actionBtnHTML = `
      <button type="button" class="kds-action-btn kds-btn-accept" onclick="updateKitchenStatus('${o.id}', 'accepted')">
        👨‍🍳 ACCEPT ORDER
      </button>
    `;
  } else if (o.status === "accepted") {
    actionBtnHTML = `
      <button type="button" class="kds-action-btn kds-btn-prep" onclick="updateKitchenStatus('${o.id}', 'preparing')">
        🔥 START COOKING
      </button>
    `;
  } else if (o.status === "preparing") {
    actionBtnHTML = `
      <button type="button" class="kds-action-btn kds-btn-ready" onclick="updateKitchenStatus('${o.id}', 'ready')">
        🔔 MARK READY
      </button>
    `;
  } else {
    actionBtnHTML = `
      <button type="button" class="kds-action-btn kds-btn-ready" disabled style="opacity: 0.85; background: #059669;">
        ✅ READY FOR PICKUP / RIDER
      </button>
    `;
  }

  // Format creation time
  let timeStr = "";
  try {
    timeStr = new Date(o.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch(e) {
    timeStr = "Just now";
  }

  return `
    <div class="kds-card" id="kds-card-${o.id}" data-created="${o.createdTime}">
      
      <!-- Card Header -->
      <div class="kds-card-header">
        <div>
          <div class="kds-order-id">${o.id}</div>
          <div style="font-size: 0.8rem; color: #9CA3AF; margin-top: 2px;">Received at ${timeStr}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <span class="kds-type-pill ${typeClass}">${typeLabel}</span>
          
          <!-- Live Timer Badge -->
          <div class="kds-timer-badge green" id="timer-badge-${o.id}">
            ⏱️ <span id="timer-val-${o.id}">00:00</span>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="kds-customer-info">
        <div>
          <span class="kds-customer-name">${escapeHTML(o.customerName)}</span>
          ${riderHTML}
        </div>
        <span class="kds-payment-tag ${paymentClass}">${paymentText}</span>
      </div>

      <!-- Items List -->
      <div class="kds-items-list">
        ${itemsHTML}
      </div>

      ${notesHTML}

      <!-- Action Button -->
      <div style="margin-top: 6px;">
        ${actionBtnHTML}
      </div>

    </div>
  `;
}

// Live Elapsed Time Updater (fires every 1s)
function updateLiveTimers() {
  const cards = document.querySelectorAll(".kds-card");
  const now = Date.now();

  cards.forEach(card => {
    const createdIso = card.getAttribute("data-created");
    if (!createdIso) return;

    const createdMs = Date.parse(createdIso);
    if (isNaN(createdMs)) return;

    const elapsedSeconds = Math.max(0, Math.floor((now - createdMs) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const cardId = card.id.replace("kds-card-", "");
    const timerValEl = document.getElementById(`timer-val-${cardId}`);
    const timerBadgeEl = document.getElementById(`timer-badge-${cardId}`);

    if (timerValEl) timerValEl.textContent = formatted;

    // Apply Colour System Rules:
    // < 10 mins (600s) -> Green
    // 10–20 mins (1200s) -> Orange
    // > 20 mins (1200s+) -> Red
    // > 30 mins (1800s+) -> Flashing Red
    if (timerBadgeEl) {
      card.classList.remove("time-green", "time-orange", "time-red", "time-overdue");
      timerBadgeEl.classList.remove("green", "orange", "red", "overdue");

      if (elapsedSeconds < 600) {
        card.classList.add("time-green");
        timerBadgeEl.classList.add("green");
      } else if (elapsedSeconds < 1200) {
        card.classList.add("time-orange");
        timerBadgeEl.classList.add("orange");
      } else if (elapsedSeconds < 1800) {
        card.classList.add("time-red");
        timerBadgeEl.classList.add("red");
      } else {
        card.classList.add("time-overdue");
        timerBadgeEl.classList.add("overdue");
      }
    }
  });
}

// Kitchen Action Status Update
window.updateKitchenStatus = async function(orderId, newStatus) {
  const rawId = orderId.replace(/^BC-/, '');

  try {
    const res = await fetch(`${API_URL}/${rawId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "kitchen",
        "X-User-Name": "Kitchen Display Terminal"
      },
      body: JSON.stringify({ order_status: newStatus })
    });

    if (res.ok) {
      fetchKitchenOrders();
    } else {
      queueOfflineRequest(`${API_URL}/${rawId}`, "PATCH", { order_status: newStatus }, { "X-User-Role": "kitchen" });
    }
  } catch (e) {
    console.error("Failed to update status:", e);
    queueOfflineRequest(`${API_URL}/${rawId}`, "PATCH", { order_status: newStatus }, { "X-User-Role": "kitchen" });
  }
};

// Notification Sound Engine (Plays once on new order arrival)
function playKitchenChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "triangle";
    osc2.type = "sine";

    // Bright 2-tone kitchen bell
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.15); // E6

    osc2.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);
  } catch(e) {
    console.warn("Audio chime restricted by browser gesture requirements.");
  }
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
