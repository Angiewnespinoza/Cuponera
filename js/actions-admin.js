import { loadTemplate, cloneTemplate } from './templates.js';
import { closeModal, ensureModalRoot } from './actions.js';
import {
  fetchCategorias,
  fetchImagenes,
  fetchRestricciones,
  createCupon,
  uploadImagen
} from './api.js';

const ADMIN_PIN = '1234'; // luego lo movés a backend

export async function openAdminModal() {
  await loadTemplate('/templates/modal-admin.html');

  const root = ensureModalRoot();
  const content = root.querySelector('.modal-content');

  root.classList.remove('hidden');
  content.innerHTML = '';

  const node = cloneTemplate('tpl-modal-admin');
  content.appendChild(node);

  const stepPin = node.querySelector('[data-step="pin"]');
  const stepPanel = node.querySelector('[data-step="panel"]');

  // ---- PIN ----
  node.querySelector('[data-pin-submit]').onclick = () => {
    const pin = node.querySelector('[data-pin]').value;
    if (pin !== ADMIN_PIN) {
      alert('PIN incorrecto');
      return;
    }
    stepPin.hidden = true;
    stepPanel.hidden = false;
    initAdminPanel(node);
  };

  node.querySelector('[data-close]').onclick = closeModal;
}

async function initAdminPanel(node) {
  const [cats, imgs, rests] = await Promise.all([
    fetchCategorias(),
    fetchImagenes(),
    fetchRestricciones()
  ]);

  fillSelect(node.querySelector('[data-category]'), cats);
  fillSelect(node.querySelector('[data-image]'), imgs);
  fillSelect(node.querySelector('[data-restriction]'), rests);

  setupTabs(node);
  setupForms(node);
}

function fillSelect(select, items) {
  select.innerHTML = '';
  items.forEach(i => {
    const opt = document.createElement('option');
    opt.value = i.id;
    opt.textContent = i.descripcion;
    select.appendChild(opt);
  });
}

function setupForms(node) {
  // IMAGEN
  node.querySelector('[data-panel="image"]').onsubmit = async e => {
    e.preventDefault();

    const desc = node.querySelector('[data-img-desc]').value;
    const file = node.querySelector('[data-img-file]').files[0];

    if (!file || !desc) {
        alert('Faltan datos');
        return;
    }

    const base64 = await fileToBase64(file);

    await uploadImagen({ descripcion: desc, imagen: base64 });

    alert('Imagen subida');
  };

  // CUPÓN
  node.querySelector('[data-panel="coupon"]').onsubmit = async e => {
    e.preventDefault();

    if (!node.querySelector('[data-title]').value || node.querySelector('[data-uses]').value <= 0) {
        alert('Datos inválidos');
        return;
    }

    await createCupon({
      titulo: node.querySelector('[data-title]').value,
      descripcion: node.querySelector('[data-description]').value,
      usos: +node.querySelector('[data-uses]').value,
      categoriaId: node.querySelector('[data-category]').value,
      imagenId: node.querySelector('[data-image]').value,
      restriccionId: node.querySelector('[data-restriction]').value
    });

    alert('Cupón creado');
  };
}

function fileToBase64(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
}

function setupTabs(node) {
  const tabs = node.querySelectorAll('[data-tab]');
  const panels = node.querySelectorAll('[data-panel]');

  tabs.forEach(tab => {
    tab.onclick = () => {
      panels.forEach(p => p.hidden = true);
      node.querySelector(`[data-panel="${tab.dataset.tab}"]`).hidden = false;
    };
  });

  tabs[0].click();
}