
import '/assets/js/modules/dom.js';

var DIDViewer = globalThis.ModalOverlay = class DIDViewer extends HTMLElement {
  static get observedAttributes() {
    return ['open'];
  }
  constructor() {
    super();

    this.innerHTML = `
      <tab-panels>
        <nav>
          <button type="button" selected>Identifiers</button>
          <button type="button">Keys</button>
          <button type="button">Service Endpoints</button>
        </nav>
        <section>Identifiers</section>
        <section>Keys</section>
        <section>Service Endpoints</section>
      </tab-panels>
    `
  }
  load (){
    
  }
  attributeChangedCallback(attr, last, current) {
    switch(attr) {
      case 'open':
        DOM.ready.then(e => {
          DOM.fireEvent(this, current !== null ? 'modalopen' : 'modalclose')
        })
    }
  }
};

customElements.define('did-viewer', DIDViewer)

export { DIDViewer };