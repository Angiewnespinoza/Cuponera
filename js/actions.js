import { useCoupon, undoCoupon } from './api.js';
import { loadState } from './storage.js';
import { renderCoupons } from './render.js';

export async function handleShare(coupon) {
  try {
    await useCoupon(coupon.id);
    await loadState();
    renderCoupons();
    showRedeemedScreen(coupon.title);
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
    document.body.appendChild(root);
  }
  return root;
}
function closeModal() {
  const root = ensureModalRoot();
  root.classList.add('hidden');
  root.innerHTML = '';
}

window.closeModal = closeModal;

export function openDetailModal(couponId) {
  const coupon = state.coupons.find(c => c.id === couponId);
  if (!coupon) return;

  const root = ensureModalRoot();
  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal()"></div>
    <div class="modal-sheet">
      <div class="modal-card">
        <img class="detail-image" src="${coupon.imageUrl}" alt="${escapeHtml(coupon.titulo)}">
        <h2 class="detail-title">${escapeHtml(coupon.titulo)}</h2>
        <div class="detail-pill">${escapeHtml(coupon.categoria)}</div>

        <div class="detail-section">
          <div class="detail-label">Términos del cupón:</div>
          <ul class="detail-list">
            ${coupon.descripcion.map(x => `<li>${escapeHtml(x)}</li>`).join('')}
          </ul>
        </div>

        <button class="btn-primary" ${coupon.usos<=0?'disabled':''} onclick="handleUse('${coupon.id}')">USAR AHORA</button>
        <button class="btn-ghost" onclick="closeModal()">CERRAR</button>
      </div>
    </div>
  `;
}


//TODO el handleUndo podria mostrar algo mas
function showRedeemedScreen(titulo) {
  const root = ensureModalRoot();
  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="redeemed-screen">
      <div class="redeemed-content">
        <div class="redeemed-title">¡Cupón canjeado!</div>
        <div class="redeemed-sub">Disfrutá tu ${escapeHtml(titulo)}</div>
        <div class="redeemed-check">✓</div>
        <button class="btn-primary" onclick="closeModal();">¡ENTENDIDO!</button>
        <button" onclick="handleUndo(); closeModal();">¡ENTENDIDO!</button>
      </div>
    </div>
  `;
}