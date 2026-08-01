/**
 * Bamboo Chicken - Customer Order Live Tracking Script
 */

let currentOrderId = null;
let pollTimer = null;
let mapInstance = null;
let restaurantMarker = null;
let customerMarker = null;
let riderMarker = null;

document.addEventListener("DOMContentLoaded", () => {
  // Check URL search params for order ID
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id") || urlParams.get("track") || urlParams.get("order");

  if (orderId) {
    document.getElementById("track-input-id").value = orderId;
    loadOrderTracking(orderId);
  }

  // Poll every 5s if active order
  pollTimer = setInterval(() => {
    if (currentOrderId) {
      loadOrderTracking(currentOrderId, true);
    }
  }, 5000);
});

function handleTrackSearch(e) {
  e.preventDefault();
  const inputVal = document.getElementById("track-input-id").value.trim();
  if (!inputVal) return;
  loadOrderTracking(inputVal);
}

async function loadOrderTracking(orderId, isSilent = false) {
  currentOrderId = orderId.toUpperCase();
  if (!currentOrderId.startsWith("BC-")) {
    currentOrderId = `BC-${currentOrderId}`;
  }

  try {
    const res = await fetch(`/tracking/${currentOrderId}`);
    if (!res.ok) {
      throw new Error(`Order ${currentOrderId} not found`);
    }

    const data = await res.json();
    const order = data.order || data;
    const rider = data.rider || order.rider || null;
    const restaurant = data.restaurant || { latitude: -17.8315, longitude: 31.0535 };

    renderTrackingUI(order, rider, restaurant);
  } catch (err) {
    if (!isSilent) {
      alert(`⚠️ Could not find order "${currentOrderId}". Please check the order number and try again.`);
    }
  }
}

function renderTrackingUI(order, rider, restaurant) {
  document.getElementById("tracker-empty-state").style.display = "none";
  document.getElementById("tracker-content-area").style.display = "block";

  document.getElementById("lbl-order-id").textContent = order.id;

  // Status mapping
  const status = (order.order_status || order.status || "new").toLowerCase();
  
  const statusPill = document.getElementById("lbl-status-pill");
  statusPill.className = "track-status-pill";
  if (status === "delivered" || status === "completed") {
    statusPill.classList.add("delivered");
    statusPill.textContent = "DELIVERED ✅";
  } else if (status === "on_the_way") {
    statusPill.textContent = "ON THE WAY 🛵";
  } else if (status === "picked_up") {
    statusPill.textContent = "PICKED UP 🎒";
  } else if (status === "assigned") {
    statusPill.textContent = "RIDER ASSIGNED 📍";
  } else if (status === "accepted" || status === "preparing" || status === "ready") {
    statusPill.textContent = "ORDER ACCEPTED 📋";
  } else {
    statusPill.textContent = "ORDER RECEIVED 📋";
  }

  // Update Stepper
  const steps = ["received", "accepted", "assigned", "pickedup", "ontheway", "delivered"];
  let activeIndex = 0;

  if (status === "accepted" || status === "preparing" || status === "ready") activeIndex = 1;
  else if (status === "assigned") activeIndex = 2;
  else if (status === "picked_up") activeIndex = 3;
  else if (status === "on_the_way") activeIndex = 4;
  else if (status === "delivered" || status === "completed") activeIndex = 5;

  steps.forEach((stepKey, idx) => {
    const el = document.getElementById(`step-${stepKey}`);
    if (el) {
      el.classList.remove("active", "completed");
      if (idx < activeIndex) {
        el.classList.add("completed");
      } else if (idx === activeIndex) {
        el.classList.add("active");
      }
    }
  });

  // ETA text
  const etaText = document.getElementById("lbl-eta-text");
  if (status === "delivered" || status === "completed") {
    etaText.textContent = "Arrived / Delivered";
  } else if (status === "on_the_way") {
    etaText.textContent = "5 - 12 mins away";
  } else if (status === "assigned") {
    etaText.textContent = "12 - 20 mins away";
  } else {
    etaText.textContent = "15 - 30 mins";
  }

  // Customer info
  const customerBox = document.getElementById("lbl-customer-details");
  const phone = order.phone || "";
  const typeStr = (order.type || "pickup").toUpperCase();
  const address = order.notes || (order.type === "delivery" ? "Harare CBD Delivery" : "Collection at Roadport Branch");
  customerBox.innerHTML = `
    <div><strong>Customer:</strong> ${order.customer_name || 'Customer'} (${phone})</div>
    <div><strong>Order Type:</strong> ${typeStr} • <strong>Payment:</strong> ${order.payment_method || 'Cash'}</div>
    <div><strong>Location/Address:</strong> ${address}</div>
  `;

  // Items
  const itemsContainer = document.getElementById("lbl-items-container");
  itemsContainer.innerHTML = "";
  const items = Array.isArray(order.items) ? order.items : [];
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <span>${item.qty || item.quantity || 1}x ${item.name || 'Item'}</span>
      <span>$${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}</span>
    `;
    itemsContainer.appendChild(row);
  });

  document.getElementById("lbl-total-amount").textContent = `$${parseFloat(order.total || 0).toFixed(2)}`;

  // Rider Card & Map
  const riderCard = document.getElementById("rider-card");
  const mapSection = document.getElementById("delivery-map-section");

  if (rider) {
    riderCard.style.display = "flex";
    document.getElementById("lbl-rider-name").textContent = rider.name || "Bamboo Rider";
    document.getElementById("lbl-rider-vehicle").textContent = `${rider.vehicle || 'Scooter'} • ${rider.phone || ''}`;
    const callBtn = document.getElementById("btn-call-rider");
    if (callBtn) callBtn.href = `tel:${rider.phone || ''}`;
  } else {
    riderCard.style.display = "none";
  }

  // Render Map if coordinates exist or rider is assigned
  if (typeof L !== 'undefined' && (order.customer_lat || (rider && rider.current_lat) || restaurant.latitude)) {
    mapSection.style.display = "block";
    updateDeliveryMap(order, rider, restaurant);
  } else {
    mapSection.style.display = "none";
  }
}

function updateDeliveryMap(order, rider, restaurant) {
  const restLat = restaurant.latitude || -17.8315;
  const restLng = restaurant.longitude || 31.0535;

  const custLat = order.customer_lat || -17.8292;
  const custLng = order.customer_lng || 31.0522;

  const riderLat = rider ? (rider.current_lat || restLat) : restLat;
  const riderLng = rider ? (rider.current_lng || restLng) : restLng;

  if (!mapInstance) {
    mapInstance = L.map("leaflet-map").setView([restLat, restLng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(mapInstance);
  }

  // Icons
  const restIcon = L.divIcon({
    html: `<div style="font-size:24px; text-shadow:0 2px 6px rgba(0,0,0,0.4);">🎋</div>`,
    className: 'custom-map-icon',
    iconSize: [30, 30]
  });

  const custIcon = L.divIcon({
    html: `<div style="font-size:24px; text-shadow:0 2px 6px rgba(0,0,0,0.4);">📍</div>`,
    className: 'custom-map-icon',
    iconSize: [30, 30]
  });

  const riderIcon = L.divIcon({
    html: `<div style="font-size:28px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));">🛵</div>`,
    className: 'custom-map-icon',
    iconSize: [34, 34]
  });

  // Markers
  if (restaurantMarker) mapInstance.removeLayer(restaurantMarker);
  restaurantMarker = L.marker([restLat, restLng], { icon: restIcon })
    .addTo(mapInstance)
    .bindPopup("<b>Bamboo Chicken Branch</b><br>Roadport Main Branch");

  if (customerMarker) mapInstance.removeLayer(customerMarker);
  customerMarker = L.marker([custLat, custLng], { icon: custIcon })
    .addTo(mapInstance)
    .bindPopup("<b>Customer Delivery Point</b>");

  if (rider) {
    if (riderMarker) mapInstance.removeLayer(riderMarker);
    riderMarker = L.marker([riderLat, riderLng], { icon: riderIcon })
      .addTo(mapInstance)
      .bindPopup(`<b>${rider.name} (Rider)</b><br>On The Way`);
    
    // Fit bounds
    const group = L.featureGroup([restaurantMarker, customerMarker, riderMarker]);
    mapInstance.fitBounds(group.getBounds().pad(0.2));
  } else {
    const group = L.featureGroup([restaurantMarker, customerMarker]);
    mapInstance.fitBounds(group.getBounds().pad(0.2));
  }
}
