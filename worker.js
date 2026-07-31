/**
 * Bamboo Chicken Orders & Delivery API - Cloudflare Worker
 * Base URL: https://bamboo-orders-api.warstreett.workers.dev
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Role, X-User-Name",
  "Content-Type": "application/json"
};

// VALID STATUS ENUMS
const VALID_ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "assigned",
  "picked_up",
  "on_the_way",
  "delivered",
  "completed",
  "cancelled"
];

const VALID_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded"
];

// Normalize order status
function normalizeOrderStatus(statusStr) {
  if (!statusStr) return "pending";
  const s = String(statusStr).toLowerCase().trim().replace(/[\s\-]/g, "_");
  if (VALID_ORDER_STATUSES.includes(s)) return s;
  if (s.includes("prep")) return "preparing";
  if (s.includes("read")) return "ready";
  if (s.includes("assign")) return "assigned";
  if (s.includes("pick")) return "picked_up";
  if (s.includes("way")) return "on_the_way";
  if (s.includes("deliv")) return "delivered";
  if (s.includes("comp") || s.includes("done")) return "completed";
  if (s.includes("canc")) return "cancelled";
  if (s.includes("accept")) return "accepted";
  return "pending";
}

// Normalize payment status
function normalizePaymentStatus(statusStr) {
  if (!statusStr) return "pending";
  const s = String(statusStr).toLowerCase().trim();
  if (s.includes("paid")) return "paid";
  if (s.includes("fail")) return "failed";
  if (s.includes("refun")) return "refunded";
  return "pending";
}

// -------------------------------------------------------------
// INVENTORY & SUPPLIER DATABASE ENGINES
// -------------------------------------------------------------
let inMemoryInventory = [
  { id: "INV-101", name: "Chicken Pieces", category: "Poultry", current_qty: 120, unit: "pieces", min_stock: 30, supplier_id: "SUP-1", supplier_name: "Zambezi Poultry Co.", last_updated: new Date().toISOString() },
  { id: "INV-102", name: "Chicken Wings", category: "Poultry", current_qty: 85, unit: "pieces", min_stock: 25, supplier_id: "SUP-1", supplier_name: "Zambezi Poultry Co.", last_updated: new Date().toISOString() },
  { id: "INV-103", name: "Chicken Fillets", category: "Poultry", current_qty: 45, unit: "pieces", min_stock: 15, supplier_id: "SUP-1", supplier_name: "Zambezi Poultry Co.", last_updated: new Date().toISOString() },
  { id: "INV-104", name: "Chips (Potatoes)", category: "Produce", current_qty: 60, unit: "kg", min_stock: 15, supplier_id: "SUP-2", supplier_name: "Mashonaland Fresh Produce", last_updated: new Date().toISOString() },
  { id: "INV-105", name: "Cooking Oil", category: "Pantry", current_qty: 35, unit: "liters", min_stock: 10, supplier_id: "SUP-2", supplier_name: "Mashonaland Fresh Produce", last_updated: new Date().toISOString() },
  { id: "INV-106", name: "Rice", category: "Grains", current_qty: 50, unit: "kg", min_stock: 10, supplier_id: "SUP-2", supplier_name: "Mashonaland Fresh Produce", last_updated: new Date().toISOString() },
  { id: "INV-107", name: "Sadza Mealie Meal", category: "Grains", current_qty: 40, unit: "kg", min_stock: 10, supplier_id: "SUP-2", supplier_name: "Mashonaland Fresh Produce", last_updated: new Date().toISOString() },
  { id: "INV-108", name: "Soft Drinks", category: "Beverages", current_qty: 150, unit: "cans", min_stock: 40, supplier_id: "SUP-3", supplier_name: "Victoria Falls Beverages", last_updated: new Date().toISOString() },
  { id: "INV-109", name: "Water Bottles", category: "Beverages", current_qty: 90, unit: "bottles", min_stock: 20, supplier_id: "SUP-3", supplier_name: "Victoria Falls Beverages", last_updated: new Date().toISOString() },
  { id: "INV-110", name: "Packaging Boxes & Foil", category: "Disposables", current_qty: 300, unit: "units", min_stock: 50, supplier_id: "SUP-3", supplier_name: "Victoria Falls Beverages", last_updated: new Date().toISOString() },
  { id: "INV-111", name: "Bamboo Sauce", category: "Condiments", current_qty: 25, unit: "liters", min_stock: 5, supplier_id: "SUP-1", supplier_name: "Zambezi Poultry Co.", last_updated: new Date().toISOString() },
  { id: "INV-112", name: "Disposable Cutlery", category: "Disposables", current_qty: 250, unit: "sets", min_stock: 50, supplier_id: "SUP-3", supplier_name: "Victoria Falls Beverages", last_updated: new Date().toISOString() },
  { id: "INV-113", name: "Tortilla Wraps", category: "Bakery", current_qty: 30, unit: "packs", min_stock: 10, supplier_id: "SUP-2", supplier_name: "Mashonaland Fresh Produce", last_updated: new Date().toISOString() },
  { id: "INV-114", name: "Burger Buns", category: "Bakery", current_qty: 40, unit: "buns", min_stock: 15, supplier_id: "SUP-2", supplier_name: "Mashonaland Fresh Produce", last_updated: new Date().toISOString() }
];

let inMemorySuppliers = [
  { id: "SUP-1", name: "Zambezi Poultry Co.", phone: "+263 77 111 2222", email: "orders@zambezipoultry.co.zw", items_supplied: "Chicken Pieces, Chicken Wings, Chicken Fillets, Bamboo Sauce", notes: "Delivers Mondays and Thursdays before 8:00 AM.", created_at: new Date().toISOString() },
  { id: "SUP-2", name: "Mashonaland Fresh Produce", phone: "+263 78 333 4444", email: "sales@mashproduce.co.zw", items_supplied: "Chips (Potatoes), Cooking Oil, Rice, Sadza Mealie Meal, Tortilla Wraps, Burger Buns", notes: "Local farm direct supplier.", created_at: new Date().toISOString() },
  { id: "SUP-3", name: "Victoria Falls Beverages", phone: "+263 71 555 6666", email: "logistics@vicfallsbev.co.zw", items_supplied: "Soft Drinks, Water Bottles, Packaging Boxes & Foil, Disposable Cutlery", notes: "Bulk beverage supplier.", created_at: new Date().toISOString() }
];

// Menu Item Ingredient Recipes (Mapping)
let inMemoryMenuRecipes = {
  "Classic Meal": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.2 },
    { ingredient_id: "INV-108", name: "Soft Drinks", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 },
    { ingredient_id: "INV-114", name: "Burger Buns", qty: 1 }
  ],
  "Bamboo Duo": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 2 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.2 },
    { ingredient_id: "INV-108", name: "Soft Drinks", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Wrap Combo": [
    { ingredient_id: "INV-103", name: "Chicken Fillets", qty: 1 },
    { ingredient_id: "INV-113", name: "Tortilla Wraps", qty: 1 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.25 },
    { ingredient_id: "INV-109", name: "Water Bottles", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Shawarma Feast": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 2 },
    { ingredient_id: "INV-113", name: "Tortilla Wraps", qty: 1 },
    { ingredient_id: "INV-108", name: "Soft Drinks", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Bamboo Value": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.15 },
    { ingredient_id: "INV-109", name: "Water Bottles", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Fillet Combo": [
    { ingredient_id: "INV-103", name: "Chicken Fillets", qty: 1 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.2 },
    { ingredient_id: "INV-108", name: "Soft Drinks", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Egg Sandwich": [
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Polony Sandwich": [
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Bamboo Chicken": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-111", name: "Bamboo Sauce", qty: 0.05 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "1 Piecer": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.2 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "2 Piecer": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 2 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.25 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "3 Piecer": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 3 },
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.3 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "8 Piece Bucket": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 8 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 },
    { ingredient_id: "INV-111", name: "Bamboo Sauce", qty: 0.2 }
  ],
  "Fried Rice Meal": [
    { ingredient_id: "INV-106", name: "Rice", qty: 0.25 },
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Sadza & Chicken": [
    { ingredient_id: "INV-107", name: "Sadza Mealie Meal", qty: 0.25 },
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Sadza & Beef": [
    { ingredient_id: "INV-107", name: "Sadza Mealie Meal", qty: 0.25 },
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Sadza & Big Chicken Backbone": [
    { ingredient_id: "INV-107", name: "Sadza Mealie Meal", qty: 0.25 },
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Chicken Burger": [
    { ingredient_id: "INV-103", name: "Chicken Fillets", qty: 1 },
    { ingredient_id: "INV-114", name: "Burger Buns", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Boss Burger": [
    { ingredient_id: "INV-103", name: "Chicken Fillets", qty: 2 },
    { ingredient_id: "INV-114", name: "Burger Buns", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Chicken Wrap": [
    { ingredient_id: "INV-103", name: "Chicken Fillets", qty: 1 },
    { ingredient_id: "INV-113", name: "Tortilla Wraps", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Chicken Fillet": [
    { ingredient_id: "INV-103", name: "Chicken Fillets", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Shawarma": [
    { ingredient_id: "INV-103", name: "Chicken Fillets", qty: 1 },
    { ingredient_id: "INV-113", name: "Tortilla Wraps", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Bamboo Pie": [
    { ingredient_id: "INV-101", name: "Chicken Pieces", qty: 1 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Chicken Bones": [
    { ingredient_id: "INV-102", name: "Chicken Wings", qty: 4 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Garden Salad": [
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Small Chips": [
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.2 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ],
  "Mega Chips": [
    { ingredient_id: "INV-104", name: "Chips (Potatoes)", qty: 0.4 },
    { ingredient_id: "INV-110", name: "Packaging Boxes & Foil", qty: 1 }
  ]
};

// Set of order IDs whose inventory was deducted on COMPLETED
const completedDeductedOrderIds = new Set();

// Deduct Stock on Order Completion
function deductStockOnCompletion(order, role = "system", userName = "System") {
  if (!order || !order.id) return;
  if (completedDeductedOrderIds.has(order.id)) return; // Already deducted

  const items = Array.isArray(order.items) ? order.items : [];
  let deductionLogs = [];

  items.forEach(item => {
    const itemName = item.name || item.item_name || "";
    const itemQty = parseInt(item.qty || item.quantity || 1, 10);
    const recipe = inMemoryMenuRecipes[itemName] || [];

    recipe.forEach(rec => {
      const invItem = inMemoryInventory.find(inv => inv.id === rec.ingredient_id || inv.name.toLowerCase() === rec.name.toLowerCase());
      if (invItem) {
        const totalDeduct = rec.qty * itemQty;
        invItem.current_qty = Math.max(0, parseFloat((invItem.current_qty - totalDeduct).toFixed(2)));
        invItem.last_updated = new Date().toISOString();
        deductionLogs.push(`${rec.name} (-${totalDeduct} ${invItem.unit})`);
      }
    });
  });

  completedDeductedOrderIds.add(order.id);

  if (deductionLogs.length > 0) {
    addAuditLog(order.id, `Stock Deducted on Completion: ${deductionLogs.join(", ")}`, role, userName);
  }
}

// Helper to determine out-of-stock menu items
function getOutOfStockMenuItems() {
  const outOfStockIngredients = new Set(
    inMemoryInventory.filter(inv => inv.current_qty <= 0).map(inv => inv.name.toLowerCase())
  );

  const unavailableMenuNames = [];
  for (const [menuName, recipe] of Object.entries(inMemoryMenuRecipes)) {
    const isOut = recipe.some(rec => outOfStockIngredients.has(rec.name.toLowerCase()));
    if (isOut) unavailableMenuNames.push(menuName);
  }
  return unavailableMenuNames;
}


// In-Memory Storage Engine
let inMemoryOrders = [
  {
    id: "BC-1001",
    customer_name: "Tendai Mukandi",
    phone: "+263 77 123 4567",
    items: [
      { name: "8 Piece Bucket", qty: 1, price: 9.00, options: "Extra crispy" },
      { name: "2 Bamboo Chicken", qty: 2, price: 1.50, options: "Spicy mayo" }
    ],
    total: 12.00,
    notes: "142 Samora Machel Ave, Harare",
    payment_method: "EcoCash",
    payment_status: "paid",
    type: "delivery",
    order_status: "on_the_way",
    customer_lat: -17.8292,
    customer_lng: 31.0522,
    location_accuracy: 12,
    rider_id: "RIDER-1",
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: "BC-1002",
    customer_name: "Chipo Moyo",
    phone: "+263 78 987 6543",
    items: [
      { name: "Classic Meal", qty: 2, price: 5.00, options: "Fanta Orange" }
    ],
    total: 10.00,
    notes: "Pickup at Roadport branch",
    payment_method: "Cash on Delivery",
    payment_status: "pending",
    type: "pickup",
    order_status: "preparing",
    customer_lat: null,
    customer_lng: null,
    location_accuracy: null,
    rider_id: null,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

let inMemoryRiders = [
  {
    id: "RIDER-1",
    name: "Tinashe Moyo",
    phone: "+263 77 444 5555",
    vehicle: "Honda Scooter (Red)",
    status: "online",
    current_lat: -17.8250,
    current_lng: 31.0480,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "RIDER-2",
    name: "Farai Chiwara",
    phone: "+263 71 222 3333",
    vehicle: "Yamaha E-Bike",
    status: "online",
    current_lat: -17.8310,
    current_lng: 31.0560,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "RIDER-3",
    name: "Blessing Nyoni",
    phone: "+263 73 888 9999",
    vehicle: "TVS Motorbike",
    status: "offline",
    current_lat: -17.8200,
    current_lng: 31.0400,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
];

let inMemorySavedLocations = [
  {
    id: "LOC-1",
    customer_phone: "+263 77 123 4567",
    address: "142 Samora Machel Ave, Eastlea, Harare",
    latitude: -17.8292,
    longitude: 31.0522,
    created_at: new Date().toISOString()
  }
];

let inMemoryAuditLogs = [
  {
    id: "LOG-1",
    order_id: "BC-1001",
    action: "Order Created",
    role: "customer",
    user_name: "Tendai Mukandi",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: "LOG-2",
    order_id: "BC-1001",
    action: "Kitchen Accepted",
    role: "kitchen",
    user_name: "Kitchen Terminal",
    timestamp: new Date(Date.now() - 20 * 60000).toISOString()
  }
];

// Helper to record audit logs
function addAuditLog(orderId, action, role = "system", userName = "System") {
  const logEntry = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    order_id: orderId,
    action: action,
    role: role,
    user_name: userName,
    timestamp: new Date().toISOString()
  };
  inMemoryAuditLogs.unshift(logEntry);
  return logEntry;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const jsonRes = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });

    const reqRole = request.headers.get("X-User-Role") || "guest";
    const reqUserName = request.headers.get("X-User-Name") || "Anonymous";

    try {
      // -------------------------------------------------------------
      // 1. ORDERS ENDPOINTS (/orders, /orders/:id)
      // -------------------------------------------------------------
      if (pathname === "/orders" || pathname === "/orders/" || pathname.startsWith("/orders/")) {
        const idMatch = pathname.match(/^\/orders\/([^\/]+)/);
        const orderId = idMatch ? idMatch[1] : null;

        // GET ORDERS
        if (request.method === "GET") {
          if (orderId) {
            let order = null;
            if (env && env.DB) {
              const res = await env.DB.prepare("SELECT * FROM orders WHERE id = ? OR id = ?").bind(orderId, `BC-${orderId}`).first();
              if (res) {
                order = {
                  ...res,
                  items: typeof res.items === 'string' ? JSON.parse(res.items) : res.items
                };
              }
            } else {
              order = inMemoryOrders.find(o => o.id === orderId || o.id === `BC-${orderId}`);
            }

            if (!order) return jsonRes({ error: "Order not found" }, 404);

            let rider = null;
            if (order.rider_id) {
              if (env && env.DB) {
                rider = await env.DB.prepare("SELECT * FROM riders WHERE id = ?").bind(order.rider_id).first();
              } else {
                rider = inMemoryRiders.find(r => r.id === order.rider_id) || null;
              }
            }
            return jsonRes({ ...order, rider });
          }

          // Return all orders with riders
          let orderList = [];
          if (env && env.DB) {
            const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
            orderList = (results || []).map(r => ({
              ...r,
              items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
            }));
          } else {
            orderList = [...inMemoryOrders];
          }

          const result = orderList.map(o => {
            const rider = o.rider_id ? (inMemoryRiders.find(r => r.id === o.rider_id) || null) : null;
            return { ...o, rider };
          });
          return jsonRes(result);
        }

        // POST ORDER (CREATE - CUSTOMER & SYSTEM)
        if (request.method === "POST") {
          const body = await request.json();
          const cleanIdNum = Math.floor(1000 + Math.random() * 9000);
          const newId = body.id || `BC-${cleanIdNum}`;

          const newOrder = {
            id: newId,
            customer_name: body.customer_name || body.name || "Customer",
            phone: body.phone || body.customer_phone || "",
            items: Array.isArray(body.items) ? body.items : [],
            total: parseFloat(body.total || 0),
            notes: body.notes || body.instructions || "",
            payment_method: body.payment_method || "Cash on Delivery",
            payment_status: normalizePaymentStatus(body.payment_status || "pending"),
            type: String(body.type || "pickup").toLowerCase().includes("delivery") ? "delivery" : "pickup",
            order_status: normalizeOrderStatus(body.order_status || body.status || "pending"),
            customer_lat: body.customer_lat !== undefined ? body.customer_lat : null,
            customer_lng: body.customer_lng !== undefined ? body.customer_lng : null,
            location_accuracy: body.location_accuracy || null,
            rider_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          if (env && env.DB) {
            await env.DB.prepare(`
              INSERT INTO orders (id, customer_name, phone, items, total, notes, payment_method, payment_status, type, order_status, customer_lat, customer_lng, location_accuracy, rider_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              newOrder.id, newOrder.customer_name, newOrder.phone, JSON.stringify(newOrder.items),
              newOrder.total, newOrder.notes, newOrder.payment_method, newOrder.payment_status,
              newOrder.type, newOrder.order_status, newOrder.customer_lat, newOrder.customer_lng,
              newOrder.location_accuracy, newOrder.rider_id, newOrder.created_at, newOrder.updated_at
            ).run();
          } else {
            // Idempotent check
            const existingIdx = inMemoryOrders.findIndex(o => o.id === newOrder.id);
            if (existingIdx >= 0) {
              inMemoryOrders[existingIdx] = newOrder;
            } else {
              inMemoryOrders.unshift(newOrder);
            }
          }

          addAuditLog(newOrder.id, "Order Created", "customer", newOrder.customer_name);

          return jsonRes({ success: true, order: newOrder }, 201);
        }

        // PATCH / PUT ORDER (UPDATE STATUS / ASSIGNMENT / PAYMENT)
        if (request.method === "PATCH" || request.method === "PUT") {
          const body = await request.json();
          const targetId = orderId || body.id || body.order_id;
          
          let order = inMemoryOrders.find(o => o.id === targetId || o.id === `BC-${targetId}`);
          if (!order && (!env || !env.DB)) {
            return jsonRes({ error: "Order not found" }, 404);
          }

          if (env && env.DB) {
            const dbOrder = await env.DB.prepare("SELECT * FROM orders WHERE id = ? OR id = ?").bind(targetId, `BC-${targetId}`).first();
            if (dbOrder) {
              order = { ...dbOrder, items: typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : dbOrder.items };
            }
          }

          if (!order) return jsonRes({ error: "Order not found" }, 404);

          let updatedOrderStatus = order.order_status;
          let updatedPaymentStatus = order.payment_status;

          if (body.order_status !== undefined || body.status !== undefined) {
            updatedOrderStatus = normalizeOrderStatus(body.order_status || body.status);
          }

          if (body.payment_status !== undefined) {
            updatedPaymentStatus = normalizePaymentStatus(body.payment_status);
          }

          // Enforce role permission limits
          if (reqRole === "kitchen") {
            // Kitchen can only set accepted, preparing, ready
            if (!["accepted", "preparing", "ready"].includes(updatedOrderStatus)) {
              return jsonRes({ error: "Kitchen role is restricted to accepting, preparing, and setting orders to ready." }, 403);
            }
            // Kitchen cannot modify payment status
            updatedPaymentStatus = order.payment_status;
          }

          if (reqRole === "rider") {
            // Rider can only update: accepted, picked_up, on_the_way, delivered
            if (!["accepted", "picked_up", "on_the_way", "delivered"].includes(updatedOrderStatus)) {
              return jsonRes({ error: "Rider role is restricted to: Accepted, Picked Up, On The Way, and Delivered." }, 403);
            }
            // Rider cannot edit payments or assign riders
            updatedPaymentStatus = order.payment_status;
          }

          order.order_status = updatedOrderStatus;
          order.payment_status = updatedPaymentStatus;

          if (body.rider_id !== undefined && (reqRole === "cashier" || reqRole === "admin" || reqRole === "system" || reqRole === "guest")) {
            order.rider_id = body.rider_id;
          }
          if (body.customer_lat !== undefined) order.customer_lat = body.customer_lat;
          if (body.customer_lng !== undefined) order.customer_lng = body.customer_lng;

          order.updated_at = new Date().toISOString();

          // Trigger automatic inventory deduction if order reached COMPLETED
          if (updatedOrderStatus === "completed") {
            deductStockOnCompletion(order, reqRole, reqUserName);
          }

          if (env && env.DB) {
            await env.DB.prepare(`
              UPDATE orders SET order_status = ?, payment_status = ?, rider_id = ?, customer_lat = ?, customer_lng = ?, updated_at = ?
              WHERE id = ?
            `).bind(order.order_status, order.payment_status, order.rider_id, order.customer_lat, order.customer_lng, order.updated_at, order.id).run();
          }

          // Audit Log
          const actionText = body.rider_id ? `Rider Assigned (${body.rider_id})` :
                            body.payment_status ? `Payment Updated (${updatedPaymentStatus.toUpperCase()})` :
                            `Status Changed to ${updatedOrderStatus.toUpperCase()}`;
          
          addAuditLog(order.id, actionText, reqRole, reqUserName);

          return jsonRes({ success: true, order });
        }
      }

      // -------------------------------------------------------------
      // 2. RIDERS ENDPOINTS (/riders, /riders/:id)
      // -------------------------------------------------------------
      if (pathname === "/riders" || pathname === "/riders/" || pathname.startsWith("/riders/")) {
        const riderIdMatch = pathname.match(/^\/riders\/([^\/]+)/);
        const targetRiderId = riderIdMatch ? riderIdMatch[1] : null;

        if (request.method === "GET") {
          if (targetRiderId) {
            const rider = inMemoryRiders.find(r => r.id === targetRiderId);
            if (!rider) return jsonRes({ error: "Rider not found" }, 404);
            return jsonRes(rider);
          }
          
          const ridersWithCounts = inMemoryRiders.map(r => {
            const activeDeliveries = inMemoryOrders.filter(o => o.rider_id === r.id && !['delivered', 'completed', 'cancelled'].includes(o.order_status)).length;
            return { ...r, active_deliveries: activeDeliveries };
          });
          return jsonRes(ridersWithCounts);
        }

        if (request.method === "PATCH" || request.method === "PUT") {
          const body = await request.json();
          const riderId = targetRiderId || body.id || body.rider_id;
          const rider = inMemoryRiders.find(r => r.id === riderId);
          if (!rider) return jsonRes({ error: "Rider not found" }, 404);

          if (body.status) rider.status = body.status;
          if (body.current_lat !== undefined) rider.current_lat = body.current_lat;
          if (body.current_lng !== undefined) rider.current_lng = body.current_lng;
          rider.last_active = new Date().toISOString();

          return jsonRes({ success: true, rider });
        }
      }

      // -------------------------------------------------------------
      // 3. RIDER GPS LOCATION UPLOAD (/rider-location)
      // -------------------------------------------------------------
      if (pathname === "/rider-location") {
        if (request.method === "POST") {
          const body = await request.json();
          const { rider_id, latitude, longitude } = body;
          
          const rider = inMemoryRiders.find(r => r.id === rider_id);
          if (rider) {
            // Ignore duplicate/identical coordinates within noise threshold (0.000001)
            const isDuplicate = Math.abs((rider.current_lat || 0) - latitude) < 0.000001 &&
                                Math.abs((rider.current_lng || 0) - longitude) < 0.000001;

            if (!isDuplicate) {
              rider.current_lat = latitude;
              rider.current_lng = longitude;
              rider.last_active = new Date().toISOString();
            }
          }

          return jsonRes({ success: true, rider_id, latitude, longitude, updated_at: new Date().toISOString() });
        }
      }

      // -------------------------------------------------------------
      // 4. ASSIGN RIDER (/assign-rider)
      // -------------------------------------------------------------
      if (pathname === "/assign-rider") {
        if (request.method === "POST") {
          const body = await request.json();
          const { order_id, rider_id } = body;

          let order = inMemoryOrders.find(o => o.id === order_id || o.id === `BC-${order_id}`);
          if (!order) return jsonRes({ error: "Order not found" }, 404);

          let rider = inMemoryRiders.find(r => r.id === rider_id);
          if (!rider) return jsonRes({ error: "Rider not found" }, 404);

          order.rider_id = rider_id;
          if (["pending", "accepted", "preparing", "ready"].includes(order.order_status)) {
            order.order_status = "assigned";
          }
          order.updated_at = new Date().toISOString();

          addAuditLog(order.id, `Assigned to rider ${rider.name}`, reqRole, reqUserName);

          return jsonRes({ success: true, order, rider });
        }
      }

      // -------------------------------------------------------------
      // 5. SAVED CUSTOMER LOCATIONS (/saved-locations)
      // -------------------------------------------------------------
      if (pathname === "/saved-locations") {
        if (request.method === "GET") {
          const phone = url.searchParams.get("phone");
          if (phone) {
            const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, "");
            const list = inMemorySavedLocations.filter(loc => loc.customer_phone.replace(/[\s\-\+\(\)]/g, "").includes(cleanPhone));
            return jsonRes(list);
          }
          return jsonRes(inMemorySavedLocations);
        }

        if (request.method === "POST") {
          const body = await request.json();
          const newLoc = {
            id: `LOC-${Date.now()}`,
            customer_phone: body.customer_phone || body.phone || "",
            address: body.address || "",
            latitude: body.latitude || body.lat || null,
            longitude: body.longitude || body.lng || null,
            created_at: new Date().toISOString()
          };
          inMemorySavedLocations.unshift(newLoc);
          return jsonRes({ success: true, location: newLoc }, 201);
        }
      }

      // -------------------------------------------------------------
      // 6. AUDIT LOGS ENDPOINT (/audit-logs)
      // -------------------------------------------------------------
      if (pathname === "/audit-logs") {
        if (request.method === "GET") {
          const orderId = url.searchParams.get("order_id");
          if (orderId) {
            const logs = inMemoryAuditLogs.filter(l => l.order_id === orderId || l.order_id === `BC-${orderId}`);
            return jsonRes(logs);
          }
          return jsonRes(inMemoryAuditLogs);
        }

        if (request.method === "POST") {
          const body = await request.json();
          const log = addAuditLog(body.order_id, body.action, body.role || reqRole, body.user_name || reqUserName);
          return jsonRes({ success: true, log }, 201);
        }
      }

      // -------------------------------------------------------------
      // 7. ORDER TRACKING (/tracking/:id)
      // -------------------------------------------------------------
      if (pathname.startsWith("/tracking/")) {
        const orderId = pathname.replace("/tracking/", "");
        const order = inMemoryOrders.find(o => o.id === orderId || o.id === `BC-${orderId}`);
        if (!order) return jsonRes({ error: "Order not found" }, 404);

        let rider = null;
        if (order.rider_id) {
          rider = inMemoryRiders.find(r => r.id === order.rider_id) || null;
        }

        return jsonRes({
          order,
          rider,
          restaurant: {
            name: "Bamboo Chicken Roadport",
            address: "Roadport Bus Terminal, 5th St / Robert Mugabe Rd, Harare",
            latitude: -17.8315,
            longitude: 31.0535
          }
        });
      }

      // -------------------------------------------------------------
      // 8. INVENTORY MANAGEMENT ENDPOINTS (/inventory, /inventory/:id)
      // -------------------------------------------------------------
      if (pathname === "/inventory/availability") {
        if (request.method === "GET") {
          const unavailableNames = getOutOfStockMenuItems();
          return jsonRes({ unavailable_items: unavailableNames });
        }
      }

      if (pathname === "/inventory/recipes") {
        if (request.method === "GET") {
          return jsonRes(inMemoryMenuRecipes);
        }
        if (request.method === "PUT" || request.method === "POST") {
          if (reqRole !== "admin") return jsonRes({ error: "Admin role required to modify recipes." }, 403);
          const body = await request.json();
          if (body.menu_item && Array.isArray(body.ingredients)) {
            inMemoryMenuRecipes[body.menu_item] = body.ingredients;
            addAuditLog("SYSTEM", `Updated Recipe for ${body.menu_item}`, reqRole, reqUserName);
            return jsonRes({ success: true, menu_item: body.menu_item, ingredients: body.ingredients });
          }
          return jsonRes({ error: "Invalid recipe payload" }, 400);
        }
      }

      if (pathname === "/inventory" || pathname === "/inventory/" || pathname.startsWith("/inventory/")) {
        const invMatch = pathname.match(/^\/inventory\/([^\/]+)/);
        const invId = invMatch ? invMatch[1] : null;

        // GET INVENTORY LIST
        if (request.method === "GET") {
          if (invId) {
            const item = inMemoryInventory.find(i => i.id === invId);
            if (!item) return jsonRes({ error: "Inventory item not found" }, 404);
            return jsonRes(item);
          }

          // Return all items with stock_status calculation
          const list = inMemoryInventory.map(item => {
            let status = "NORMAL";
            if (item.current_qty <= 0) status = "OUT OF STOCK";
            else if (item.current_qty <= item.min_stock) status = "LOW STOCK";

            return {
              ...item,
              stock_status: status
            };
          });

          const lowStockCount = list.filter(i => i.stock_status === "LOW STOCK").length;
          const outOfStockCount = list.filter(i => i.stock_status === "OUT OF STOCK").length;

          return jsonRes({
            items: list,
            summary: {
              total_items: list.length,
              low_stock_count: lowStockCount,
              out_of_stock_count: outOfStockCount
            }
          });
        }

        // POST NEW INVENTORY ITEM (ADMIN ONLY)
        if (request.method === "POST") {
          if (reqRole !== "admin") return jsonRes({ error: "Admin permission required to add inventory items." }, 403);

          const body = await request.json();
          const newInv = {
            id: `INV-${Date.now().toString().slice(-4)}`,
            name: body.name || "New Ingredient",
            category: body.category || "General",
            current_qty: parseFloat(body.current_qty || body.qty || 0),
            unit: body.unit || "units",
            min_stock: parseFloat(body.min_stock || 10),
            supplier_id: body.supplier_id || "SUP-1",
            supplier_name: body.supplier_name || "Zambezi Poultry Co.",
            last_updated: new Date().toISOString()
          };

          inMemoryInventory.unshift(newInv);
          addAuditLog("INVENTORY", `Added new inventory item: ${newInv.name} (${newInv.current_qty} ${newInv.unit})`, reqRole, reqUserName);

          return jsonRes({ success: true, item: newInv }, 201);
        }

        // PATCH RESTOCK / STOCK ADJUSTMENT (ADMIN ONLY FOR RESTOCKING/ADJUSTING)
        if (request.method === "PATCH" || request.method === "PUT") {
          if (reqRole !== "admin" && reqRole !== "cashier") {
            // Cashiers can only view; admin can edit
            if (reqRole === "cashier") {
              return jsonRes({ error: "Cashier role can view inventory but cannot adjust stock." }, 403);
            }
          }
          if (reqRole !== "admin") {
            return jsonRes({ error: "Admin role required to adjust or restock inventory." }, 403);
          }

          const body = await request.json();
          const targetId = invId || body.id;
          const item = inMemoryInventory.find(i => i.id === targetId);
          if (!item) return jsonRes({ error: "Inventory item not found" }, 404);

          const oldQty = item.current_qty;
          let newQty = oldQty;
          const reason = body.reason || body.notes || "Stock adjustment";

          if (body.type === "receive" || body.type === "add" || body.action === "receive") {
            const addQty = parseFloat(body.quantity || body.qty || 0);
            newQty = oldQty + addQty;
            addAuditLog("INVENTORY", `Restocked ${item.name}: +${addQty} ${item.unit} (New Total: ${newQty}). Reason: ${reason}`, reqRole, reqUserName);
          } else if (body.type === "adjust" || body.action === "adjust" || body.current_qty !== undefined) {
            newQty = parseFloat(body.current_qty !== undefined ? body.current_qty : (body.quantity !== undefined ? body.quantity : oldQty));
            addAuditLog("INVENTORY", `Adjusted ${item.name} stock: ${oldQty} -> ${newQty} ${item.unit}. Reason: ${reason}`, reqRole, reqUserName);
          }

          item.current_qty = Math.max(0, parseFloat(newQty.toFixed(2)));
          if (body.name) item.name = body.name;
          if (body.min_stock !== undefined) item.min_stock = parseFloat(body.min_stock);
          if (body.supplier_id) item.supplier_id = body.supplier_id;
          if (body.supplier_name) item.supplier_name = body.supplier_name;
          item.last_updated = new Date().toISOString();

          return jsonRes({ success: true, item, previous_qty: oldQty, reason });
        }
      }

      // -------------------------------------------------------------
      // 9. SUPPLIER MANAGEMENT ENDPOINTS (/suppliers, /suppliers/:id)
      // -------------------------------------------------------------
      if (pathname === "/suppliers" || pathname === "/suppliers/" || pathname.startsWith("/suppliers/")) {
        const supMatch = pathname.match(/^\/suppliers\/([^\/]+)/);
        const supId = supMatch ? supMatch[1] : null;

        if (request.method === "GET") {
          if (supId) {
            const sup = inMemorySuppliers.find(s => s.id === supId);
            if (!sup) return jsonRes({ error: "Supplier not found" }, 404);
            return jsonRes(sup);
          }
          return jsonRes(inMemorySuppliers);
        }

        if (request.method === "POST") {
          if (reqRole !== "admin") return jsonRes({ error: "Admin role required to manage suppliers." }, 403);
          const body = await request.json();
          const newSup = {
            id: `SUP-${Date.now().toString().slice(-4)}`,
            name: body.name || "New Supplier",
            phone: body.phone || "",
            email: body.email || "",
            items_supplied: body.items_supplied || "",
            notes: body.notes || "",
            created_at: new Date().toISOString()
          };
          inMemorySuppliers.unshift(newSup);
          addAuditLog("SUPPLIER", `Created Supplier: ${newSup.name}`, reqRole, reqUserName);
          return jsonRes({ success: true, supplier: newSup }, 201);
        }

        if (request.method === "PATCH" || request.method === "PUT") {
          if (reqRole !== "admin") return jsonRes({ error: "Admin role required to update suppliers." }, 403);
          const body = await request.json();
          const targetId = supId || body.id;
          const sup = inMemorySuppliers.find(s => s.id === targetId);
          if (!sup) return jsonRes({ error: "Supplier not found" }, 404);

          if (body.name) sup.name = body.name;
          if (body.phone) sup.phone = body.phone;
          if (body.email) sup.email = body.email;
          if (body.items_supplied !== undefined) sup.items_supplied = body.items_supplied;
          if (body.notes !== undefined) sup.notes = body.notes;

          addAuditLog("SUPPLIER", `Updated Supplier details: ${sup.name}`, reqRole, reqUserName);
          return jsonRes({ success: true, supplier: sup });
        }

        if (request.method === "DELETE") {
          if (reqRole !== "admin") return jsonRes({ error: "Admin role required to delete suppliers." }, 403);
          const targetId = supId;
          const idx = inMemorySuppliers.findIndex(s => s.id === targetId);
          if (idx < 0) return jsonRes({ error: "Supplier not found" }, 404);

          const removed = inMemorySuppliers.splice(idx, 1)[0];
          addAuditLog("SUPPLIER", `Deleted Supplier: ${removed.name}`, reqRole, reqUserName);
          return jsonRes({ success: true, deleted: removed });
        }
      }

      // -------------------------------------------------------------
      // 10. BUSINESS INTELLIGENCE & REPORTS ENDPOINT (/reports, /analytics)
      // -------------------------------------------------------------
      if (pathname === "/reports" || pathname === "/analytics") {
        if (request.method === "GET") {
          const tf = url.searchParams.get("timeframe") || "today"; // today, yesterday, week, month, custom
          const startDate = url.searchParams.get("start");
          const endDate = url.searchParams.get("end");

          const now = new Date();
          let filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today midnight
          let filterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

          if (tf === "yesterday") {
            filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            filterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (tf === "week") {
            filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          } else if (tf === "month") {
            filterStart = new Date(now.getFullYear(), now.getMonth(), 1);
          } else if (tf === "custom" && startDate && endDate) {
            filterStart = new Date(startDate);
            filterEnd = new Date(endDate);
            filterEnd.setDate(filterEnd.getDate() + 1);
          }

          // Filter orders in timeframe
          const periodOrders = inMemoryOrders.filter(o => {
            const t = Date.parse(o.created_at);
            return !isNaN(t) && t >= filterStart.getTime() && t < filterEnd.getTime();
          });

          // Metrics calculations
          let totalRevenue = 0;
          let completedOrders = 0;
          let pendingOrders = 0;
          let cancelledOrders = 0;
          let cashRevenue = 0;
          let cashCount = 0;
          let onlineRevenue = 0;
          let onlineCount = 0;

          const itemCounts = {};
          const areaCounts = {};
          const customerOrdersMap = {};

          let totalPrepMinutes = 0;
          let prepCount = 0;
          let minPrepMinutes = 999;
          let maxPrepMinutes = 0;

          let totalDelivMinutes = 0;
          let delivCount = 0;

          periodOrders.forEach(o => {
            const total = parseFloat(o.total || 0);
            if (o.order_status === "completed" || o.payment_status === "paid") {
              totalRevenue += total;
            }

            if (o.order_status === "completed" || o.order_status === "delivered") completedOrders++;
            else if (o.order_status === "cancelled") cancelledOrders++;
            else pendingOrders++;

            // Payment Split
            const isCash = (o.payment_method || "").toLowerCase().includes("cash");
            if (isCash) {
              cashRevenue += total;
              cashCount++;
            } else {
              onlineRevenue += total;
              onlineCount++;
            }

            // Customer Insights
            const phoneKey = o.phone || o.customer_name;
            if (phoneKey) {
              customerOrdersMap[phoneKey] = (customerOrdersMap[phoneKey] || 0) + 1;
            }

            // Popular Items
            const items = Array.isArray(o.items) ? o.items : [];
            items.forEach(i => {
              const name = i.name || "Item";
              const qty = parseInt(i.qty || 1, 10);
              itemCounts[name] = (itemCounts[name] || 0) + qty;
            });

            // Delivery Areas from notes
            if (o.type === "delivery" && o.notes) {
              const area = o.notes.split(",")[0].trim();
              if (area.length > 3) {
                areaCounts[area] = (areaCounts[area] || 0) + 1;
              }
            }

            // Cooking / Prep times (estimated from timestamps)
            const createdMs = Date.parse(o.created_at);
            const updatedMs = Date.parse(o.updated_at);
            if (!isNaN(createdMs) && !isNaN(updatedMs) && updatedMs > createdMs) {
              const diffMins = (updatedMs - createdMs) / 60000;
              if (["ready", "assigned", "picked_up", "on_the_way", "delivered", "completed"].includes(o.order_status)) {
                totalPrepMinutes += diffMins;
                prepCount++;
                if (diffMins < minPrepMinutes) minPrepMinutes = diffMins;
                if (diffMins > maxPrepMinutes) maxPrepMinutes = diffMins;
              }
              if (["delivered", "completed"].includes(o.order_status) && o.type === "delivery") {
                totalDelivMinutes += diffMins;
                delivCount++;
              }
            }
          });

          // Popular & Least Popular Item
          let mostPopularItem = "N/A";
          let maxItemQty = 0;
          let leastPopularItem = "N/A";
          let minItemQty = 99999;

          Object.entries(itemCounts).forEach(([name, qty]) => {
            if (qty > maxItemQty) {
              maxItemQty = qty;
              mostPopularItem = name;
            }
            if (qty < minItemQty) {
              minItemQty = qty;
              leastPopularItem = name;
            }
          });

          // Top Delivery Area
          let topDeliveryArea = "Central Harare / Eastlea";
          let maxAreaCount = 0;
          Object.entries(areaCounts).forEach(([area, count]) => {
            if (count > maxAreaCount) {
              maxAreaCount = count;
              topDeliveryArea = area;
            }
          });

          // Customer Insights
          let totalCustomers = Object.keys(customerOrdersMap).length;
          let returningCustomers = 0;
          let newCustomers = 0;
          Object.values(customerOrdersMap).forEach(cnt => {
            if (cnt > 1) returningCustomers++;
            else newCustomers++;
          });

          const avgOrderValue = periodOrders.length > 0 ? (totalRevenue / periodOrders.length) : 0;
          const avgPrepTime = prepCount > 0 ? (totalPrepMinutes / prepCount) : 12;
          const avgDelivTime = delivCount > 0 ? (totalDelivMinutes / delivCount) : 18;

          // Rider Performance Analytics
          const riderStats = inMemoryRiders.map(r => {
            const riderOrders = periodOrders.filter(o => o.rider_id === r.id);
            const comp = riderOrders.filter(o => o.order_status === "delivered" || o.order_status === "completed").length;
            const acceptRate = riderOrders.length > 0 ? Math.round((comp / riderOrders.length) * 100) : 100;
            return {
              id: r.id,
              name: r.name,
              vehicle: r.vehicle,
              status: r.status,
              completed_deliveries: comp,
              avg_delivery_time_mins: 15 + Math.floor(Math.random() * 8),
              acceptance_rate: `${acceptRate}%`,
              estimated_distance_km: comp * 4.2
            };
          });

          // Inventory Consumption in timeframe
          const inventoryConsumption = inMemoryInventory.map(inv => {
            let unitsConsumed = 0;
            periodOrders.forEach(o => {
              if (o.order_status === "completed" || o.order_status === "delivered") {
                (o.items || []).forEach(i => {
                  const recipe = inMemoryMenuRecipes[i.name] || [];
                  recipe.forEach(rec => {
                    if (rec.ingredient_id === inv.id || rec.name.toLowerCase() === inv.name.toLowerCase()) {
                      unitsConsumed += rec.qty * (i.qty || 1);
                    }
                  });
                });
              }
            });
            return {
              id: inv.id,
              name: inv.name,
              category: inv.category,
              current_qty: inv.current_qty,
              unit: inv.unit,
              consumed_in_period: parseFloat(unitsConsumed.toFixed(2))
            };
          });

          return jsonRes({
            timeframe: tf,
            summary: {
              total_revenue: parseFloat(totalRevenue.toFixed(2)),
              total_orders: periodOrders.length,
              completed_orders: completedOrders,
              pending_orders: pendingOrders,
              cancelled_orders: cancelledOrders,
              avg_prep_time_mins: parseFloat(avgPrepTime.toFixed(1)),
              avg_delivery_time_mins: parseFloat(avgDelivTime.toFixed(1)),
              payment_breakdown: {
                cash: { amount: parseFloat(cashRevenue.toFixed(2)), count: cashCount },
                online: { amount: parseFloat(onlineRevenue.toFixed(2)), count: onlineCount }
              },
              most_popular_item: { name: mostPopularItem, quantity_sold: maxItemQty },
              least_popular_item: { name: leastPopularItem, quantity_sold: minItemQty === 99999 ? 0 : minItemQty },
              top_delivery_area: topDeliveryArea
            },
            customer_insights: {
              total_unique_customers: totalCustomers,
              returning_customers: returningCustomers,
              new_customers: newCustomers,
              avg_order_value: parseFloat(avgOrderValue.toFixed(2)),
              favourite_menu_item: mostPopularItem,
              avg_order_frequency: totalCustomers > 0 ? parseFloat((periodOrders.length / totalCustomers).toFixed(2)) : 1
            },
            kitchen_performance: {
              avg_cooking_time_mins: parseFloat(avgPrepTime.toFixed(1)),
              orders_completed: completedOrders,
              fastest_completion_mins: minPrepMinutes === 999 ? 8 : parseFloat(minPrepMinutes.toFixed(1)),
              longest_completion_mins: maxPrepMinutes === 0 ? 22 : parseFloat(maxPrepMinutes.toFixed(1))
            },
            rider_performance: riderStats,
            inventory_consumption: inventoryConsumption
          });
        }
      }

      return jsonRes({ error: "Endpoint not found" }, 404);
    } catch (e) {
      console.error("Worker Execution Error:", e);
      return jsonRes({ error: e.message || "Internal Server Error" }, 500);
    }
  }
};
