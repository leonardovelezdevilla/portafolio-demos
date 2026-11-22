// En celular «Qué hacer mientras llegas» queda plegado; en pantallas anchas (y sin JS) ya viene abierto en el HTML, sin saltos.
const d = document.querySelector<HTMLDetailsElement>('[data-abierto-escritorio]');
if (d && !window.matchMedia('(min-width: 900px)').matches) d.open = false;
