// Clave en localStorage
const STORAGE_KEY = 'cuponera_data_v1';

let state = {
  coupons: [],
  lastAction: null // { type: 'USE_COUPON', couponId }
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      return;
    } catch (e) {
      console.error('Error leyendo localStorage, reseteando', e);
    }
  }

  // Estado inicial por defecto
  state = {
    coupons: [
      {
        id: 'helado',
        title: 'Vale por un helado',
        description: 'Un helado a elección.',
        count: 3,
        imageUrl: 'img/helado.png'
      },
      {
        id: 'pantallas',
        title: '1 hora de pantalla',
        description: 'Videojuegos / tablet / compu 1 hora.',
        count: 5,
        imageUrl: 'img/pantallas.png'
      }
    ],
    lastAction: null
  };

  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderCoupons() {
  const container = document.getElementById('coupon-list');
  container.innerHTML = '';

  state.coupons.forEach(coupon => {
    const card = document.createElement('article');
    card.className = 'coupon-card';

    const img = document.createElement('img');
    img.className = 'coupon-image';
    img.src = coupon.imageUrl;
    img.alt = coupon.title;

    const content = document.createElement('div');
    content.className = 'coupon-content';

    const title = document.createElement('div');
    title.className = 'coupon-title';
    title.textContent = coupon.title;

    const desc = document.createElement('div');
    desc.className = 'coupon-counter';
    desc.textContent = coupon.description;

    const counter = document.createElement('div');
    counter.className = 'coupon-counter';
    counter.textContent = `Cupones disponibles: ${coupon.count}`;

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(counter);

    const actions = document.createElement('div');
    actions.className = 'coupon-actions';

    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn-share';
    shareBtn.textContent = 'Compartir';
    shareBtn.disabled = coupon.count <= 0;
    shareBtn.addEventListener('click', () => handleShare(coupon.id));

    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn-info';
    infoBtn.textContent = 'Ver detalle';
    infoBtn.addEventListener('click', () => {
      alert(`${coupon.title}\n\n${coupon.description}\n\nDisponibles: ${coupon.count}`);
    });

    actions.appendChild(shareBtn);
    actions.appendChild(infoBtn);

    card.appendChild(img);
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

  // Autoocultar después de 10s
  if (state.undoTimeoutId) {
    clearTimeout(state.undoTimeoutId);
  }
  state.undoTimeoutId = setTimeout(() => {
    hideUndoBar();
    state.lastAction = null;
    saveState();
  }, 10000);
}

function hideUndoBar() {
  const bar = document.getElementById('undo-bar');
  bar.classList.add('hidden');
}

function handleShare(couponId) {
  const coupon = state.coupons.find(c => c.id === couponId);
  if (!coupon || coupon.count <= 0) return;

  // Descontar uno y guardar acción para poder deshacer
  coupon.count -= 1;
  state.lastAction = {
    type: 'USE_COUPON',
    couponId: coupon.id
  };
  saveState();
  renderCoupons();
  showUndoBar(`Cupón "${coupon.title}" usado. Podés deshacer.`);

  const shareText = `${coupon.title} - ${coupon.description}`;
  const shareUrl = coupon.imageUrl; // si es URL absoluta mejor

  if (navigator.share) {
    navigator.share({
      text: shareText,
      url: shareUrl
    }).catch(err => {
      console.log('Compartir cancelado o falló', err);
      // Igual dejamos la opción de deshacer
    });
  } else {
    // Fallback mínimo
    alert('Compartí esta imagen/manualmente:\n\n' + shareUrl);
  }
}

function handleUndo() {
  const action = state.lastAction;
  if (!action || action.type !== 'USE_COUPON') return;

  const coupon = state.coupons.find(c => c.id === action.couponId);
  if (!coupon) return;

  coupon.count += 1;
  state.lastAction = null;
  saveState();
  renderCoupons();
  hideUndoBar();
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderCoupons();

  document
    .getElementById('undo-button')
    .addEventListener('click', handleUndo);
});
