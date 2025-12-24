let currentConfirm = null;

export function confirmRedeem() {
  return new Promise((resolve, reject) => {
    const tpl = document.getElementById('tpl-confirm-redeem');
    if (!tpl) throw new Error('tpl-confirm-redeem no cargado');

    const node = tpl.content.cloneNode(true);
    const root = node.querySelector('.modal-root');

    const btnOk = root.querySelector('[data-confirm]');
    const btnCancel = root.querySelector('[data-cancel]');
    const backdrop = root.querySelector('.modal-backdrop');

    function close(confirmed) {
      root.remove();
      confirmed ? resolve(true) : reject();
    }

    btnOk.onclick = () => close(true);
    btnCancel.onclick = () => close(false);
    backdrop.onclick = () => close(false);

    document.body.appendChild(root);
  });
}
