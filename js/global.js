
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const skipFrame = fn => requestAnimationFrame(() => requestAnimationFrame(fn));

document.addEventListener('pointerdown', e => {
  e.target.setAttribute('pressed', true);
}, { passive: true });

window.addEventListener('pointerup', e => {
  $$('[pressed]').forEach(node => node.removeAttribute('pressed'));
}, { passive: true });

skipFrame(() => document.documentElement.setAttribute('ready', ''));