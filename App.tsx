/* 
 * Bamboo Chicken POS - Cashier Dashboard Stylesheet
 * Dark luxury fast-food restaurant terminal theme
 */

@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --pos-bg: #121214;
  --pos-card-bg: #1C1C22;
  --pos-card-border: rgba(255, 255, 255, 0.08);
  --pos-header-bg: linear-gradient(180deg, #202020 0%, #161616 100%);
  --pos-orange: #FF5A00;
  --pos-orange-glow: rgba(255, 90, 0, 0.25);
  --pos-yellow: #FDB813;
  --pos-green: #10B981;
  --pos-green-bg: rgba(16, 185, 129, 0.12);
  --pos-blue: #3B82F6;
  --pos-red: #EF4444;
  --pos-red-bg: rgba(239, 68, 68, 0.12);
  --pos-text-light: #F3F4F6;
  --pos-text-muted: #9CA3AF;
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  background-color: var(--pos-bg);
  color: var(--pos-text-light);
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* POS Sticky Header */
.pos-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--pos-header-bg);
  border-bottom: 1px solid var(--pos-card-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 24px rgba(0, 0, 0, 0.4);
  padding: 12px 24px;
}

.pos-header-container {
  max-width: 1700px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.pos-brand-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pos-brand-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.pos-brand-orange {
  color: var(--pos-orange);
  text-shadow: 0 0 12px var(--pos-orange-glow);
}

.pos-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 90, 0, 0.15);
  border: 1px solid rgba(255, 90, 0, 0.3);
  color: var(--pos-orange);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.pos-badge-green {
  background: var(--pos-green-bg);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--pos-green);
}

.pos-header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pos-clock-widget {
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--pos-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.pos-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pos-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.pos-btn-primary {
  background: linear-gradient(135deg, #FF5A00 0%, #E04E00 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(255, 90, 0, 0.3);
}

.pos-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 90, 0, 0.4);
}

.pos-btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: var(--pos-text-light);
  border-color: rgba(255, 255, 255, 0.1);
}

.pos-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.pos-btn-icon {
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--pos-text-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pos-btn-icon:hover {
  background: rgba(255, 255, 255, 0.12);
}

.pos-btn-icon.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--pos-green);
  color: var(--pos-green);
}

/* Customer View Navigation Link */
.pos-menu-link {
  color: var(--pos-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.pos-menu-link:hover {
  color: #FFFFFF;
}

/* Dashboard Container */
.pos-main {
  max-width: 1700px;
  margin: 0 auto;
  padding: 24px;
}

/* KPI Statistics Grid */
.pos-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .pos-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .pos-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pos-stat-card {
  background: var(--pos-card-bg);
  border: 1px solid var(--pos-card-border);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.pos-stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.pos-stat-info {
  display: flex;
  flex-direction: column;
}

.pos-stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--pos-text-muted);
  margin-bottom: 4px;
}

.pos-stat-value {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  color: #FFFFFF;
}

.pos-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.pos-stat-icon-sales {
  background: rgba(16, 185, 129, 0.15);
  color: var(--pos-green);
}

.pos-stat-icon-orders {
  background: rgba(59, 130, 246, 0.15);
  color: var(--pos-blue);
}

.pos-stat-icon-prep {
  background: rgba(255, 90, 0, 0.15);
  color: var(--pos-orange);
}

.pos-stat-icon-ready {
  background: rgba(253, 184, 19, 0.15);
  color: var(--pos-yellow);
}

.pos-stat-icon-completed {
  background: rgba(156, 163, 175, 0.15);
  color: var(--pos-text-muted);
}

/* Filter and Controls Toolbar */
.pos-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.pos-search-wrapper {
  position: relative;
  flex: 1;
  max-width: 380px;
  min-width: 240px;
}

.pos-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--pos-text-muted);
}

.pos-search-input {
  width: 100%;
  background: var(--pos-card-bg);
  border: 1px solid var(--pos-card-border);
  border-radius: 12px;
  padding: 10px 14px 10px 42px;
  color: #FFFFFF;
  font-family: var(--font-body);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.pos-search-input:focus {
  border-color: var(--pos-orange);
  box-shadow: 0 0 0 3px rgba(255, 90, 0, 0.2);
}

.pos-filter-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.pos-filter-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: var(--pos-text-muted);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.pos-filter-pill:hover,
.pos-filter-pill.active {
  background: rgba(255, 90, 0, 0.2);
  color: #FFFFFF;
  border-color: var(--pos-orange);
}

/* Kanban Columns Board */
.pos-board-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  align-items: start;
}

@media (max-width: 1280px) {
  .pos-board-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .pos-board-grid {
    grid-template-columns: 1fr;
  }
}

/* Individual Column */
.pos-column {
  background: rgba(28, 28, 34, 0.6);
  border: 1px solid var(--pos-card-border);
  border-radius: 20px;
  padding: 16px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.pos-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pos-column-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pos-column-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px currentColor;
}

.dot-red { color: var(--pos-red); background-color: var(--pos-red); }
.dot-orange { color: var(--pos-orange); background-color: var(--pos-orange); }
.dot-green { color: var(--pos-green); background-color: var(--pos-green); }
.dot-gray { color: var(--pos-text-muted); background-color: var(--pos-text-muted); }

.pos-column-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: #FFFFFF;
}

.pos-column-count {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

/* Column Cards List */
.pos-cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.pos-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--pos-text-muted);
  font-size: 0.85rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  margin-top: 10px;
}

.pos-empty-state svg {
  margin-bottom: 8px;
  opacity: 0.5;
}

/* Order Card Component */
.pos-order-card {
  background: var(--pos-card-bg);
  border: 1px solid var(--pos-card-border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.pos-order-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

/* Card Accent Stripe according to urgency/status */
.pos-order-card.new-order {
  border-left: 4px solid var(--pos-red);
}

.pos-order-card.preparing-order {
  border-left: 4px solid var(--pos-orange);
}

.pos-order-card.ready-order {
  border-left: 4px solid var(--pos-green);
}

.pos-order-card.completed-order {
  border-left: 4px solid var(--pos-text-muted);
  opacity: 0.85;
}

/* Card Top Bar */
.pos-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pos-order-id {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: -0.01em;
}

.pos-order-meta-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pos-type-tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.08);
  color: var(--pos-text-light);
}

.pos-type-tag.tag-delivery {
  background: rgba(59, 130, 246, 0.18);
  color: #60A5FA;
}

.pos-type-tag.tag-pickup {
  background: rgba(253, 184, 19, 0.18);
  color: var(--pos-yellow);
}

.pos-time-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--pos-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Customer Row */
.pos-customer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
}

.pos-customer-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #FFFFFF;
}

.pos-payment-status {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-paid {
  color: var(--pos-green);
}

.status-pending {
  color: var(--pos-yellow);
}

/* Items List inside Card */
.pos-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  padding-top: 8px;
}

.pos-item-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.pos-item-qty {
  font-weight: 700;
  color: var(--pos-orange);
  min-width: 22px;
}

.pos-item-name {
  color: #E5E7EB;
  flex: 1;
}

.pos-item-options {
  font-size: 0.78rem;
  color: var(--pos-text-muted);
  margin-top: 2px;
}

.pos-special-instructions {
  background: rgba(255, 90, 0, 0.1);
  border: 1px solid rgba(255, 90, 0, 0.2);
  color: #FFA366;
  font-size: 0.78rem;
  padding: 6px 10px;
  border-radius: 6px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Card Total Bar */
.pos-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.pos-total-label {
  font-size: 0.8rem;
  color: var(--pos-text-muted);
}

.pos-total-amount {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  color: #FFFFFF;
}

/* Action Buttons inside Order Card */
.pos-card-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-top: 4px;
}

.pos-action-btn {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-accept {
  background: var(--pos-orange);
  color: #FFFFFF;
}

.btn-accept:hover {
  background: #E04E00;
}

.btn-prep {
  background: #3B82F6;
  color: #FFFFFF;
}

.btn-prep:hover {
  background: #2563EB;
}

.btn-ready {
  background: var(--pos-green);
  color: #FFFFFF;
}

.btn-ready:hover {
  background: #059669;
}

.btn-complete {
  background: rgba(255, 255, 255, 0.12);
  color: #FFFFFF;
}

.btn-complete:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-details {
  background: rgba(255, 255, 255, 0.06);
  color: var(--pos-text-muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-details:hover {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.12);
}

/* Modal / Drawer Overlays */
.pos-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.pos-modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.pos-modal {
  background: var(--pos-card-bg);
  border: 1px solid var(--pos-card-border);
  border-radius: 20px;
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  transform: translateY(20px);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.pos-modal-overlay.active .pos-modal {
  transform: translateY(0);
}

.pos-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pos-modal-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: #FFFFFF;
}

.pos-modal-close {
  background: none;
  border: none;
  color: var(--pos-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}

.pos-modal-close:hover {
  color: #FFFFFF;
}

.pos-modal-body {
  padding: 24px;
}

.pos-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* Printable Receipt Preview Style */
.receipt-stub {
  background: #FFFFFF;
  color: #111111;
  font-family: 'Courier New', Courier, monospace;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.receipt-header {
  text-align: center;
  margin-bottom: 16px;
  border-bottom: 1px dashed #111111;
  padding-bottom: 12px;
}

.receipt-title {
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
}

.receipt-divider {
  border-top: 1px dashed #111111;
  margin: 12px 0;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

/* Toast Container */
.pos-toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pos-toast {
  background: #1F2937;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
