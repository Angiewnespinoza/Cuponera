//LOCAL
// const API_BASE = 'http://192.168.1.9:3001/api';
//PROD
const API_BASE = 'https://srv416103.hstgr.cloud/api';

const adminCache = {
  categorias: null,
  imagenes: null,
  restricciones: null,
};

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

async function cachedFetch(key, url, force = false) {
  if (!force && adminCache[key]) {
    return adminCache[key];
  }

  const data = await apiFetch(url);
  adminCache[key] = data;
  return data;
}

export function fetchCoupons() {
  return apiFetch('/cupones');
}

export function fetchCategorias(force = false) {
  return cachedFetch('categorias', '/categorias', force);
}

export function fetchImagenes(force = false) {
  return cachedFetch('imagenes', '/imagenes', force);
}

export function fetchRestricciones(force = false) {
  return cachedFetch('restricciones', '/restricciones', force);
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

export function createCupon(data) {
  return apiFetch('/cupones', {
    method: 'POST',
    body: JSON.stringify({
      titulo: data.titulo,
      descripcion: data.descripcion,
      usos: data.usos,
      categoriaId: data.categoriaId,
      imagenId: data.imagenId,
      restriccionId: data.restriccionId
    })
  });
}

export function uploadImagen(data) {
  return apiFetch('/imagenes', {
    method: 'POST',
    body: JSON.stringify({
      descripcion: data.descripcion,
      img: data.imagen
    })
  });
}

export function invalidateAdminCache(keys = []) {
  keys.forEach(k => adminCache[k] = null);
}