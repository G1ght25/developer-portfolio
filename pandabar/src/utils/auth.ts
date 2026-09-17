/**
 * PandaBar Authentication & Token Management Utilities
 */

export function getAuthToken(): string | null {
  try {
    const direct = localStorage.getItem('pandabar_auth_token');
    if (direct && typeof direct === 'string') return direct;
    const userStr = localStorage.getItem('pandabar_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      return u?.token || null;
    }
  } catch {}
  return null;
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
