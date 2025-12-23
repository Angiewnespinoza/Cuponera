const loaded = new Set();

export async function loadTemplate(path) {
  if (document.querySelector(`template[data-src="${path}"]`)) return;

  const res = await fetch(path);
  const html = await res.text();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  wrapper.querySelectorAll('template').forEach(t => {
    t.dataset.src = path;
    document.body.appendChild(t);
  });
}


export function cloneTemplate(id) {
  const tpl = document.getElementById(id);
  if (!tpl) throw new Error(`Template ${id} no encontrado`);
  return tpl.content.cloneNode(true);
}
