import { loadState } from './js/storage.js';
import { renderCoupons } from './js/render.js';
import { fetchCoupons } from './js/api.js';
import { state } from './js/state.js';
import { saveState } from './js/storage.js';
import { openAdminModal } from './js/actions-admin.js';
import { loadTemplate } from './js/templates.js';

document.addEventListener('DOMContentLoaded', async () => {
  loadState();

  try {
    state.coupons = await fetchCoupons();
    saveState();
    renderCoupons();
  } catch (e) {
    alert(e.message);
    console.log(e);
  }

});

document.addEventListener('DOMContentLoaded', async () => {
  loadState();
  state.coupons = await fetchCoupons();
  renderCoupons();

  document
    .getElementById('btn-admin')
    .addEventListener('click', openAdminModal);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

await loadTemplate('/templates/confirm-redeem.html');