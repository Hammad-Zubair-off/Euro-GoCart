import { supabase } from './supabase';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Fetch helper for the Express API.
 * @param {string} path - path under /api (e.g. "/products")
 * @param {RequestInit & { auth?: boolean }} options
 */
export async function api(path, options = {}) {
  const { auth = false, headers = {}, body, ...rest } = options;

  const finalHeaders = { ...headers };

  if (auth) {
    const token = await getAccessToken();
    if (!token) {
      const err = new Error('Please login to continue');
      err.status = 401;
      throw err;
    }
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isFormData && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body && !isFormData && typeof body === 'object' ? JSON.stringify(body) : body,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    const err = new Error(json.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.errors = json.errors;
    throw err;
  }

  return json.data;
}
