
import { Router } from '/js/modules/router.js';
import { DOM } from '/js/modules/dom.js';

// import '/js/transmute-keys.js';

var panels = {
  personas: false,
  connections: false,
  data: false,
  sign_verify: false,
};
async function initializePanel(panel){
  if (panels[panel] === false) {
    let module = panels[panel] = await import(`/js/dashboard/panels/${panel}.js`);
    if (module.initialize) await module.initialize();
  }
}

var scrollPositions = {};

Router.filters = [
  {
    path: '/dashboard',
    params: ['view'],
    async listener(state, oldState){
      let lastView = oldState.params.view || 'personas';
      let currentView = state.params.view || 'personas';
      await initializePanel(currentView);
      console.log(currentView);
      content_panels.open(currentView);
    }
  }
];

Router.setState(location);

window.addEventListener('routechange', e => {
  if (overlay_panels) overlay_panels.close();
});

nav_toggle.addEventListener('pointerup', e => {
  overlay_panels.open('nav');
});

DOM.delegateEvent('click', '.install-handler', e => {
  console.log(e);
  navigator.registerProtocolHandler('did', location.origin + '/did-connect/?params=%s', 'Carbon - DID Wallet');
})
