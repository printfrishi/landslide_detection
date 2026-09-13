import { ApiError, TOKEN_KEY, simulateDelay } from './api';

const MOCK_ROLE = 'field-officer';

/**
 * Mock tokens are signed-looking strings ("mock.<base64 user>") so that
 * getMe() can restore the session after a page refresh, exactly like a real
 * JWT flow would.
 */
function encodeToken(user) {
  return `mock.${btoa(JSON.stringify(user))}`;
}

function decodeToken(token) {
  try {
    const [, payload] = token.split('.');
    const user = JSON.parse(atob(payload));
    return user?.email ? user : null;
  } catch {
    return null;
  }
}

function nameFromEmail(email) {
  const localPart = email.split('@')[0] ?? '';
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') || 'HimRakshak User';
}

const authService = {
  async login({ email, password }) {
    // TODO(backend): POST /api/auth/login — verify credentials, return JWT.
    await simulateDelay();
    const user = { id: 'usr-001', name: nameFromEmail(email), email, role: MOCK_ROLE };
    return { user, token: encodeToken(user) };
  },

  async register({ name, email }) {
    // TODO(backend): POST /api/auth/register — create account, return JWT.
    await simulateDelay();
    const user = { id: 'usr-001', name: name.trim(), email, role: MOCK_ROLE };
    return { user, token: encodeToken(user) };
  },

  async getMe() {
    // TODO(backend): GET /api/auth/me — resolve the current user from the JWT.
    await simulateDelay();
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new ApiError('Not authenticated.', 401);
    const user = decodeToken(token);
    if (!user) throw new ApiError('Session expired. Please sign in again.', 401);
    return user;
  },

  async updateProfile({ name }) {
    // TODO(backend): PATCH /api/auth/me — update the current user's profile.
    await simulateDelay();
    const token = localStorage.getItem(TOKEN_KEY);
    const current = token ? decodeToken(token) : null;
    if (!current) throw new ApiError('Not authenticated.', 401);
    return { ...current, name: name.trim() };
  },

  async logout() {
    // TODO(backend): POST /api/auth/logout — invalidate the session server-side.
    await simulateDelay();
    return true;
  },

  /**
   * Auto-fill data for citizen reports: resolves the signed-in user from the
   * mock session token and reads any locally stored mobile number. Returns
   * null when nobody is signed in.
   */
  async getUserProfile() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = token ? decodeToken(token) : null;
    if (!user) return null;
    return {
      name: user.name ?? '',
      email: user.email ?? '',
      mobile: localStorage.getItem('hr_mobile') ?? '',
    };
  },
};

export default authService;
