import { useState, useEffect, useCallback } from 'react';
import {
  adminLogin,
  getAdminToken,
  getAdminUser,
  clearAdminSession,
  fetchAdminDashboardStats,
  fetchAdminOrders,
  updateAdminOrderStatus,
  fetchAdminCustomers,
  fetchCustomerOrders
} from '../../services/api';
import './AdminPortal.css';

const STATUS_OPTIONS = [
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Pending',
  'Cancelled'
];

function AdminPortal({ isOpen, onClose, onOpenTicketTracking, onAdminAuthChange }) {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAdminToken());
  const [currentUser, setCurrentUser] = useState(() => getAdminUser());
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Active Tab: 'orders' | 'customers' | 'stats'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingCode, setUpdatingCode] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // --- Load Orders ---
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setOrdersLoading(true);
    try {
      const data = await fetchAdminOrders(statusFilter, orderSearch);
      setOrders(data);
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('log in')) {
        setIsAuthenticated(false);
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [isAuthenticated, statusFilter, orderSearch]);

  // --- Load Customers ---
  const loadCustomers = useCallback(async () => {
    if (!isAuthenticated) return;
    setCustomersLoading(true);
    try {
      const data = await fetchAdminCustomers(customerSearch);
      setCustomers(data);
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('log in')) {
        setIsAuthenticated(false);
      }
    } finally {
      setCustomersLoading(false);
    }
  }, [isAuthenticated, customerSearch]);

  // --- Load Stats ---
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setStatsLoading(true);
    try {
      const data = await fetchAdminDashboardStats();
      setStats(data);
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('log in')) {
        setIsAuthenticated(false);
      }
    } finally {
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

  // Trigger loads when tab changes or modal opens
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'customers') {
      loadCustomers();
    } else if (activeTab === 'stats') {
      loadStats();
    }
  }, [isOpen, isAuthenticated, activeTab, loadOrders, loadCustomers, loadStats]);

  if (!isOpen) return null;

  // --- Login Handler ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const authData = await adminLogin(loginEmail, loginPassword);
      setIsAuthenticated(true);
      const userObj = {
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role
      };
      setCurrentUser(userObj);
      if (onAdminAuthChange) onAdminAuthChange(userObj);
      setActiveTab('orders');
    } catch (err) {
      setLoginError(err.message || 'Invalid login details.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
    if (onAdminAuthChange) onAdminAuthChange(null);
  };

  // --- Update Order Status ---
  const handleStatusChange = async (orderCode, newStatus) => {
    setUpdatingCode(orderCode);
    try {
      const updated = await updateAdminOrderStatus(orderCode, newStatus);
      setOrders(prev => prev.map(o => o.orderCode === orderCode ? updated : o));
      if (selectedOrderDetails && selectedOrderDetails.orderCode === orderCode) {
        setSelectedOrderDetails(updated);
      }
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
    } finally {
      setUpdatingCode(null);
    }
  };

  // --- View Customer Order History ---
  const handleViewCustomerHistory = async (customer) => {
    setSelectedCustomerHistory(customer);
    setHistoryLoading(true);
    try {
      const history = await fetchCustomerOrders(customer.customerEmail);
      setHistoryOrders(history);
    } catch (err) {
      alert(`Failed to load order history: ${err.message}`);
      setHistoryOrders([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        
        {/* If Not Authenticated -> Login Card */}
        {!isAuthenticated ? (
          <div className="admin-login-container">
            <div className="login-header">
              <span className="admin-pill">Staff & Management</span>
              <h2 className="login-title">Executive Kitchen Portal</h2>
              <p className="login-subtitle">Sign in to manage live dish tickets, customer orders, and dispatch statuses.</p>
            </div>

            {loginError && (
              <div className="admin-error-box">
                <span>⚠️ {loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="admin-login-form">
              <div className="admin-field">
                <label className="admin-label">Admin Email or Username</label>
                <input
                  type="text"
                  className="admin-input"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Password</label>
                <input
                  type="password"
                  className="admin-input"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>



              <div className="login-actions">
                <button
                  type="submit"
                  className="btn-admin-login"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Authenticating...' : 'Sign In to Kitchen Portal →'}
                </button>
                <button
                  type="button"
                  className="btn-admin-cancel"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="admin-dashboard-container">
            
            {/* Top Bar */}
            <header className="dashboard-topbar">
              <div className="topbar-branding">
                <span className="topbar-badge">Admin Suite</span>
                <h3 className="topbar-title">Gracie's Kitchen Executive Hub</h3>
              </div>

              <div className="topbar-user-area">
                <div className="user-profile-badge">
                  <span className="user-name">{currentUser?.fullName || 'Chef Gracie Admin'}</span>
                  <span className="user-role">Administrator</span>
                </div>
                <button
                  type="button"
                  className="btn-admin-logout"
                  onClick={handleLogout}
                  title="Sign out of Admin Session"
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  className="btn-close-admin"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Dashboard Tabs Bar */}
            <nav className="dashboard-nav-tabs">
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                🍲 Tickets & Orders ({orders.length})
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                👥 Customer Directory
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                📊 Kitchen Metrics & Revenue
              </button>
            </nav>

            {/* TAB 1: TICKETS & ORDERS */}
            {activeTab === 'orders' && (
              <div className="tab-content tab-orders">
                
                {/* Search & Filter Header */}
                <div className="orders-toolbar">
                  {/* Status Pills */}
                  <div className="status-filter-pills">
                    {['All', ...STATUS_OPTIONS].map(status => (
                      <button
                        key={status}
                        type="button"
                        className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                        onClick={() => setStatusFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="toolbar-search">
                    <input
                      type="text"
                      placeholder="Search ticket code, customer, phone..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn-toolbar-refresh"
                      onClick={loadOrders}
                      title="Refresh Orders"
                    >
                      🔄
                    </button>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="orders-table-wrapper">
                  {ordersLoading ? (
                    <div className="admin-loading-state">
                      <span className="admin-spinner"></span>
                      <span>Loading kitchen orders...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="empty-orders-state">
                      <p>No orders found matching the filter "{statusFilter}".</p>
                    </div>
                  ) : (
                    <table className="admin-orders-table">
                      <thead>
                        <tr>
                          <th>Ticket Code</th>
                          <th>Customer</th>
                          <th>Scheduled Delivery</th>
                          <th>Pots & Litres</th>
                          <th>Total (₦)</th>
                          <th>Live Status</th>
                          <th>Quick Action</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.orderCode} className="order-row">
                            <td className="cell-code">
                              <strong>{order.orderCode}</strong>
                              <button
                                type="button"
                                className="btn-small-track"
                                onClick={() => onOpenTicketTracking(order.orderCode)}
                                title="Open Live Customer Ticket View"
                              >
                                View Ticket ↗
                              </button>
                            </td>

                            <td className="cell-customer">
                              <span className="customer-name">{order.customerName}</span>
                              <span className="customer-phone">{order.customerPhone}</span>
                            </td>

                            <td className="cell-time">
                              {new Date(order.requestedDeliveryTime).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>

                            <td className="cell-items-summary">
                              {order.items.map(i => `${i.litres}L ${i.foodName}`).join(', ')}
                            </td>

                            <td className="cell-total">
                              ₦{order.grandTotal.toLocaleString()}
                            </td>

                            <td className="cell-status">
                              <span className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {order.status}
                              </span>
                            </td>

                            <td className="cell-action">
                              <select
                                className="status-select"
                                value={order.status}
                                disabled={updatingCode === order.orderCode}
                                onChange={e => handleStatusChange(order.orderCode, e.target.value)}
                              >
                                {STATUS_OPTIONS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </td>

                            <td className="cell-view-btn">
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => setSelectedOrderDetails(order)}
                              >
                                Inspect 🔍
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: CUSTOMER DIRECTORY & HISTORY */}
            {activeTab === 'customers' && (
              <div className="tab-content tab-customers">
                <div className="customers-toolbar">
                  <input
                    type="text"
                    className="customer-search-input"
                    placeholder="Search by customer name, email, or phone..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn-toolbar-refresh"
                    onClick={loadCustomers}
                  >
                    🔄 Refresh Customers
                  </button>
                </div>

                <div className="customers-grid">
                  {customersLoading ? (
                    <div className="admin-loading-state">
                      <span className="admin-spinner"></span>
                      <span>Loading customer profiles...</span>
                    </div>
                  ) : customers.length === 0 ? (
                    <p className="empty-state-text">No customers registered in order history yet.</p>
                  ) : (
                    customers.map(c => (
                      <div key={c.customerEmail} className="customer-card">
                        <div className="card-top">
                          <div className="avatar-circle">
                            {c.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="card-top-info">
                            <h4 className="c-name">{c.customerName}</h4>
                            <span className="c-email">{c.customerEmail}</span>
                            <span className="c-phone">{c.customerPhone}</span>
                          </div>
                        </div>

                        <div className="card-stats-row">
                          <div className="c-stat">
                            <span className="c-stat-label">Orders</span>
                            <strong className="c-stat-val">{c.totalOrders}</strong>
                          </div>
                          <div className="c-stat">
                            <span className="c-stat-label">Lifetime Spend</span>
                            <strong className="c-stat-val spend">₦{c.totalSpent.toLocaleString()}</strong>
                          </div>
                          <div className="c-stat">
                            <span className="c-stat-label">Latest Status</span>
                            <span className="c-stat-status">{c.latestOrderStatus}</span>
                          </div>
                        </div>

                        <div className="card-address-box">
                          <span>📍 {c.deliveryAddress}</span>
                        </div>

                        <button
                          type="button"
                          className="btn-view-history"
                          onClick={() => handleViewCustomerHistory(c)}
                        >
                          View Order History ({c.totalOrders}) →
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: KITCHEN METRICS & REVENUE */}
            {activeTab === 'stats' && (
              <div className="tab-content tab-stats">
                {statsLoading ? (
                  <div className="admin-loading-state">
                    <span className="admin-spinner"></span>
                    <span>Calculating kitchen metrics...</span>
                  </div>
                ) : !stats ? (
                  <p>No statistics available.</p>
                ) : (
                  <div className="stats-container">
                    {/* KPI Cards */}
                    <div className="kpi-grid">
                      <div className="kpi-card gold">
                        <span className="kpi-title">Gross Revenue</span>
                        <strong className="kpi-value">₦{stats.totalRevenue.toLocaleString()}</strong>
                        <span className="kpi-sub">Authoritative server calculated</span>
                      </div>

                      <div className="kpi-card">
                        <span className="kpi-title">Total Orders</span>
                        <strong className="kpi-value">{stats.totalOrders}</strong>
                        <span className="kpi-sub">Lifetime culinary bookings</span>
                      </div>

                      <div className="kpi-card orange">
                        <span className="kpi-title">Active Kitchen Tickets</span>
                        <strong className="kpi-value">{stats.activeTickets}</strong>
                        <span className="kpi-sub">Pending, cooking & in transit</span>
                      </div>

                      <div className="kpi-card green">
                        <span className="kpi-title">Delivered & Complete</span>
                        <strong className="kpi-value">{stats.deliveredOrders}</strong>
                        <span className="kpi-sub">Satisfied private chef clients</span>
                      </div>
                    </div>

                    {/* Breakdown by Status */}
                    <div className="stats-breakdown-card">
                      <h4 className="breakdown-title">Orders by Status Distribution</h4>
                      <div className="status-bars">
                        {Object.entries(stats.statusBreakdown || {}).map(([st, count]) => {
                          const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                          return (
                            <div key={st} className="status-bar-row">
                              <span className="bar-label">{st}</span>
                              <div className="bar-track">
                                <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="bar-count">{count} ({pct}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-MODAL 1: ORDER DETAIL INSPECTOR */}
            {selectedOrderDetails && (
              <div className="submodal-overlay" onClick={() => setSelectedOrderDetails(null)}>
                <div className="submodal-card" onClick={e => e.stopPropagation()}>
                  <header className="submodal-header">
                    <h3>Ticket Inspection: #{selectedOrderDetails.orderCode}</h3>
                    <button 
                      type="button" 
                      className="btn-submodal-close"
                      onClick={() => setSelectedOrderDetails(null)}
                    >
                      ✕
                    </button>
                  </header>

                  <div className="submodal-body">
                    <div className="inspect-row">
                      <span>Customer:</span>
                      <strong>{selectedOrderDetails.customerName} ({selectedOrderDetails.customerPhone})</strong>
                    </div>
                    <div className="inspect-row">
                      <span>Email:</span>
                      <span>{selectedOrderDetails.customerEmail}</span>
                    </div>
                    <div className="inspect-row">
                      <span>Delivery Address:</span>
                      <span>{selectedOrderDetails.deliveryAddress}</span>
                    </div>
                    <div className="inspect-row">
                      <span>Scheduled Delivery:</span>
                      <strong>{new Date(selectedOrderDetails.requestedDeliveryTime).toLocaleString()}</strong>
                    </div>
                    <div className="inspect-row">
                      <span>Current Status:</span>
                      <span className={`status-badge status-${selectedOrderDetails.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedOrderDetails.status}
                      </span>
                    </div>

                    {selectedOrderDetails.orderNotes && (
                      <div className="inspect-notes">
                        <strong>Chef Notes / Instructions:</strong>
                        <p>{selectedOrderDetails.orderNotes}</p>
                      </div>
                    )}

                    <h4 className="inspect-dishes-title">Dishes in Pot:</h4>
                    <div className="inspect-dishes-list">
                      {selectedOrderDetails.items.map((it, idx) => (
                        <div key={idx} className="inspect-dish-card">
                          <div className="dish-row-top">
                            <strong>{it.litres}L {it.foodName}</strong>
                            <span>₦{it.itemTotal.toLocaleString()}</span>
                          </div>
                          <span className="dish-row-sub">
                            Protein: {it.proteinName} | Pepper: {it.pepperLevel} | Spice: {it.spiceLevel}
                          </span>
                          {it.extras && it.extras.length > 0 && (
                            <div className="dish-extras">
                              {it.extras.map((ex, eIdx) => (
                                <span key={eIdx}>+{ex.quantity}x {ex.extraProteinName} (₦{ex.subtotal.toLocaleString()})</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="inspect-total-line">
                      <span>Grand Total:</span>
                      <strong>₦{selectedOrderDetails.grandTotal.toLocaleString()}</strong>
                    </div>

                    <div className="inspect-actions">
                      <button
                        type="button"
                        className="btn-inspect-track"
                        onClick={() => {
                          onOpenTicketTracking(selectedOrderDetails.orderCode);
                          setSelectedOrderDetails(null);
                        }}
                      >
                        Open Live Customer Ticket View ↗
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-MODAL 2: CUSTOMER ORDER HISTORY DRILLDOWN */}
            {selectedCustomerHistory && (
              <div className="submodal-overlay" onClick={() => setSelectedCustomerHistory(null)}>
                <div className="submodal-card history-card" onClick={e => e.stopPropagation()}>
                  <header className="submodal-header">
                    <div>
                      <h3>Customer Order History</h3>
                      <span className="submodal-subtitle">{selectedCustomerHistory.customerName} ({selectedCustomerHistory.customerEmail})</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-submodal-close"
                      onClick={() => setSelectedCustomerHistory(null)}
                    >
                      ✕
                    </button>
                  </header>

                  <div className="submodal-body">
                    {historyLoading ? (
                      <div className="admin-loading-state">
                        <span className="admin-spinner"></span>
                        <span>Loading historical tickets...</span>
                      </div>
                    ) : historyOrders.length === 0 ? (
                      <p>No historical orders found for this customer.</p>
                    ) : (
                      <div className="history-orders-list">
                        {historyOrders.map(ho => (
                          <div key={ho.orderCode} className="history-order-row">
                            <div className="ho-header">
                              <div>
                                <strong className="ho-code">{ho.orderCode}</strong>
                                <span className="ho-date">
                                  {new Date(ho.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                                </span>
                              </div>
                              <span className={`status-badge status-${ho.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {ho.status}
                              </span>
                            </div>

                            <div className="ho-items">
                              {ho.items.map(i => `${i.litres}L ${i.foodName}`).join(', ')}
                            </div>

                            <div className="ho-footer">
                              <span>Total: <strong>₦{ho.grandTotal.toLocaleString()}</strong></span>
                              <button
                                type="button"
                                className="btn-small-track"
                                onClick={() => {
                                  onOpenTicketTracking(ho.orderCode);
                                  setSelectedCustomerHistory(null);
                                }}
                              >
                                View Ticket ↗
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPortal;
