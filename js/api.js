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

export function fetchImagenes() {
  return apiFetch('/imagenes');
}

export function fetchRestricciones() {
  return apiFetch('/restricciones');
}

export function fetchCategorias() {
  return apiFetch('/categorias');
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
