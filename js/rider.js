/**
 * Bamboo Chicken — Rider Dashboard Engine
 * Production Rider Portal for real delivery tracking & dispatch.
 */

let activeRiderId = localStorage.getItem("bamboo_rider_id") || "RIDER-1";
let allRiders = [];
let assignedJobs = [];
let gpsInterval = null;
let isOnline = false;

// Universal Offline Queue
function queueOfflineRequest(url, method, body, headers = {}) {
  const queue = JSON.parse(localStorage.getItem("bamboo_offline_queue") || "[]");
  queue.push({
    id: `REQ-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
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
    fetchRiderJobs();
  }
}

window.addEventListener("online", processOfflineQueue);
setInterval(processOfflineQueue, 10000);

document.addEventListener("DOMContentLoaded", () => {
  loadRiders();
  fetchRiderJobs();

  // Poll for assigned jobs every 4 seconds
  setInterval(() => {
    fetchRiderJobs(true);
  }, 4000);
});

async function loadRiders() {
  try {
    const res = await fetch("/riders");
    if (!res.ok) return;
    allRiders = await res.json();

    const selector = document.getElementById("rider-selector");
    if (!selector) return;

    selector.innerHTML = "";
    allRiders.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = `${r.name} (${r.vehicle})`;
      if (r.id === activeRiderId) opt.selected = true;
      selector.appendChild(opt);
    });

    updateRiderHeader();
  } catch (e) {
    console.error("Failed to load riders:", e);
  }
}

function updateRiderHeader() {
  const currentRider = allRiders.find(r => r.id === activeRiderId) || allRiders[0];
  if (!currentRider) return;

  activeRiderId = currentRider.id;
  localStorage.setItem("bamboo_rider_id", activeRiderId);

  const vehicleLbl = document.getElementById("lbl-rider-vehicle");
  if (vehicleLbl) {
    vehicleLbl.textContent = `${currentRider.vehicle} • ${currentRider.phone}`;
  }
  
  isOnline = currentRider.status === "online";
  const chk = document.getElementById("chk-online-status");
  if (chk) chk.checked = isOnline;

  const statusLbl = document.getElementById("lbl-online-status");
  if (statusLbl) {
    statusLbl.textContent = isOnline ? "ONLINE 🟢" : "OFFLINE 🔴";
    statusLbl.style.color = isOnline ? "#10B981" : "#9CA3AF";
  }

  if (isOnline) {
    startGpsTracking();
  } else {
    stopGpsTracking();
  }
}

window.changeActiveRider = function(riderId) {
  activeRiderId = riderId;
  localStorage.setItem("bamboo_rider_id", activeRiderId);
  updateRiderHeader();
  fetchRiderJobs();
};

window.toggleOnlineStatus = async function(onlineChecked) {
  isOnline = onlineChecked;
  const statusLbl = document.getElementById("lbl-online-status");
  if (statusLbl) {
    statusLbl.textContent = isOnline ? "ONLINE 🟢" : "OFFLINE 🔴";
    statusLbl.style.color = isOnline ? "#10B981" : "#9CA3AF";
  }

  try {
    await fetch(`/riders/${activeRiderId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Role": "rider",
        "X-User-Name": activeRiderId
      },
      body: JSON.stringify({ status: isOnline ? "online" : "offline" })
    });
  } catch (e) {
    console.error("Failed to update rider status:", e);
    queueOfflineRequest(`/riders/${activeRiderId}`, "PATCH", { status: isOnline ? "online" : "offline" });
  }

  if (isOnline) {
    startGpsTracking();
  } else {
    stopGpsTracking();
  }
};

function startGpsTracking() {
  const gpsIndicator = document.getElementById("gps-indicator");
  if (gpsIndicator) gpsIndicator.style.display = "flex";
  
  // Upload real GPS immediately
  uploadCurrentGps();

  // Upload real GPS every 10 seconds
  if (!gpsInterval) {
    gpsInterval = setInterval(() => {
      uploadCurrentGps();
    }, 10000);
  }
}

function stopGpsTracking() {
  const gpsIndicator = document.getElementById("gps-indicator");
  if (gpsIndicator) gpsIndicator.style.display = "none";
  if (gpsInterval) {
    clearInterval(gpsInterval);
    gpsInterval = null;
  }
}

function uploadCurrentGps() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        sendGpsToServer(latitude, longitude);
      },
      (err) => {
        console.warn("GPS Location access unavailable:", err.message);
        // Do NOT generate random fake/simulated coordinates
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
}

async function sendGpsToServer(latitude, longitude) {
  try {
    await fetch("/rider-location", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Role": "rider",
        "X-User-Name": activeRiderId
      },
      body: JSON.stringify({
        rider_id: activeRiderId,
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6))
      })
    });
  } catch (e) {
    console.error("GPS upload failed:", e);
  }
}

async function fetchRiderJobs(isSilent = false) {
  try {
    const res = await fetch("/orders", {
      headers: {
        "X-User-Role": "rider",
        "X-User-Name": activeRiderId
      }
    });
    if (!res.ok) return;
    const orders = await res.json();

    // Filter ONLY orders explicitly assigned to this active rider
    assignedJobs = orders.filter(o => o.rider_id === activeRiderId);
    renderRiderJobs();
  } catch (e) {
    console.error("Failed to fetch rider jobs:", e);
  }
}

function renderRiderJobs() {
  const container = document.getElementById("rider-jobs-container");
  if (!container) return;

  if (assignedJobs.length === 0) {
    container.innerHTML = `
      <div class="job-card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 2.5rem; margin-bottom: 10px;">🛵</div>
        <h3 style="font-weight: 800; color: #FFF; margin-bottom: 6px;">No Active Deliveries</h3>
        <p style="color: #9CA3AF; font-size: 0.9rem;">
          ${isOnline ? "You are online and ready! New delivery assignments will appear here automatically." : "You are currently offline. Switch to ONLINE above to start receiving deliveries."}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  assignedJobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    const rawStatus = (job.order_status || job.status || "assigned").toLowerCase().trim();
    let statusClass = "";
    let statusLabel = "";

    if (rawStatus === "delivered" || rawStatus === "completed") {
      statusClass = "delivered";
      statusLabel = "Delivered ✅";
    } else if (rawStatus === "on_the_way") {
      statusClass = "ontheway";
      statusLabel = "On The Way 🛵";
    } else if (rawStatus === "picked_up") {
      statusClass = "ontheway";
      statusLabel = "Picked Up 📦";
    } else if (rawStatus === "accepted") {
      statusClass = "ontheway";
      statusLabel = "Accepted 👍";
    } else {
      statusLabel = "Assigned 📍";
    }

    const itemsSummary = Array.isArray(job.items) 
      ? job.items.map(i => `${i.qty || i.quantity || 1}x ${i.name}`).join(", ")
      : "Bamboo Chicken Order";

    const destLat = job.customer_lat || -17.8292;
    const destLng = job.customer_lng || 31.0522;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;

    card.innerHTML = `
      <div class="job-header">
        <div>
          <span style="font-size: 1.2rem; font-weight: 800; color: var(--pos-orange); font-family: var(--font-display);">${job.id}</span>
          <span style="font-size: 0.82rem; color: #9CA3AF; margin-left: 8px;">• ${job.payment_method || 'Cash'} ($${parseFloat(job.total || 0).toFixed(2)})</span>
        </div>
        <span class="job-status-tag ${statusClass}">${statusLabel}</span>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="font-weight: 800; font-size: 1.05rem; color: #FFF; margin-bottom: 4px;">
          👤 ${escapeHTML(job.customer_name || 'Customer')}
        </div>
        <div style="font-size: 0.9rem; color: #D1D5DB; margin-bottom: 6px;">
          📍 <strong>Address:</strong> ${escapeHTML(job.notes || 'Harare Delivery')}
        </div>
        <div style="font-size: 0.85rem; color: #9CA3AF;">
          🛒 <strong>Items:</strong> ${escapeHTML(itemsSummary)}
        </div>
      </div>

      <div class="btn-action-group">
        <a href="tel:${job.phone || ''}" class="btn-rider-action btn-nav-map">
          📞 Call Customer
        </a>
        <a href="${mapsUrl}" target="_blank" rel="noopener" class="btn-rider-action btn-nav-map">
          🗺️ Open Navigation
        </a>
      </div>

      <div class="btn-action-group">
        ${renderWorkflowButton(job.id, rawStatus)}
      </div>
    `;

    container.appendChild(card);
  });
}

function renderWorkflowButton(orderId, status) {
  if (status === "assigned" || status === "ready" || status === "pending") {
    return `<button type="button" class="btn-rider-action btn-step-accept" onclick="updateJobStatus('${orderId}', 'accepted')">
      👍 Accept Delivery
    </button>`;
  }
  if (status === "accepted") {
    return `<button type="button" class="btn-rider-action btn-step-pickup" onclick="updateJobStatus('${orderId}', 'picked_up')">
      📦 Mark Picked Up
    </button>`;
  }
  if (status === "picked_up") {
    return `<button type="button" class="btn-rider-action btn-step-ontheway" onclick="updateJobStatus('${orderId}', 'on_the_way')">
      🛵 Start Delivery (On The Way)
    </button>`;
  }
  if (status === "on_the_way") {
    return `<button type="button" class="btn-rider-action btn-step-delivered" onclick="updateJobStatus('${orderId}', 'delivered')">
      ✅ Mark Order Delivered
    </button>`;
  }
  return `<button type="button" class="btn-rider-action btn-step-delivered" disabled style="opacity:0.6;">
    🎉 Delivery Completed
  </button>`;
}

window.updateJobStatus = async function(orderId, newStatus) {
  const currentRider = allRiders.find(r => r.id === activeRiderId);
  const riderName = currentRider ? currentRider.name : activeRiderId;
  const rawId = orderId.replace(/^BC-/, '');

  try {
    const res = await fetch(`/orders/${rawId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Role": "rider",
        "X-User-Name": riderName
      },
      body: JSON.stringify({ order_status: newStatus })
    });

    if (res.ok) {
      fetchRiderJobs();
    } else {
      queueOfflineRequest(`/orders/${rawId}`, "PATCH", { order_status: newStatus }, { "X-User-Role": "rider", "X-User-Name": riderName });
    }
  } catch (e) {
    console.error("Failed to update status:", e);
    queueOfflineRequest(`/orders/${rawId}`, "PATCH", { order_status: newStatus }, { "X-User-Role": "rider", "X-User-Name": riderName });
  }
};

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
