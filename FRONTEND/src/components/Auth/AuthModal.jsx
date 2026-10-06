import { useState, useEffect } from 'react';
import { userLogin, userRegister, fetchMyOrders, clearUserSession } from '../../services/api';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, initialMode = 'login', currentUser, onAuthSuccess, onSignOut }) {
  // mode: 'login' | 'register' | 'account'
  const [mode, setMode] = useState(initialMode);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  // Orders State
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setMode('account');
    } else {
      setMode(initialMode === 'register' ? 'register' : 'login');
    }
    setError(null);
    setSuccessMsg(null);
  }, [isOpen, initialMode, currentUser]);

  useEffect(() => {
    if (isOpen && currentUser && mode === 'account') {
      loadCustomerOrders();
    }
  }, [isOpen, currentUser, mode]);

  const loadCustomerOrders = async () => {
    setOrdersLoading(true);
    try {
      const orders = await fetchMyOrders();
      setMyOrders(orders);
    } catch {
      setMyOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await userLogin(loginEmail, loginPassword);
      setSuccessMsg('Welcome back!');
      if (onAuthSuccess) onAuthSuccess(data);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await userRegister({
        fullName,
        email,
        username,
        phoneNumber,
        password
      });

      setSuccessMsg('Account created successfully!');
      if (onAuthSuccess) onAuthSuccess(data);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    clearUserSession();
    if (onSignOut) onSignOut();
    onClose();
  };

  return (
    <div className="auth-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        
        {/* Modal Close Button */}
        <button type="button" className="auth-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Header */}
        <div className="auth-header">
          <span className="auth-brand-kicker">Gracie's Kitchen</span>
          <h2 className="auth-title">
            {mode === 'account' ? 'Customer Profile' : mode === 'register' ? 'Join Gracie\'s Kitchen' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'account' 
              ? 'Manage your orders and saved catering preferences' 
              : mode === 'register' 
              ? 'Create a customer account to track your orders and enjoy priority chef catering' 
              : 'Sign in with your email or username to view your orders'}
          </p>
        </div>

        {/* Tab Switcher (Only when not logged in) */}
        {!currentUser && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(null); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(null); }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="auth-alert error-alert">
            <span>⚠️ {error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success-alert">
            <span>✓ {successMsg}</span>
          </div>
        )}

        {/* Mode: Account Details & Order History */}
        {currentUser && mode === 'account' && (
          <div className="auth-account-view">
            <div className="account-card">
              <div className="account-avatar">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="account-meta">
                <span className="account-name">{currentUser.fullName}</span>
                <span className="account-email">{currentUser.email}</span>
                <span className="account-badge">Customer Account</span>
              </div>
            </div>

            <div className="account-orders-section">
              <div className="orders-header-row">
                <h4 className="orders-heading">Your Order History</h4>
                <button type="button" className="btn-refresh-orders" onClick={loadCustomerOrders} disabled={ordersLoading}>
                  {ordersLoading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>

              {ordersLoading ? (
                <div className="orders-loading-state">Loading your past pots & catering orders...</div>
              ) : myOrders.length === 0 ? (
                <div className="orders-empty-state">
                  <p>You have not placed any orders under this email yet.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {myOrders.map(order => (
                    <div key={order.orderCode} className="order-history-card">
                      <div className="history-top">
                        <span className="history-code">{order.orderCode}</span>
                        <span className={`history-status status-${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="history-details">
                        <span className="history-items-count">
                          {order.items?.length || 0} meal pot(s) • ₦{Number(order.grandTotal).toLocaleString()}
                        </span>
                        <span className="history-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="account-actions">
              <button type="button" className="btn-auth-signout" onClick={handleLogoutClick}>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Mode: Login */}
        {!currentUser && mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email or Username</label>
              <input
                type="text"
                className="auth-input"
                required
                placeholder="e.g. name@example.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                required
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In to Your Account →'}
            </button>
          </form>
        )}

        {/* Mode: Register */}
        {!currentUser && mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                required
                placeholder="e.g. Jane Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>

            <div className="auth-field-grid">
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  className="auth-input"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Username</label>
                <input
                  type="text"
                  className="auth-input"
                  required
                  placeholder="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="auth-input"
                placeholder="e.g. +234 800 000 0000"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                required
                minLength={8}
                placeholder="At least 8 characters (letters & numbers)"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration →'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default AuthModal;
