/**
 * OpticEdge API Client
 * Centralized API layer that communicates with the Express backend.
 * All API calls go through here — auth token is managed automatically.
 */

const API_BASE = '/api';

/**
 * Get the stored JWT token.
 */
const getToken = () => localStorage.getItem('opticedge_token');

/**
 * Make an authenticated API request.
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || `Request failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

// ─── Auth ────────────────────────────────────────────────────────

export const apiLogin = async (username, password) => {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // Store token
  if (result.data?.token) {
    localStorage.setItem('opticedge_token', result.data.token);
    localStorage.setItem('opticedge_user', JSON.stringify(result.data.user));
  }

  return result.data;
};

export const apiLogout = () => {
  localStorage.removeItem('opticedge_token');
  localStorage.removeItem('opticedge_user');
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('opticedge_user');
    const token = localStorage.getItem('opticedge_token');
    if (user && token) {
      return JSON.parse(user);
    }
    return null;
  } catch {
    return null;
  }
};

// ─── Patients ────────────────────────────────────────────────────

export const apiCreatePatient = async (patientData) => {
  const result = await request('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
  return result.data;
};

export const apiGetPatient = async (id) => {
  const result = await request(`/patients/${id}`);
  return result.data;
};

export const apiGetAllPatients = async () => {
  const result = await request('/patients');
  return result.data;
};

// ─── Screenings ──────────────────────────────────────────────────

export const apiCreateScreening = async (screeningData) => {
  const result = await request('/screenings', {
    method: 'POST',
    body: JSON.stringify(screeningData),
  });
  return result.data;
};

export const apiGetScreenings = async () => {
  const result = await request('/screenings');
  return result.data;
};

export const apiGetScreening = async (id) => {
  const result = await request(`/screenings/${id}`);
  return result.data;
};

export const apiValidateScreening = async (id, validationData) => {
  const result = await request(`/screenings/${id}/validate`, {
    method: 'PATCH',
    body: JSON.stringify(validationData),
  });
  return result.data;
};
