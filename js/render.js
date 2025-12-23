import { state } from './state.js';
import { handleShare } from './actions.js';

export function renderCoupons() {
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
    img.alt = coupon.title;

    const content = document.createElement('div');
    content.className = 'coupon-mid';

    const title = document.createElement('div');
    title.className = 'coupon-title';
    title.textContent = coupon.title;

    const pill = document.createElement('div');
    pill.className = 'coupon-pill';
    pill.textContent = coupon.stars.id;

    const counter = document.createElement('div');
    counter.className = 'coupon-meta';
    counter.textContent = `Cupones disponibles: ${coupon.count}`;

    content.appendChild(title);
    content.appendChild(pill);
    content.appendChild(counter);

    const actions = document.createElement('div');
    actions.className = 'coupon-right';

    const useBtn = document.createElement('button');
    useBtn.className = 'btn btn-primary';
    useBtn.textContent = 'USAR';
    useBtn.disabled = coupon.count <= 0;
    useBtn.onclick = () => handleShare(coupon);

    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn-info';
    infoBtn.textContent = 'DETALLE';
    infoBtn.onclick = () =>
      alert(`${coupon.title}\n\n${coupon.description}\n\nDisponibles: ${coupon.count}`);

    actions.appendChild(useBtn);
    actions.appendChild(infoBtn);

    divImg.appendChild(img);

    card.appendChild(divImg);
    card.appendChild(content);
    card.appendChild(actions);

    container.appendChild(card);
  });
}