const STORAGE_KEY = 'cuponera_data_v1';

let state = {
  coupons: [],
  lastAction: null
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    state = JSON.parse(raw);
    // Normalizar por si venís con formato viejo
    state.coupons = (state.coupons || []).map(normalizeCoupon);
    return true;
  } catch (e) {
    console.error('Error leyendo localStorage, reseteando', e);
    return false;
  }
}

async function initFromJsonIfEmpty() {
  // Si ya hay cupones guardados, no pisa nada
  if (state.coupons && state.coupons.length) return;

  const resp = await fetch('coupons.json', { cache: 'no-store' });
  const json = await resp.json();

  state.coupons = json.map(normalizeCoupon);
  state.lastAction = null;
  saveState();
}

function normalizeCoupon(raw) {
  // soporta tu esquema + posibles typos
  const categoria = raw.categoria ?? raw.catergoria ?? '';
  const descripcion = Array.isArray(raw.descripcion)
    ? raw.descripcion
    : (raw.descripcion ? [String(raw.descripcion)] : []);

  return {
    id: raw.id,
    titulo: raw.titulo ?? raw.title ?? '',
    categoria,
    imagen_id: raw.imagen_id ?? null,
    imageUrl: raw.imageUrl ?? (raw.imagen_id ? `img/${raw.imagen_id}` : ''),
    tipo: raw.tipo ?? '',
    usos: Number.isFinite(raw.usos) ? raw.usos : (Number.isFinite(raw.count) ? raw.count : 0),
    descripcion
  };
}

function renderCoupons() {
  const container = document.getElementById('coupon-list');
  container.innerHTML = '';

  state.coupons.forEach(coupon => {
    const card = document.createElement('article');
    card.className = 'coupon-card';

    const divImg = document.createElement('div');
    divImg.className = "coupon-left";

    const img = document.createElement('img');
    img.className = 'coupon-avatar';
    img.src = coupon.imageUrl;
    img.alt = coupon.titulo;

    const content = document.createElement('div');
    content.className = 'coupon-mid';

    const title = document.createElement('div');
    title.className = 'coupon-title';
    title.textContent = coupon.titulo;

    const pill = document.createElement('div');
    pill.className = 'coupon-pill';
    pill.textContent = coupon.categoria;

    const counter = document.createElement('div');
    counter.className = 'coupon-meta';
    counter.textContent = `Cupones disponibles: ${coupon.usos}`;

    content.appendChild(title);
    content.appendChild(pill);
    content.appendChild(counter);

    const actions = document.createElement('div');
    actions.className = 'coupon-right';

    const useBtn = document.createElement('button');
    useBtn.className = 'btn btn-primary';
    useBtn.textContent = 'USAR';
    useBtn.disabled = coupon.usos <= 0;
    useBtn.addEventListener('click', () => handleUse(coupon.id));

    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn-info';
    infoBtn.textContent = 'DETALLE';
    infoBtn.addEventListener('click', () => openDetailModal(coupon.id));

    actions.appendChild(useBtn);
    actions.appendChild(infoBtn);

    divImg.appendChild(img);

    card.appendChild(divImg);
    card.appendChild(content);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

function showUndoBar(message) {
  const bar = document.getElementById('undo-bar');
  const msg = document.getElementById('undo-message');
  msg.textContent = message || 'Cupón usado.';
  bar.classList.remove('hidden');

  if (state.undoTimeoutId) clearTimeout(state.undoTimeoutId);
  state.undoTimeoutId = setTimeout(() => {
    hideUndoBar();
    state.lastAction = null;
    saveState();
  }, 10000);
}

function hideUndoBar() {
  document.getElementById('undo-bar').classList.add('hidden');
}

function handleUse(couponId) {
  const coupon = state.coupons.find(c => c.id === couponId);
  if (!coupon || coupon.usos <= 0) return;

  coupon.usos -= 1;
  state.lastAction = { type: 'USE_COUPON', couponId: coupon.id };
  saveState();
  renderCoupons();
  showUndoBar(`Cupón "${coupon.titulo}" usado. Podés deshacer.`);

  // Pantalla "canjeado" simple (sin framework, sin drama)
  showRedeemedScreen(coupon.titulo);
}

function handleUndo() {
  const action = state.lastAction;
  if (!action || action.type !== 'USE_COUPON') return;

  const coupon = state.coupons.find(c => c.id === action.couponId);
  if (!coupon) return;

  coupon.usos += 1;
  state.lastAction = null;
  saveState();
  renderCoupons();
  hideUndoBar();
}

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

function openDetailModal(couponId) {
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

function showRedeemedScreen(titulo) {
  const root = ensureModalRoot();
  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="redeemed-screen">
      <div class="redeemed-content">
        <div class="redeemed-title">¡Cupón canjeado!</div>
        <div class="redeemed-sub">Disfrutá tu ${escapeHtml(titulo)}</div>
        <div class="redeemed-check">✓</div>
        <button class="btn-primary" onclick="closeModal()">¡ENTENDIDO!</button>
      </div>
    </div>
  `;
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', async () => {
  const ok = loadState(); // lee localStorage si existe
  if (!ok) {
    // si estaba roto o vacío, queda state vacío
    state = { coupons: [], lastAction: null };
  }

  await initFromJsonIfEmpty();
  renderCoupons();

  document.getElementById('undo-button').addEventListener('click', handleUndo);
});
