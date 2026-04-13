/**
 * OpticEdge API Client
 * Centralized API layer that communicates with the Express backend.
 * All API calls go through here — auth token is managed automatically.
 *
 * Backend URL dikonfigurasi lewat .env:
 *   VITE_API_URL=http://localhost:3000
 * Vite proxy secara otomatis meneruskan `/api/*` ke URL tersebut saat dev.
 */

// Saat dev → Vite proxy meneruskan /api/* ke VITE_API_URL
// Saat production → ganti VITE_API_URL ke URL server production
const API_BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;


/**
 * Get the stored JWT token.
 */
const getToken = () => localStorage.getItem('opticedge_token');

/**
 * Make an authenticated API request (JSON).
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

/**
 * Make an authenticated multipart/form-data request (for file uploads).
 * Do NOT set Content-Type — the browser will set it with the correct boundary.
 */
const requestMultipart = async (endpoint, formData) => {
  const token = getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

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

/**
 * Create a screening with a file upload (multipart/form-data).
 * @param {Object} screeningData - { patient_id, ai_prediction, ai_confidence }
 * @param {Blob|File} imageFile - The eye image file
 */
export const apiCreateScreening = async (screeningData, imageFile) => {
  const formData = new FormData();
  formData.append('patient_id', screeningData.patient_id);
  formData.append('ai_prediction', screeningData.ai_prediction);
  formData.append('ai_confidence', String(screeningData.ai_confidence));
  formData.append('sync_status', screeningData.sync_status || 'synced');

  if (imageFile) {
    formData.append('eye_image', imageFile);
  }

  const result = await requestMultipart('/screenings', formData);
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
