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
 * Fetch wrapper. Relative paths hit VITE_API_BASE_URL; absolute URLs (used by
 * the hosted node API via the /nodes-api proxy) pass through unchanged.
 */
export async function apiFetch(path, { method = 'GET', body, headers = {}, ...options } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  let response;
  try {
    response = await fetch(url, {
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

/* ------------------------------------------------------------------ */
/* Station API — first endpoints migrated off the mock layer.           */
/* ------------------------------------------------------------------ */

/** GET ${VITE_API_BASE_URL}/stations — list all monitoring stations. */
export async function getStations() {
  return apiFetch('/stations');
}

/**
 * GET ${VITE_API_BASE_URL}/stations/:stationId/data
 * Optional `dataType` ('realtime' | 'history') is sent as ?type=.
 */
export async function getStationData(stationId, dataType) {
  const query = dataType ? `?type=${encodeURIComponent(dataType)}` : '';
  return apiFetch(`/stations/${encodeURIComponent(stationId)}/data${query}`);
}

/* ------------------------------------------------------------------ */
/* Nodes API — hosted landslide early-warning backend.                  */
/* Browser calls are proxied same-origin through /nodes-api (see        */
/* vite.config.js) because the backend does not send CORS headers yet.  */
/* ------------------------------------------------------------------ */

const NODES_API_BASE_URL = `${window.location.origin}/nodes-api`;

/** GET /nodes/getAllNodes — returns an array of node objects. */
export async function getNodes() {
  return apiFetch(`${NODES_API_BASE_URL}/nodes/getAllNodes`);
}

/** GET /nodes/getbyName/:name — full telemetry for one node. */
export async function getNodeByName(name) {
  return apiFetch(`${NODES_API_BASE_URL}/nodes/getbyName/${encodeURIComponent(name)}`);
}

/** POST /nodes/addNode — register a new node. */
export async function addNode(data) {
  return apiFetch(`${NODES_API_BASE_URL}/nodes/addNode`, { method: 'POST', body: data });
}

/** DELETE /nodes/deleteNode/:id — remove a node by id. */
export async function deleteNode(id) {
  return apiFetch(`${NODES_API_BASE_URL}/nodes/deleteNode/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/**
 * POST /api/citizen-reports — submits a citizen landslide report as
 * multipart/form-data (photo blob + report fields). Sent with raw fetch so
 * the browser sets the multipart boundary; apiFetch would force JSON.
 */
export async function submitCitizenReport(formData) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/citizen-reports`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData,
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
      payload?.message ?? `Report failed with status ${response.status}.`,
      response.status,
      payload
    );
  }
  return payload;
}

export { API_BASE_URL, USE_MOCKS };
