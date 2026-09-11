export const TOKEN_KEY = 'hr_token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/** Normalized API failure so components always handle errors the same way. */
export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** Simulated network latency for the mock service layer (300-800ms). */
export function simulateDelay() {
  const ms = Math.floor(Math.random() * 500) + 300;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch wrapper for the future real backend. Mock services do not use it yet,
 * but swapping them over must not require any component changes.
 */
export async function apiFetch(path, { method = 'GET', body, headers = {}, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}.`,
      response.status,
      payload
    );
  }
  return payload;
}

export { API_BASE_URL, USE_MOCKS };
