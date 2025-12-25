const loaded = new Set();

export async function loadTemplate(path) {
  if (document.querySelector(`template[data-src="${path}"]`)) return;
  //LOCAL
  // const res = await fetch(path);
  //PROD
  const res = await fetch('/Cuponera' + path);
  
  const html = await res.text();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  wrapper.querySelectorAll('template').forEach(t => {
    t.dataset.src = '/Cuponera' + path;
    document.body.appendChild(t);
  });
}


export function cloneTemplate(id) {
  const tpl = document.getElementById(id);
  if (!tpl) throw new Error(`Template ${id} no encontrado`);
  return tpl.content.firstElementChild.cloneNode(true);
}

export function getNodeTemplate(id){
  return document.getElementById(id).tpl.content.firstElementChild;
}
