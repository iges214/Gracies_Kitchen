import { MENU_ITEMS, MENU_CATEGORIES } from '../data/menuData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const ADMIN_TOKEN_KEY = 'gk_admin_jwt_token';
const ADMIN_USER_KEY = 'gk_admin_user_data';

const USER_TOKEN_KEY = 'gk_user_jwt_token';
const USER_DATA_KEY = 'gk_user_data';

// --- Admin Auth Utilities ---
export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser() {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAdminSession(token, user) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

// --- Customer / User Auth Utilities ---
export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function getUserData() {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserSession(token, user) {
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

function getAuthHeaders() {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function getUserAuthHeaders() {
  const token = getUserToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// --- Public Endpoints ---

/**
 * Fetch all available foods from the backend API.
 * Falls back to static menu data if the API is momentarily unreachable.
 */
export async function fetchFoods() {
  try {
    const res = await fetch(`${API_BASE_URL}/foods`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return { data, isLive: true };
  } catch (error) {
    console.warn('Backend API unavailable, falling back to local menu dataset:', error.message);
    return { data: MENU_ITEMS, isLive: false, error: error.message };
  }
}

/**
 * Fetch food categories.
 */
export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/foods/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (error) {
    console.warn('Using fallback categories:', error.message);
    return MENU_CATEGORIES;
  }
}

/**
 * Submit an order to the backend API.
 * The server calculates the authoritative price, generates a ticket code, dispatches email, and returns order details.
 */
export async function createOrder(orderPayload) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  const responseData = await res.json();

  if (!res.ok) {
    const errorMsg = responseData?.message || responseData?.title || 'Failed to submit order. Please check your inputs.';
    throw new Error(errorMsg);
  }

  return responseData;
}

/**
 * Retrieve order/ticket details by unique reference code (e.g. GK-1042).
 */
export async function fetchOrderByCode(orderCode) {
  const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderCode)}`);
  if (!res.ok) {
    throw new Error(`Order or ticket '${orderCode}' not found.`);
  }
  return await res.json();
}

// --- Public User Authentication & Customer Endpoints ---

/**
 * Public User Registration (/register)
 */
export async function userRegister({ email, username, password, fullName, phoneNumber }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, username, password, fullName, phoneNumber })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Registration failed.');
  }

  saveUserSession(data.token, {
    email: data.email,
    username: data.username,
    fullName: data.fullName,
    role: data.role
  });

  return data;
}

/**
 * Public User Login (/login)
 */
export async function userLogin(emailOrUsername, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ emailOrUsername, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Invalid email/username or password.');
  }

  saveUserSession(data.token, {
    email: data.email,
    username: data.username,
    fullName: data.fullName,
    role: data.role
  });

  return data;
}

/**
 * Fetch Current Authenticated User Profile
 */
export async function fetchCurrentUserProfile() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getUserAuthHeaders()
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearUserSession();
    }
    throw new Error('Failed to fetch user profile.');
  }

  return await res.json();
}

/**
 * Fetch Order History for Current Authenticated Customer
 */
export async function fetchMyOrders() {
  const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: getUserAuthHeaders()
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearUserSession();
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw new Error('Failed to retrieve order history.');
  }

  return await res.json();
}

// --- Admin Endpoints ---

/**
 * Admin Login
 */
export async function adminLogin(emailOrUsername, password) {
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ emailOrUsername, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Invalid admin credentials');
  }

  saveAdminSession(data.token, {
    email: data.email,
    fullName: data.fullName,
    role: data.role
  });

  return data;
}

/**
 * Fetch KPI Dashboard Stats
 */
export async function fetchAdminDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearAdminSession();
      throw new Error('Admin session expired. Please log in again.');
    }
    throw new Error('Failed to load dashboard statistics.');
  }

  return await res.json();
}

/**
 * Fetch all tickets/orders with optional status and search filter
 */
export async function fetchAdminOrders(status = '', search = '', page = 1, pageSize = 50) {
  const params = new URLSearchParams();
  if (status && status !== 'All') params.append('status', status);
  if (search) params.append('search', search);
  params.append('page', page);
  params.append('pageSize', pageSize);

  const res = await fetch(`${API_BASE_URL}/admin/orders?${params.toString()}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearAdminSession();
      throw new Error('Admin session expired. Please log in again.');
    }
    throw new Error('Failed to load admin orders.');
  }

  return await res.json();
}

/**
 * Fetch single order detail for admin
 */
export async function fetchAdminOrderDetail(orderCode) {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${encodeURIComponent(orderCode)}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    throw new Error(`Order ${orderCode} not found.`);
  }

  return await res.json();
}

/**
 * Update order/ticket status (Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled)
 */
export async function updateAdminOrderStatus(orderCode, newStatus, adminNote = null) {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${encodeURIComponent(orderCode)}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: newStatus, adminNote })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to update order status');
  }

  return data;
}

/**
 * Fetch customer list & metrics
 */
export async function fetchAdminCustomers(search = '') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE_URL}/admin/customers?${params.toString()}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearAdminSession();
      throw new Error('Admin session expired. Please log in again.');
    }
    throw new Error('Failed to load customer list.');
  }

  return await res.json();
}

/**
 * Fetch full order history for a customer
 */
export async function fetchCustomerOrders(customerEmail) {
  const res = await fetch(`${API_BASE_URL}/admin/customers/${encodeURIComponent(customerEmail)}/orders`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    throw new Error(`Failed to load order history for ${customerEmail}`);
  }

  return await res.json();
}
