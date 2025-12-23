import { useCoupon, undoCoupon } from './api.js';
import { loadState } from './storage.js';
import { renderCoupons } from './render.js';
import { loadTemplate, cloneTemplate } from './templates.js';
import { state } from './state.js';

export async function handleShare(coupon) {
  try {
    closeModal();               // ← CLAVE
    await useCoupon(coupon.id);
    await loadState();
    renderCoupons();
    showRedeemedScreen(coupon);
  } catch (e) {
    alert(e.message);
  }
}

async function handleUndo() {
  try {
    await undoCoupon();
    await loadState();
    renderCoupons();
  } catch (e) {
    alert(e.message);
  }
}

window.handleUndo = handleUndo;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

/* ---- Modales / pantallas ---- */
function ensureModalRoot() {
  let root = document.getElementById('modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-root';
    root.className = 'modal-root hidden';
    root.innerHTML = `<div class="modal-content"></div>`;
    document.body.appendChild(root);
  }
  return root;
}


export function closeModal() {
  const root = ensureModalRoot();
  root.classList.add('hidden');
  root.querySelector('.modal-content').innerHTML = '';
}

window.closeModal = closeModal;

export async function openDetailModal(couponId) {
  const coupon = state.coupons.find(c => c.id === couponId);
  if (!coupon) return;

  await loadTemplate('/templates/modal-detail.html');

  const root = ensureModalRoot();
  const content = root.querySelector('.modal-content');

  root.classList.remove('hidden');
  content.innerHTML = '';

  const node = cloneTemplate('tpl-modal-detail');
  content.appendChild(node);

  console.log(root.querySelectorAll('img'));

  root.querySelector('[data-image]').src = coupon.imageUrl;
  root.querySelector('[data-title]').textContent = coupon.title;
  root.querySelector('[data-category]').textContent = coupon.categoria || '';

  const list = root.querySelector('[data-description]');
  list.innerHTML = coupon.description;//.map(x => `<li>${x}</li>`).join('');

  root.querySelector('[data-use]').onclick = () => handleShare(coupon);

  root.querySelectorAll('[data-close]').forEach(el => {
    el.onclick = closeModal;
  });
}


export async function showRedeemedScreen(coupon) {
  await loadTemplate('/templates/redeemed.html');

  const root = ensureModalRoot();
  root.classList.remove('hidden');
  
  const content = root.querySelector('.modal-content');
  content.innerHTML = ''; // LIMPIA MODAL ACTUAL

  const node = cloneTemplate('tpl-redeemed');
  content.appendChild(node);

  // Texto
  const titleEl = root.querySelector('[data-title]');
  titleEl.textContent = `Disfrutá tu ${coupon.title}`;

  // Imagen (TIENE que ser un <img>)
  const imgEl = root.querySelector('img[data-image]');
  imgEl.src = coupon.imageUrl;
  imgEl.alt = coupon.title;

  // Cerrar
  root.querySelector('[data-close]').addEventListener('click', closeModal);

  // Undo
  root.querySelector('[data-undo]').addEventListener('click', async () => {
    await handleUndo();
    closeModal();
  });
}
