
// delegateEvent('pointerup', '[view-action="close"]', e => {
//   console.log(e.path);
//   EXT.sendMessage({
//     type: 'sidebar_close',
//     to: 'content',
//     callback: response => {
      
//     },
//     error: error => {
//       console.log(error)
//     }
//   });
// });

import { DID } from '/assets/js/modules/did.js';
import { DOM } from '/assets/js/modules/dom.js';
import { Storage } from '/assets/js/modules/storage.js';
import { Router } from '/assets/js/modules/router.js';
import { PersonaIcons } from '/assets/js/modules/persona-icons.js';
import { NoticeBar, RenderList } from '/assets/js/compiled/web-components.js';

globalThis.extensionStorage = Storage;

function clearPersonaCreateForm() {
  let selectedIcon = persona_create_icons.querySelector('input:checked');
  if (selectedIcon) selectedIcon.checked = false;
  persona_create_name.value = null;
}

function getPersonaCreateValues() {
  return {
    name: persona_create_name.value,
    icon: persona_create_icons.querySelector('input:checked').nextElementSibling.className
  }
}
                            
DOM.delegateEvent('keypress', '.global-search', e => {
  if (e.key === 'Enter') {
    global_search_query.textContent = e.target.value;
    if(content_panels.active !== 'global_search') {
      Router.modifyState({
        event: e,
        params: { view: 'global_search' }
      });
    }
  }
});

DOM.delegateEvent('pointerup', '[modal="create-persona"]', e => {
  persona_create_modal.open();
});

persona_create_form.addEventListener('submit', async (e) => {
  e.preventDefault(e);
  let persona = getPersonaCreateValues();
  DID.createPersona(persona).then(z => {   
    persona_did_list.add(persona);
    persona_create_modal.close();
    new NoticeBar({
      type: 'success',
      title: 'Your new Persona has been created!'
    }).notify();
  })
});

persona_create_modal.addEventListener('modalclosed', e => {
  clearPersonaCreateForm();
});

DOM.delegateEvent('pointerup', '[persona-id]', (e, node) => {
  let did = node.getAttribute('persona-id');
  if (!did) return;
  did_viewer.setAttribute('did', did);
  did_viewer.setAttribute('persona', node.getAttribute('persona-name'));
  did_viewer.open();
});

did_viewer.addEventListener('modalopen', function(e) {
  let did = this.getAttribute('did');
  //if (!did) this.close();
  this.innerHTML = `
    <article>
      <header>
        <h3>${this.getAttribute('persona') || did}</h3><span modal-close=""></span>
      </header>

      <section>
        <did-viewer did="${did}"></did-viewer>
      </section>

      <footer>
        <button type="button" modal-close="">Cancel</button>
      </footer>
    </article>
  `;
});

export async function initialize(){
  const iconInput = '<input type="radio" name="icon"/>';
  persona_create_icons.innerHTML = `<label>${iconInput}<i class="${PersonaIcons.join(` fa-fw"></i></label><label>${iconInput}<i class="`)}"></label>`;  
}

export function render(){

};