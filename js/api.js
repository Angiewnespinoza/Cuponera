const API_BASE = 'http://192.168.1.9:3001/api';

async function apiFetch(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error API');
  }

  return res.json();
}

export function fetchCoupons() {
  return apiFetch('/cupones');
}

export function useCoupon(id) {
  return apiFetch(`/cupones/${id}/use`, {
    method: 'POST'
  });
}

export function undoCoupon() {
  return apiFetch('/cupones/undo', {
    method: 'POST'
  });
}
