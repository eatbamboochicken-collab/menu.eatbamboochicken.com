/**
 * Bamboo Chicken POS — Dedicated Cashier Operations Terminal
 * Handles order monitoring, status workflow, payment processing, rider dispatch, and receipts.
 */

const API_BASE = "https://bamboo-orders-api.warstreett.workers.dev";
const API_URL = `${API_BASE}/orders`;
const RIDERS_API_URL = `${API_BASE}/riders`;

let orders = [];
let riders = [];
let soundEnabled = true;
let currentFilter = "all"; // 'all' | 'pickup' | 'delivery'
let activeAssignOrderId = null;
let activeReceiptOrder = null;
let knownOrderIds = new Set();
let isInitialLoad = true;

// Web Audio API Chime for New Orders
function playCashierChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn("Audio chime prevented:", e);
  }
}

// Format currency
function formatCurrency(amt) {
  const num = parseFloat(amt) || 0;
  return `$${num.toFixed(2)}`;
}

// Format Time Relative or Standard
function formatTimeAgo(isoString) {
  if (!isoString) return "Just now";
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Clean normalize order structure
function normalizeOrder(item) {
  const rawId = item.id || item.order_id || "";
  const idStr = String(rawId);
  const id = idStr ? (idStr.startsWith("BC-") ? idStr : `BC-${idStr}`) : "BC-ORDER";

  const customerName = item.customer_name || item.customerName || item.name || "Customer";
  const phone = item.phone || item.customer_phone || "";
  const createdTime = item.created_at || item.order_time || new Date().toISOString();

  const rawType = String(item.type || item.order_type || "pickup");
  const type = rawType.toLowerCase().includes("delivery") ? "delivery" : "pickup";

  let status = String(item.order_status || item.status || "pending").toLowerCase().trim().replace(/[\s\-]/g, "_");
  if (!["pending", "accepted", "preparing", "ready", "assigned", "picked_up", "on_the_way", "delivered", "completed", "cancelled"].includes(status)) {
    if (status.includes("prep")) status = "preparing";
    else if (status.includes("read")) status = "ready";
    else if (status.includes("accept")) status = "accepted";
    else if (status.includes("comp") || status.includes("done")) status = "completed";
    else if (status.includes("canc")) status = "cancelled";
    else status = "pending";
  }

  let paymentStatus = String(item.payment_status || "pending").toLowerCase().trim();
  if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
    paymentStatus = paymentStatus.includes("paid") ? "paid" : "pending";
  }

  let items = [];
  let rawItems = item.items || [];
  if (typeof rawItems === 'string') {
    try {
      rawItems = JSON.parse(rawItems);
    } catch (e) {
      rawItems = [{ name: rawItems, qty: 1, price: item.total || 0, options: "" }];
    }
  }
  if (Array.isArray(rawItems)) {
    items = rawItems.map(i => ({
      name: i.name || i.item_name || "Item",
      qty: parseInt(i.qty || i.quantity || 1, 10),
      price: parseFloat(i.price || 0),
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
    paymentMethod: item.payment_method || "Cash on Delivery",
    total: parseFloat(item.total || 0),
    items,
    notes: item.notes || item.instructions || "",
    riderId: item.rider_id || (item.rider ? item.rider.id : null),
    riderName: item.rider ? item.rider.name : null
  };
}

// Fetch riders list
async function fetchRiders() {
  try {
    const res = await fetch(RIDERS_API_URL, {
      headers: { "X-User-Role": "cashier", "X-User-Name": "Cashier Terminal" }
    });
    if (res.ok) {
      const data = await res.json();
      riders = Array.isArray(data) ? data : [];
    } else if (riders.length === 0) {
      riders = [
        { id: "RIDER-1", name: "Blessing Moyo", phone: "+263 77 123 4567", vehicle: "Honda Ace", status: "online", active_deliveries: 0 },
        { id: "RIDER-2", name: "Tinashe Ndlovu", phone: "+263 77 987 6543", vehicle: "Yamaha Crux", status: "online", active_deliveries: 1 },
        { id: "RIDER-3", name: "Blessing Nyoni", phone: "+263 73 888 9999", vehicle: "TVS Motorbike", status: "offline", active_deliveries: 0 }
      ];
    }
    renderAvailableRiders();
  } catch (err) {
    console.warn("Failed to fetch riders, using initial fleet:", err);
    if (riders.length === 0) {
      riders = [
        { id: "RIDER-1", name: "Blessing Moyo", phone: "+263 77 123 4567", vehicle: "Honda Ace", status: "online", active_deliveries: 0 },
        { id: "RIDER-2", name: "Tinashe Ndlovu", phone: "+263 77 987 6543", vehicle: "Yamaha Crux", status: "online", active_deliveries: 1 },
        { id: "RIDER-3", name: "Blessing Nyoni", phone: "+263 73 888 9999", vehicle: "TVS Motorbike", status: "offline", active_deliveries: 0 }
      ];
    }
    renderAvailableRiders();
  }
}

// Render Available Riders Panel
function renderAvailableRiders() {
  const container = document.getElementById("available-riders-grid");
  const statRiders = document.getElementById("stat-riders");
  if (!container) return;

  const onlineRiders = riders.filter(r => r.status === "online");
  if (statRiders) {
    statRiders.textContent = `${onlineRiders.length} Online`;
  }

  if (riders.length === 0) {
    container.innerHTML = `<div style="color: #9CA3AF; font-size: 0.85rem;">No riders registered.</div>`;
    return;
  }

  container.innerHTML = riders.map(r => {
    const isOnline = r.status === "online";
    return `
      <div class="rider-card-mini">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="${isOnline ? 'rider-online-dot' : 'rider-offline-dot'}" title="${r.status}"></span>
          <div>
            <strong style="color: #FFF; font-size: 0.9rem;">${r.name}</strong>
            <div style="font-size: 0.75rem; color: #9CA3AF;">${r.vehicle || 'Scooter'} • ${r.phone || ''}</div>
          </div>
        </div>
        <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 6px; background: ${isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)'}; color: ${isOnline ? '#10B981' : '#9CA3AF'}; font-weight: 700;">
          ${isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>
    `;
  }).join('');
}

// Fetch all orders from backend
async function fetchCashierOrders() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        "X-User-Role": "cashier",
        "X-User-Name": "Cashier Operations Terminal"
      }
    });

    if (!res.ok) {
      console.error("Order fetch response not OK:", res.status);
      return;
    }

    const data = await res.json();
    const rawList = Array.isArray(data) ? data : (data.orders || []);
    const parsed = rawList.map(normalizeOrder);

    // Sound alert for brand new orders
    let hasNewArrival = false;
    parsed.forEach(o => {
      if ((o.status === "pending" || o.status === "new") && !knownOrderIds.has(o.id)) {
        hasNewArrival = true;
      }
      knownOrderIds.add(o.id);
    });

    if (hasNewArrival && !isInitialLoad && soundEnabled) {
      playCashierChime();
    }
    isInitialLoad = false;

    orders = parsed;
    updateStats();
    renderBoard();
  } catch (err) {
    console.error("Cashier order fetch error:", err);
  }
}

// Update KPI Stats
function updateStats() {
  const salesEl = document.getElementById("stat-sales");
  const ordersEl = document.getElementById("stat-orders");
  const prepEl = document.getElementById("stat-prep");
  const readyEl = document.getElementById("stat-ready");

  const totalSales = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const prepCount = orders.filter(o => ["accepted", "preparing"].includes(o.status)).length;
  const readyCount = orders.filter(o => ["ready", "assigned", "picked_up", "on_the_way"].includes(o.status)).length;

  if (salesEl) salesEl.textContent = formatCurrency(totalSales);
  if (ordersEl) ordersEl.textContent = orders.length;
  if (prepEl) prepEl.textContent = prepCount;
  if (readyEl) readyEl.textContent = readyCount;
}

// Render Kanban Board Cards
function renderBoard() {
  const searchInput = document.getElementById("pos-search-input");
  const searchVal = (searchInput ? searchInput.value : "").toLowerCase().trim();

  // Filter orders
  let filtered = orders.filter(o => {
    if (currentFilter === "pickup" && o.type !== "pickup") return false;
    if (currentFilter === "delivery" && o.type !== "delivery") return false;

    if (searchVal) {
      const idMatch = o.id.toLowerCase().includes(searchVal);
      const nameMatch = o.customerName.toLowerCase().includes(searchVal);
      const phoneMatch = o.phone.toLowerCase().includes(searchVal);
      const itemsMatch = o.items.some(i => i.name.toLowerCase().includes(searchVal));
      return idMatch || nameMatch || phoneMatch || itemsMatch;
    }
    return true;
  });

  const columns = {
    new: filtered.filter(o => ["pending", "new"].includes(o.status)),
    preparing: filtered.filter(o => ["accepted", "preparing"].includes(o.status)),
    ready: filtered.filter(o => ["assigned", "picked_up", "on_the_way", "delivered", "ready"].includes(o.status)),
    completed: filtered.filter(o => ["completed", "cancelled"].includes(o.status))
  };

  // Update counts
  document.getElementById("count-new").textContent = columns.new.length;
  document.getElementById("count-prep").textContent = columns.preparing.length;
  document.getElementById("count-ready").textContent = columns.ready.length;
  document.getElementById("count-completed").textContent = columns.completed.length;

  // Render HTML per column
  document.getElementById("cards-list-new").innerHTML = columns.new.map(renderOrderCard).join('') || emptyColumnMsg("No new orders");
  document.getElementById("cards-list-preparing").innerHTML = columns.preparing.map(renderOrderCard).join('') || emptyColumnMsg("No accepted orders");
  document.getElementById("cards-list-ready").innerHTML = columns.ready.map(renderOrderCard).join('') || emptyColumnMsg("No orders in transit");
  document.getElementById("cards-list-completed").innerHTML = columns.completed.map(renderOrderCard).join('') || emptyColumnMsg("No completed orders");
}

function emptyColumnMsg(text) {
  return `<div style="padding: 24px; text-align: center; color: #6B7280; font-size: 0.85rem; font-style: italic;">${text}</div>`;
}

// Render individual Cashier order card
function renderOrderCard(o) {
  const isDelivery = o.type === "delivery";
  const timeAgo = formatTimeAgo(o.createdTime);

  // Status Badge Styling
  let statusBadgeClass = "badge-pending";
  let statusText = o.status.toUpperCase().replace('_', ' ');
  if (["accepted", "preparing"].includes(o.status)) statusBadgeClass = "badge-prep";
  else if (["assigned", "picked_up", "on_the_way", "delivered", "ready"].includes(o.status)) statusBadgeClass = "badge-ready";
  else if (["completed"].includes(o.status)) statusBadgeClass = "badge-completed";

  // Rider info line
  let riderInfoHTML = "";
  if (isDelivery) {
    if (o.riderName) {
      riderInfoHTML = `
        <div style="font-size: 0.8rem; color: #10B981; margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
          <span>🛵 Rider: <strong>${o.riderName}</strong></span>
          <button type="button" class="pos-btn pos-btn-secondary" style="padding: 2px 8px; font-size: 0.72rem;" onclick="openAssignRiderModal('${o.id}')">Reassign</button>
        </div>
      `;
    } else {
      riderInfoHTML = `
        <div style="font-size: 0.8rem; color: #EF4444; margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
          <span>🛵 Rider: <em style="color: #F59E0B;">Unassigned</em></span>
          <button type="button" class="pos-btn pos-btn-primary" style="padding: 3px 10px; font-size: 0.75rem; background: #FF5A00; border-color: #FF5A00;" onclick="openAssignRiderModal('${o.id}')">Assign Rider</button>
        </div>
      `;
    }
  }

  // Payment status selector dropdown (Allows Cashiers to immediately change & sync payment status to D1)
  const paymentSelectHTML = `
    <select class="form-control" style="font-size: 0.78rem; padding: 4px 8px; border-radius: 6px; background: #2A2A35; color: ${o.paymentStatus === 'paid' ? '#10B981' : '#F59E0B'}; border: 1px solid rgba(255,255,255,0.15); font-weight: 700; cursor: pointer;" onchange="updatePaymentStatus('${o.id}', this.value)">
      <option value="pending" ${o.paymentStatus === 'pending' ? 'selected' : ''}>⏳ Pending</option>
      <option value="paid" ${o.paymentStatus === 'paid' ? 'selected' : ''}>✅ Paid</option>
      <option value="failed" ${o.paymentStatus === 'failed' ? 'selected' : ''}>❌ Failed</option>
      <option value="refunded" ${o.paymentStatus === 'refunded' ? 'selected' : ''}>↩️ Refunded</option>
    </select>
  `;

  // Main Action Buttons per Column/Status
  let actionsHTML = "";
  if (o.status === "pending" || o.status === "new") {
    actionsHTML = `
      <button type="button" class="pos-card-btn pos-btn-primary" onclick="updateOrderStatus('${o.id}', 'accepted')">
        Accept Order
      </button>
      <button type="button" class="pos-card-btn pos-btn-secondary" style="color: #EF4444;" onclick="updateOrderStatus('${o.id}', 'cancelled')">
        Cancel
      </button>
    `;
  } else if (o.status === "accepted" || o.status === "preparing") {
    if (isDelivery) {
      actionsHTML = `
        <button type="button" class="pos-card-btn pos-btn-primary" style="background: #FF5A00; border-color: #FF5A00;" onclick="openAssignRiderModal('${o.id}')">
          🛵 Assign Rider
        </button>
        <button type="button" class="pos-card-btn pos-btn-secondary" onclick="updateOrderStatus('${o.id}', 'completed')">
          Complete
        </button>
      `;
    } else {
      actionsHTML = `
        <button type="button" class="pos-card-btn pos-btn-primary" style="background: #10B981; border-color: #059669;" onclick="updateOrderStatus('${o.id}', 'completed')">
          Complete Order
        </button>
      `;
    }
  } else if (["assigned", "picked_up", "on_the_way", "delivered", "ready"].includes(o.status)) {
    actionsHTML = `
      <button type="button" class="pos-card-btn pos-btn-primary" style="background: #10B981; border-color: #059669;" onclick="updateOrderStatus('${o.id}', 'completed')">
        Complete Order
      </button>
    `;
  }

  return `
    <div class="pos-order-card" id="card-${o.id}">
      <!-- Card Top Bar -->
      <div class="pos-card-header">
        <div>
          <span class="pos-card-id">${o.id}</span>
          <span class="pos-type-badge ${isDelivery ? 'type-delivery' : 'type-pickup'}">
            ${isDelivery ? '🛵 Delivery' : '🏃 Pickup'}
          </span>
        </div>
        <span class="pos-card-time">${timeAgo}</span>
      </div>

      <!-- Customer Details -->
      <div style="margin-bottom: 8px;">
        <strong style="color: #FFF; font-size: 0.95rem;">${o.customerName}</strong>
        ${o.phone ? `<div style="font-size: 0.8rem; color: #9CA3AF;">📞 ${o.phone}</div>` : ''}
      </div>

      <!-- Items Breakdown -->
      <div class="pos-card-items">
        ${o.items.map(i => `
          <div class="pos-item-row">
            <span>${i.qty}x ${i.name}</span>
            <span style="color: #9CA3AF;">${formatCurrency(i.price * i.qty)}</span>
          </div>
          ${i.options ? `<div style="font-size: 0.75rem; color: #F59E0B; padding-left: 12px;">└ ${i.options}</div>` : ''}
        `).join('')}
      </div>

      <!-- Notes -->
      ${o.notes ? `<div style="font-size: 0.78rem; color: #E5E7EB; background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: 6px; margin-top: 6px; font-style: italic;">📝 ${o.notes}</div>` : ''}

      <!-- Rider Info (if Delivery) -->
      ${riderInfoHTML}

      <!-- Footer & Payment Row -->
      <div class="pos-card-footer" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
        <div>
          <div style="font-size: 0.75rem; color: #9CA3AF;">Total Amount:</div>
          <strong style="font-size: 1.1rem; color: #FF5A00;">${formatCurrency(o.total)}</strong>
        </div>
        <div>
          ${paymentSelectHTML}
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="pos-card-actions" style="margin-top: 10px;">
        ${actionsHTML}
        <button type="button" class="pos-card-btn pos-btn-secondary" title="View & Print Receipt" onclick="openReceiptModal('${o.id}')">
          🖨️ Receipt
        </button>
      </div>
    </div>
  `;
}

// API Update: Payment Status (Pending / Paid / Failed / Refunded)
async function updatePaymentStatus(orderId, newPaymentStatus) {
  try {
    const res = await fetch(`${API_URL}/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "cashier",
        "X-User-Name": "Cashier Terminal"
      },
      body: JSON.stringify({ payment_status: newPaymentStatus })
    });

    if (res.ok) {
      const target = orders.find(o => o.id === orderId);
      if (target) target.paymentStatus = newPaymentStatus;
      renderBoard();
    } else {
      alert("Failed to update payment status.");
      fetchCashierOrders();
    }
  } catch (err) {
    console.error("Error updating payment status:", err);
  }
}

// API Update: Order Status (accepted, ready, completed)
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${API_URL}/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "cashier",
        "X-User-Name": "Cashier Terminal"
      },
      body: JSON.stringify({ order_status: newStatus })
    });

    if (res.ok) {
      await fetchCashierOrders();
    } else {
      const errData = await res.json();
      alert(errData.error || "Failed to update order status.");
    }
  } catch (err) {
    console.error("Error updating order status:", err);
  }
}

// Rider Assignment Modal Logic
function openAssignRiderModal(orderId) {
  activeAssignOrderId = orderId;
  const order = orders.find(o => o.id === orderId);
  const infoEl = document.getElementById("assign-modal-order-info");
  const selectEl = document.getElementById("modal-rider-select");
  const modal = document.getElementById("assign-rider-modal");

  if (!modal || !order) return;

  infoEl.innerHTML = `Order: <strong>${order.id}</strong> — Customer: <strong>${order.customerName}</strong> (${formatCurrency(order.total)})`;

  const onlineRiders = riders.filter(r => r.status === "online");
  if (onlineRiders.length === 0) {
    selectEl.innerHTML = `<option value="">No online riders available</option>`;
  } else {
    selectEl.innerHTML = onlineRiders.map(r => `
      <option value="${r.id}" ${order.riderId === r.id ? 'selected' : ''}>
        🛵 ${r.name} (${r.vehicle || 'Scooter'}) - ${r.phone}
      </option>
    `).join('');
  }

  modal.style.display = "flex";
}

function closeAssignRiderModal() {
  const modal = document.getElementById("assign-rider-modal");
  if (modal) modal.style.display = "none";
  activeAssignOrderId = null;
}

async function confirmRiderAssignment() {
  if (!activeAssignOrderId) return;
  const selectEl = document.getElementById("modal-rider-select");
  const riderId = selectEl.value;

  if (!riderId) {
    alert("Please select a valid online rider.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${activeAssignOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "cashier",
        "X-User-Name": "Cashier Terminal"
      },
      body: JSON.stringify({
        rider_id: riderId,
        order_status: "assigned"
      })
    });

    if (res.ok) {
      closeAssignRiderModal();
      await fetchCashierOrders();
    } else {
      alert("Failed to assign rider.");
    }
  } catch (err) {
    console.error("Assign rider error:", err);
  }
}

// Receipt Modal & Thermal Printing Generator
function openReceiptModal(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  activeReceiptOrder = order;
  const modal = document.getElementById("receipt-modal-overlay");
  const content = document.getElementById("modal-receipt-content");

  const dateStr = new Date(order.createdTime).toLocaleString();

  content.innerHTML = `
    <div id="printable-receipt" style="font-family: monospace; background: #FFF; color: #000; padding: 20px; border-radius: 8px; width: 100%; max-width: 340px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
      <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px;">
        <h2 style="margin: 0; font-size: 1.3rem; font-weight: 900;">BAMBOO CHICKEN</h2>
        <div style="font-size: 0.8rem; margin-top: 4px;">Authentic Sadza & Chicken Specialist</div>
        <div style="font-size: 0.75rem; margin-top: 2px;">Harare, Zimbabwe • Tel: +263 77 123 4567</div>
      </div>

      <div style="font-size: 0.82rem; margin-bottom: 10px;">
        <div><strong>RECEIPT #${order.id}</strong></div>
        <div>Date: ${dateStr}</div>
        <div>Customer: ${order.customerName}</div>
        ${order.phone ? `<div>Phone: ${order.phone}</div>` : ''}
        <div>Type: <strong>${order.type.toUpperCase()}</strong></div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-bottom: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid #000; text-align: left;">
            <th style="padding: 4px 0;">Qty</th>
            <th style="padding: 4px 0;">Item</th>
            <th style="padding: 4px 0; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(i => `
            <tr>
              <td style="padding: 4px 0; vertical-align: top;">${i.qty}x</td>
              <td style="padding: 4px 0;">
                ${i.name}
                ${i.options ? `<div style="font-size: 0.72rem; color: #444;">(${i.options})</div>` : ''}
              </td>
              <td style="padding: 4px 0; text-align: right; vertical-align: top;">${formatCurrency(i.price * i.qty)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="border-top: 2px dashed #000; padding-top: 8px; font-size: 0.88rem;">
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.05rem;">
          <span>TOTAL:</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.8rem;">
          <span>Payment Method:</span>
          <span>${order.paymentMethod}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 2px; font-size: 0.8rem;">
          <span>Payment Status:</span>
          <span style="font-weight: 700; color: ${order.paymentStatus === 'paid' ? 'green' : 'orange'};">${order.paymentStatus.toUpperCase()}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 16px; font-size: 0.75rem; border-top: 1px solid #CCC; padding-top: 8px;">
        Thank you for dining with Bamboo Chicken!
        <br>Please keep this receipt for pickup verification.
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function closeReceiptModal() {
  const modal = document.getElementById("receipt-modal-overlay");
  if (modal) modal.style.display = "none";
  activeReceiptOrder = null;
}

function printReceipt() {
  const printArea = document.getElementById("printable-receipt");
  if (!printArea) return;

  const win = window.open("", "_blank", "width=400,height=600");
  win.document.write(`
    <html>
      <head>
        <title>Receipt - Bamboo Chicken</title>
        <style>
          body { margin: 0; padding: 10px; font-family: monospace; }
        </style>
      </head>
      <body>
        ${printArea.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

// Set Filter Pills
function setCashierFilter(filterType) {
  currentFilter = filterType;
  document.querySelectorAll(".pos-filter-pill").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filterType);
  });
  renderBoard();
}

// Manual Refresh Trigger
function refreshCashierOrders() {
  fetchCashierOrders();
  fetchRiders();
}

// Live Clock in Header
function updateClock() {
  const clockEl = document.getElementById("pos-clock");
  if (clockEl) {
    clockEl.textContent = new Date().toLocaleTimeString();
  }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Live Clock
  setInterval(updateClock, 1000);
  updateClock();

  // Sound toggle button
  const soundBtn = document.getElementById("pos-sound-btn");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundBtn.classList.toggle("active", soundEnabled);
      soundBtn.innerHTML = soundEnabled ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      `;
    });
  }

  // Search input binding
  const searchInput = document.getElementById("pos-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", renderBoard);
  }

  // Initial Fetch & Polling (3 seconds for rapid cash register sync)
  fetchRiders();
  fetchCashierOrders();
  setInterval(fetchCashierOrders, 3000);
  setInterval(fetchRiders, 6000);
});
