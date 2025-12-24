import { state, setState } from './state.js';
import { fetchCoupons } from './api.js';

export async function loadState() {
  const data = await fetchCoupons();

  setState({
    coupons: data.map(c => ({
      id: c.id,
      title: c.titulo,
      description: c.descripcion,
      category: c.categoria,
      stars: c.restriccion,
      count: c.usos,
      imageUrl: c.imagen?.img || ''
    })),
    lastAction: null,
    undoTimeoutId: null
  });
}

// queda solo para UI (snackbar, timers, etc.)
export function saveState() {
  // opcional: podés dejarlo vacío o solo guardar flags
}
