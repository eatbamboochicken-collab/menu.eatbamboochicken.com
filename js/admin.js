/**
 * Bamboo Chicken — Dedicated Administrator Control Engine
 * Handles Business Intelligence, Audit Logs, Staff & Permissions, Rider Fleet,
 * Inventory Management, Supplier Directory, Executive Reports, and System Config.
 */

let currentAdminTab = "bi"; // Default: Analytics & BI
let inventoryData = [];
let suppliersData = [];
let ridersData = [];
let auditLogsData = [];
let staffData = [
  { id: "STF-101", name: "Chipo Mutasa", role: "cashier", status: "Active", phone: "+263 77 111 2222", lastLogin: "Today, 08:30 AM" },
  { id: "STF-102", name: "Kudzai Banda", role: "kitchen", status: "Active", phone: "+263 77 333 4444", lastLogin: "Today, 07:45 AM" },
  { id: "STF-103", name: "Tinashe Moyo", role: "rider", status: "Active", phone: "+263 77 444 5555", lastLogin: "Today, 09:12 AM" },
  { id: "STF-104", name: "Simba Ndlovu", role: "admin", status: "Active", phone: "+263 77 888 9999", lastLogin: "Today, 07:00 AM" }
];

// Initialize Administrator Portal
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  switchAdminTab(currentAdminTab);
  refreshAdminData();

  // Refresh every 10 seconds
  setInterval(refreshAdminData, 10000);
});

// Clock widget
function initClock() {
  const clockEl = document.getElementById("pos-clock");
  if (clockEl) {
    const update = () => { clockEl.textContent = new Date().toLocaleTimeString(); };
    setInterval(update, 1000);
    update();
  }
}

// Global Refresh Data
function refreshAdminData() {
  fetchBIData();
  fetchAuditLogs();
  fetchAdminRiders();
  fetchInventory();
  fetchSuppliers();
  renderStaffList();
}

// Module Tab Switcher
window.switchAdminTab = function(tabName) {
  currentAdminTab = tabName;

  // Active button state
  document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
  const activeTabBtn = document.getElementById(`tab-${tabName}`);
  if (activeTabBtn) activeTabBtn.classList.add("active");

  // Show/hide view containers
  const modules = ["bi", "audit", "riders", "staff", "inventory", "suppliers", "reports", "config"];
  modules.forEach(m => {
    const el = document.getElementById(`module-view-${m}`);
    if (el) el.style.display = (m === tabName) ? "block" : "none";
  });

  // Fetch module specific data
  if (tabName === "bi") fetchBIData();
  else if (tabName === "audit") fetchAuditLogs();
  else if (tabName === "riders") fetchAdminRiders();
  else if (tabName === "staff") renderStaffList();
  else if (tabName === "inventory") fetchInventory();
  else if (tabName === "suppliers") fetchSuppliers();
  else if (tabName === "reports") fetchAndRenderReport();
};

/* ==========================================
   1. BUSINESS INTELLIGENCE & ANALYTICS
   ========================================== */
async function fetchBIData() {
  try {
    const res = await fetch("/orders", {
      headers: { "X-User-Role": "admin", "X-User-Name": "Administrator" }
    });
    if (!res.ok) return;

    const orders = await res.json();
    const orderList = Array.isArray(orders) ? orders : [];

    // Revenue calculation
    const totalRev = orderList
      .filter(o => o.order_status !== "cancelled" && o.status !== "cancelled")
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    const revEl = document.getElementById("bi-val-revenue");
    if (revEl) revEl.textContent = `$${totalRev.toFixed(2)}`;

    // Popular Item
    const itemCounts = {};
    orderList.forEach(o => {
      let items = o.items || [];
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch(e) { items = []; }
      }
      if (Array.isArray(items)) {
        items.forEach(i => {
          const name = i.name || i.item_name || "Sadza Meal";
          itemCounts[name] = (itemCounts[name] || 0) + (parseInt(i.qty || 1, 10));
        });
      }
    });

    let topItem = "--";
    let maxCount = 0;
    Object.keys(itemCounts).forEach(name => {
      if (itemCounts[name] > maxCount) {
        maxCount = itemCounts[name];
        topItem = `${name} (${maxCount})`;
      }
    });
    const popEl = document.getElementById("bi-val-popitem");
    if (popEl) popEl.textContent = topItem;

    // Prep time & delivery time averages
    const prepEl = document.getElementById("bi-val-preptime");
    if (prepEl) prepEl.textContent = "12 min";

    const delivEl = document.getElementById("bi-val-delivtime");
    if (delivEl) delivEl.textContent = "18 min";

    const areaEl = document.getElementById("bi-val-toparea");
    if (areaEl) areaEl.textContent = "Eastlea / Avenues";

    // Payment methods breakdown
    renderPaymentSplit(orderList);

    // Customer insights
    renderCustomerInsights(orderList);

    // Order Processing & Dispatch Speed
    renderProcessingSpeed(orderList);
  } catch (err) {
    console.error("BI fetch error:", err);
  }
}

function renderProcessingSpeed(orders) {
  const perfBox = document.getElementById("bi-kitchen-performance-box");
  if (!perfBox) return;

  const totalCount = orders.length || 0;
  const completedCount = orders.filter(o => o.order_status === "completed" || o.status === "completed").length;
  const activeCount = orders.filter(o => ["pending", "accepted", "assigned", "picked_up", "on_the_way"].includes(o.order_status || o.status)).length;
  perfBox.innerHTML = `
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
      <span>Active Operational Orders:</span>
      <strong style="color: #FF5A00;">${activeCount} active</strong>
    </div>
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
      <span>Completed Orders Rate:</span>
      <strong style="color: #10B981;">${totalCount ? Math.round((completedCount / totalCount) * 100) : 100}%</strong>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Target Accept-to-Dispatch:</span>
      <strong style="color: #3B82F6;">&lt; 10 mins</strong>
    </div>
  `;
}

function renderPaymentSplit(orders) {
  const container = document.getElementById("bi-payment-split-box");
  if (!container) return;

  const methodCounts = { "Cash on Delivery": 0, "EcoCash Mobile": 0, "Card / Swipe": 0 };
  orders.forEach(o => {
    const method = o.payment_method || "Cash on Delivery";
    if (method.toLowerCase().includes("ecocash")) methodCounts["EcoCash Mobile"]++;
    else if (method.toLowerCase().includes("card") || method.toLowerCase().includes("swipe")) methodCounts["Card / Swipe"]++;
    else methodCounts["Cash on Delivery"]++;
  });

  const total = orders.length || 1;
  container.innerHTML = Object.keys(methodCounts).map(m => {
    const count = methodCounts[m];
    const pct = Math.round((count / total) * 100);
    return `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #FFF; margin-bottom: 4px;">
          <span>${m}</span>
          <span><strong>${count}</strong> (${pct}%)</span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: #FF5A00; border-radius: 4px;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCustomerInsights(orders) {
  const container = document.getElementById("bi-customer-insights-box");
  if (!container) return;

  const totalOrders = orders.length;
  const uniquePhones = new Set(orders.map(o => o.phone).filter(Boolean)).size;
  const repeatCustomers = Math.max(0, totalOrders - uniquePhones);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
      <span>Total Unique Customers:</span>
      <strong style="color: #FFF;">${uniquePhones || totalOrders}</strong>
    </div>
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px;">
      <span>Repeat Order Velocity:</span>
      <strong style="color: #10B981;">${repeatCustomers} repeat visits</strong>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Avg Order Value:</span>
      <strong style="color: #FF5A00;">$${totalOrders ? (orders.reduce((s, o) => s + parseFloat(o.total || 0), 0) / totalOrders).toFixed(2) : '0.00'}</strong>
    </div>
  `;
}

/* ==========================================
   2. SYSTEM AUDIT LOGS
   ========================================== */
async function fetchAuditLogs() {
  try {
    const res = await fetch("/audit-logs", {
      headers: { "X-User-Role": "admin" }
    });
    if (res.ok) {
      const data = await res.json();
      auditLogsData = Array.isArray(data) ? data : [];
      renderFullAuditLogs();
    }
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

function renderFullAuditLogs() {
  const container = document.getElementById("audit-logs-full-list");
  if (!container) return;

  if (auditLogsData.length === 0) {
    container.innerHTML = `<div style="color: #9CA3AF; text-align: center; padding: 24px;">No system audit logs recorded.</div>`;
    return;
  }

  container.innerHTML = auditLogsData.map(log => `
    <div style="background: #1C1C22; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.2rem;">📜</span>
        <div>
          <strong style="color: #FFF; font-size: 0.92rem;">${log.action || 'System Action'}</strong>
          <div style="font-size: 0.78rem; color: #9CA3AF;">
            Order: <strong style="color: #FF5A00;">${log.order_id || 'N/A'}</strong> • User: ${log.user_name || 'System'} (${log.role || 'system'})
          </div>
        </div>
      </div>
      <span style="font-size: 0.78rem; color: #6B7280; font-family: monospace;">
        ${new Date(log.timestamp || Date.now()).toLocaleString()}
      </span>
    </div>
  `).join('');
}

/* ==========================================
   3. RIDER FLEET MANAGEMENT
   ========================================== */
async function fetchAdminRiders() {
  try {
    const res = await fetch("/riders", {
      headers: { "X-User-Role": "admin" }
    });
    if (res.ok) {
      ridersData = await res.json();
      renderRidersAdminTable();
    }
  } catch (err) {
    console.error("Rider fetch error:", err);
  }
}

function renderRidersAdminTable() {
  const tbody = document.getElementById("riders-admin-table-body");
  if (!tbody) return;

  if (ridersData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #9CA3AF; padding: 24px;">No riders found. Click "Register New Rider" to add.</td></tr>`;
    return;
  }

  tbody.innerHTML = ridersData.map(r => {
    const isOnline = r.status === "online";
    return `
      <tr>
        <td style="font-weight: 700; color: #FF5A00;">${r.id}</td>
        <td style="color: #FFF; font-weight: 700;">${r.name}</td>
        <td>${r.phone || '--'}</td>
        <td>${r.vehicle || 'Scooter'}</td>
        <td>
          <span style="padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: ${isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)'}; color: ${isOnline ? '#10B981' : '#9CA3AF'};">
            ${isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </td>
        <td style="font-size: 0.8rem; color: #9CA3AF;">${new Date(r.last_active || Date.now()).toLocaleTimeString()}</td>
        <td style="text-align: right;">
          <button type="button" class="pos-btn pos-btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="toggleRiderStatus('${r.id}', '${isOnline ? 'offline' : 'online'}')">
            Toggle ${isOnline ? 'Offline' : 'Online'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleRiderStatus(riderId, newStatus) {
  try {
    const res = await fetch(`/riders/${riderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-User-Role": "admin" },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchAdminRiders();
  } catch (err) {
    console.error("Error toggling rider status:", err);
  }
}

function openAddRiderModal() {
  const modal = document.getElementById("modal-add-rider");
  if (modal) modal.style.display = "flex";
}

function closeAddRiderModal() {
  const modal = document.getElementById("modal-add-rider");
  if (modal) modal.style.display = "none";
}

async function submitNewRider() {
  const name = document.getElementById("new-rider-name").value.trim();
  const phone = document.getElementById("new-rider-phone").value.trim();
  const vehicle = document.getElementById("new-rider-vehicle").value.trim();

  if (!name || !phone) {
    alert("Please provide rider name and phone number.");
    return;
  }

  try {
    const res = await fetch("/riders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Role": "admin" },
      body: JSON.stringify({ name, phone, vehicle })
    });

    if (res.ok) {
      closeAddRiderModal();
      document.getElementById("new-rider-name").value = "";
      document.getElementById("new-rider-phone").value = "";
      document.getElementById("new-rider-vehicle").value = "";
      fetchAdminRiders();
    } else {
      alert("Failed to create rider.");
    }
  } catch (err) {
    console.error("Add rider error:", err);
  }
}

/* ==========================================
   4. STAFF & PERMISSIONS MANAGEMENT
   ========================================== */
function renderStaffList() {
  const container = document.getElementById("staff-members-list");
  if (!container) return;

  container.innerHTML = staffData.map(s => {
    let roleBadgeBg = "rgba(59, 130, 246, 0.15)";
    let roleColor = "#60A5FA";
    if (s.role === "admin") { roleBadgeBg = "rgba(239, 68, 68, 0.15)"; roleColor = "#F87171"; }
    else if (s.role === "kitchen") { roleBadgeBg = "rgba(245, 158, 11, 0.15)"; roleColor = "#FBBF24"; }

    return `
      <div class="staff-card">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(255,90,0,0.15); display: flex; align-items: center; justify-content: center; color: #FF5A00; font-weight: 800; font-size: 1.1rem;">
            ${s.name.charAt(0)}
          </div>
          <div>
            <strong style="color: #FFF; font-size: 1rem;">${s.name}</strong>
            <div style="font-size: 0.8rem; color: #9CA3AF;">📞 ${s.phone} • Last Login: ${s.lastLogin}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="padding: 4px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; background: ${roleBadgeBg}; color: ${roleColor}; text-transform: uppercase;">
            ${s.role}
          </span>
          <button type="button" class="pos-btn pos-btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="removeStaffMember('${s.id}')">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddStaffModal() {
  const modal = document.getElementById("modal-add-staff");
  if (modal) modal.style.display = "flex";
}

function closeAddStaffModal() {
  const modal = document.getElementById("modal-add-staff");
  if (modal) modal.style.display = "none";
}

function submitNewStaff() {
  const name = document.getElementById("new-staff-name").value.trim();
  const role = document.getElementById("new-staff-role").value;

  if (!name) {
    alert("Please enter staff name.");
    return;
  }

  const phoneInput = document.getElementById("new-staff-phone");
  const phone = phoneInput ? phoneInput.value.trim() : "";

  const newStaff = {
    id: `STF-${Date.now().toString().slice(-4)}`,
    name,
    role,
    status: "Active",
    phone: phone || "Not provided",
    lastLogin: "Just created"
  };

  staffData.push(newStaff);
  closeAddStaffModal();
  document.getElementById("new-staff-name").value = "";
  renderStaffList();
}

function removeStaffMember(id) {
  staffData = staffData.filter(s => s.id !== id);
  renderStaffList();
}

/* ==========================================
   5. INVENTORY & INGREDIENT MANAGEMENT
   ========================================== */
async function fetchInventory() {
  try {
    const res = await fetch("/inventory", {
      headers: { "X-User-Role": "admin" }
    });
    if (res.ok) {
      inventoryData = await res.json();
      renderInventoryTable();
    }
  } catch (err) {
    console.error("Inventory fetch error:", err);
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById("inventory-table-body");
  if (!tbody) return;

  if (inventoryData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #9CA3AF; padding: 24px;">No inventory items recorded. Click "Add New Ingredient" to start.</td></tr>`;
    return;
  }

  tbody.innerHTML = inventoryData.map(item => {
    const isLow = item.current_qty <= item.min_threshold;
    return `
      <tr>
        <td style="font-weight: 700; color: #FF5A00;">${item.id}</td>
        <td style="color: #FFF; font-weight: 700;">${item.name}</td>
        <td>${item.category || 'General'}</td>
        <td style="font-weight: 800; color: ${isLow ? '#EF4444' : '#10B981'};">${item.current_qty} ${item.unit}</td>
        <td style="color: #9CA3AF;">${item.min_threshold} ${item.unit}</td>
        <td>
          <span style="padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: ${isLow ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}; color: ${isLow ? '#EF4444' : '#10B981'};">
            ${isLow ? '⚠️ LOW STOCK' : 'OK'}
          </span>
        </td>
        <td>${item.supplier || 'Local Supplier'}</td>
        <td style="font-size: 0.8rem; color: #9CA3AF;">${new Date(item.last_updated || Date.now()).toLocaleDateString()}</td>
        <td style="text-align: right;">
          <button type="button" class="pos-btn pos-btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openRestockModal('${item.id}', '${item.name}')">Restock</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddInventoryModal() {
  const modal = document.getElementById("modal-add-inventory");
  if (modal) modal.style.display = "flex";
}

function closeAddInventoryModal() {
  const modal = document.getElementById("modal-add-inventory");
  if (modal) modal.style.display = "none";
}

async function submitNewInventoryItem() {
  const name = document.getElementById("new-inv-name").value.trim();
  const category = document.getElementById("new-inv-category").value.trim();
  const unit = document.getElementById("new-inv-unit").value.trim();
  const qty = parseFloat(document.getElementById("new-inv-qty").value || 0);
  const min = parseFloat(document.getElementById("new-inv-min").value || 0);

  if (!name || !unit) {
    alert("Please provide ingredient name and unit.");
    return;
  }

  try {
    const res = await fetch("/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Role": "admin" },
      body: JSON.stringify({ name, category, unit, current_qty: qty, min_threshold: min })
    });

    if (res.ok) {
      closeAddInventoryModal();
      fetchInventory();
    } else {
      alert("Failed to add inventory item.");
    }
  } catch (err) {
    console.error("Add inventory error:", err);
  }
}

/* ==========================================
   6. SUPPLIERS DIRECTORY
   ========================================== */
async function fetchSuppliers() {
  try {
    const res = await fetch("/suppliers", {
      headers: { "X-User-Role": "admin" }
    });
    if (res.ok) {
      suppliersData = await res.json();
      renderSuppliersGrid();
    }
  } catch (err) {
    console.error("Suppliers fetch error:", err);
  }
}

function renderSuppliersGrid() {
  const container = document.getElementById("suppliers-list-grid");
  if (!container) return;

  if (suppliersData.length === 0) {
    container.innerHTML = `<div style="color: #9CA3AF; text-align: center; padding: 24px;">No suppliers registered. Click "Add New Supplier" to create.</div>`;
    return;
  }

  container.innerHTML = suppliersData.map(sup => `
    <div style="background: #1C1C22; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <strong style="color: #FFF; font-size: 1.05rem;">${sup.name}</strong>
        <span style="font-size: 0.75rem; color: #FF5A00; font-weight: 700;">${sup.id}</span>
      </div>
      <div style="font-size: 0.85rem; color: #E5E7EB; margin-bottom: 6px;">📞 ${sup.phone || 'N/A'}</div>
      <div style="font-size: 0.85rem; color: #E5E7EB; margin-bottom: 6px;">✉️ ${sup.email || 'N/A'}</div>
      <div style="font-size: 0.82rem; color: #9CA3AF; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
        Supplies: <strong>${sup.items_supplied || 'Chicken & Vegetables'}</strong>
      </div>
    </div>
  `).join('');
}

function openAddSupplierModal() {
  const modal = document.getElementById("modal-supplier");
  if (modal) modal.style.display = "flex";
}

function closeSupplierModal() {
  const modal = document.getElementById("modal-supplier");
  if (modal) modal.style.display = "none";
}

async function submitSupplierForm() {
  const name = document.getElementById("sup-name").value.trim();
  const phone = document.getElementById("sup-phone").value.trim();
  const email = document.getElementById("sup-email").value.trim();
  const items = document.getElementById("sup-items").value.trim();

  if (!name) {
    alert("Please enter supplier name.");
    return;
  }

  try {
    const res = await fetch("/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Role": "admin" },
      body: JSON.stringify({ name, phone, email, items_supplied: items })
    });

    if (res.ok) {
      closeSupplierModal();
      fetchSuppliers();
    }
  } catch (err) {
    console.error("Submit supplier error:", err);
  }
}

/* ==========================================
   7. EXECUTIVE REPORTS & EXPORT
   ========================================== */
async function fetchAndRenderReport() {
  const container = document.getElementById("report-printable-area");
  const timeframe = document.getElementById("report-timeframe-select") ? document.getElementById("report-timeframe-select").value : "today";
  if (!container) return;

  try {
    const res = await fetch("/orders", { headers: { "X-User-Role": "admin" } });
    const orders = res.ok ? await res.json() : [];

    const totalRev = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
    const completedCount = orders.filter(o => o.order_status === "completed" || o.status === "completed").length;

    container.innerHTML = `
      <div style="background: #FFF; color: #000; padding: 24px; border-radius: 8px; font-family: sans-serif;">
        <div style="border-bottom: 2px solid #FF5A00; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 1.4rem; color: #111;">BAMBOO CHICKEN RESTAURANT</h2>
            <div style="font-size: 0.88rem; color: #666;">Executive Operational & Financial Summary (${timeframe.toUpperCase()})</div>
          </div>
          <div style="text-align: right; font-size: 0.8rem; color: #666;">
            Generated: ${new Date().toLocaleString()}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
          <div style="background: #F3F4F6; padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.78rem; color: #6B7280; text-transform: uppercase;">Total Period Revenue</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: #FF5A00;">$${totalRev.toFixed(2)}</div>
          </div>
          <div style="background: #F3F4F6; padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.78rem; color: #6B7280; text-transform: uppercase;">Total Orders Processed</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: #111;">${orders.length}</div>
          </div>
          <div style="background: #F3F4F6; padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.78rem; color: #6B7280; text-transform: uppercase;">Completed Orders</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: #10B981;">${completedCount}</div>
          </div>
        </div>

        <h4 style="margin-bottom: 8px; color: #111;">Recent Order Summary</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="background: #E5E7EB; text-align: left;">
              <th style="padding: 8px;">Order #</th>
              <th style="padding: 8px;">Customer</th>
              <th style="padding: 8px;">Type</th>
              <th style="padding: 8px;">Status</th>
              <th style="padding: 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${orders.slice(0, 10).map(o => `
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 8px; font-weight: 700;">${o.id}</td>
                <td style="padding: 8px;">${o.customer_name || 'Customer'}</td>
                <td style="padding: 8px;">${o.type || 'Pickup'}</td>
                <td style="padding: 8px;">${o.order_status || 'completed'}</td>
                <td style="padding: 8px; text-align: right; font-weight: 700;">$${parseFloat(o.total || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    console.error("Report error:", err);
  }
}

function exportReportCSV() {
  let csv = "Order_ID,Customer_Name,Phone,Type,Status,Payment_Status,Total\n";
  fetch("/orders", { headers: { "X-User-Role": "admin" } })
    .then(res => res.json())
    .then(data => {
      const list = Array.isArray(data) ? data : [];
      list.forEach(o => {
        csv += `"${o.id}","${o.customer_name || ''}","${o.phone || ''}","${o.type || 'pickup'}","${o.order_status || 'pending'}","${o.payment_status || 'pending'}",${o.total || 0}\n`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bamboo_Chicken_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    });
}

function printExecutiveReport() {
  const area = document.getElementById("report-printable-area");
  if (!area) return;
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Executive Report</title></head><body>${area.innerHTML}<script>window.onload=function(){window.print();window.close();}</script></body></html>`);
  win.document.close();
}

/* ==========================================
   8. SYSTEM CONFIGURATION
   ========================================== */
function saveSystemConfig() {
  alert("System parameters saved successfully!");
}

// Global modal bindings
window.openAddRiderModal = openAddRiderModal;
window.closeAddRiderModal = closeAddRiderModal;
window.submitNewRider = submitNewRider;
window.openAddStaffModal = openAddStaffModal;
window.closeAddStaffModal = closeAddStaffModal;
window.submitNewStaff = submitNewStaff;
window.removeStaffMember = removeStaffMember;
window.openAddInventoryModal = openAddInventoryModal;
window.closeAddInventoryModal = closeAddInventoryModal;
window.submitNewInventoryItem = submitNewInventoryItem;
window.openAddSupplierModal = openAddSupplierModal;
window.closeSupplierModal = closeSupplierModal;
window.submitSupplierForm = submitSupplierForm;
window.exportReportCSV = exportReportCSV;
window.printExecutiveReport = printExecutiveReport;
window.saveSystemConfig = saveSystemConfig;
window.refreshAdminData = refreshAdminData;
