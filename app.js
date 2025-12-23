import { loadState } from './js/storage.js';
import { renderCoupons } from './js/render.js';
import { fetchCoupons } from './js/api.js';
import { state } from './js/state.js';
import { saveState } from './js/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  loadState();

  try {
    state.coupons = await fetchCoupons();
    saveState();
    renderCoupons();
  } catch (e) {
    alert(e.message);
  }

});