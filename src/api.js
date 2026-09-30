export async function api(path, opts = {}) {
  const token = localStorage.getItem('token');
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const res = await fetch(apiBase + '/api' + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401 && path !== '/auth/login') { localStorage.clear(); location.reload(); }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

export const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v && p.append(k, v));
  return '?' + p.toString();
};

export const today = () => new Date().toISOString().slice(0, 10);
