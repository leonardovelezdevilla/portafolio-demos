/** Utilidades para <dialog> modal: foco atrapado (nativo), Escape, retorno de foco y bloqueo de scroll. */

const origenes = new WeakMap<HTMLDialogElement, HTMLElement | null>();

export function abrirModal(dialogo: HTMLDialogElement, origen?: HTMLElement | null): void {
  if (dialogo.open) return;
  origenes.set(dialogo, origen ?? (document.activeElement as HTMLElement | null));
  dialogo.showModal();
  document.body.classList.add('bloqueado');
}

export function cerrarModal(dialogo: HTMLDialogElement): void {
  if (dialogo.open) dialogo.close();
}

export function iniciarModal(dialogo: HTMLDialogElement): void {
  // Clic en el fondo oscuro (el propio <dialog>) cierra.
  dialogo.addEventListener('click', (e) => {
    if (e.target === dialogo) dialogo.close();
  });
  // 'close' se dispara con Escape, con close() y con el botón cerrar.
  dialogo.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('bloqueado');
    const o = origenes.get(dialogo);
    if (o && document.contains(o) && !o.hasAttribute('hidden')) o.focus();
    origenes.delete(dialogo);
  });
}

export function cambiarOrigen(dialogo: HTMLDialogElement, origen: HTMLElement | null): void {
  origenes.set(dialogo, origen);
}
