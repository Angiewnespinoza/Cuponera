import { state } from './state.js';
import { handleShare, openDetailModal} from './actions.js';
import { loadTemplate, cloneTemplate } from './templates.js';

export async function renderCoupons() {
  await loadTemplate('/templates/coupon-card.html');

  const container = document.getElementById('coupon-list');
  container.innerHTML = '';

  state.coupons.forEach(coupon => {
    const node = cloneTemplate('tpl-coupon-card');

    node.querySelector('[data-image]').src = coupon.imageUrl;
    node.querySelector('[data-image]').alt = coupon.title;
    node.querySelector('[data-title]').textContent = coupon.title;
    node.querySelector('[data-count]').textContent = `Cupones disponibles: ${coupon.count}`;
    node.querySelector('#stars-wrapper').id = 'stars-wrapper' + coupon.id;
    node.querySelector('#stars').id = 'stars' + coupon.id;
    // node.querySelector('#tooltip').id = 'tooltip' + coupon.id;

    if(coupon.stars.nivel === 5){
      node.classList.add('gold');
    }

    const useBtn = node.querySelector('[data-use]');
    useBtn.disabled = coupon.count <= 0;
    useBtn.onclick = () => handleShare(coupon);

    node.querySelector('[data-detail]').onclick =
      () => openDetailModal(coupon);

    container.appendChild(node);

    renderStars(coupon);
  });
}

export function renderStars(cupon){
    // Carga de estrellas  
    const rating = cupon.stars.nivel;
    // const tooltipText = cupon.stars.descripcion;
    const total = 5;
    const starsContainer = document.getElementById('stars' + cupon.id);
    // const tooltip = wrapper.querySelector('#tooltip' + cupon.id);

    // tooltip.firstElementChild.innerHTML = tooltipText;

    // starsContainer.innerHTML = '';

    // Render estrellas
    for (let i = 0; i < total; i++) {
      const star = document.createElement('span');
      star.className = 'star' + (i < rating ? ' on' : '');
      star.textContent = '★';
      starsContainer.appendChild(star);
    }

    // PC: hover
    // wrapper.addEventListener('mouseenter', () => {
    //     wrapper.classList.add('show-tooltip');
    // });

    // wrapper.addEventListener('mouseleave', () => {
    //     wrapper.classList.remove('show-tooltip');
    // });

    // // Mobile: tap
    // wrapper.addEventListener('touchstart', () => {
    //     wrapper.classList.toggle('show-tooltip');
    // });
}