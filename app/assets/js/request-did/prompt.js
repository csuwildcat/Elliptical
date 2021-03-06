
import {UUID} from '/assets/js/modules/uuid.js';
import {DID} from '/assets/js/modules/did.js';
import {DOM} from '/assets/js/modules/dom.js';
import {RenderList} from '/assets/js/compiled/web-components.js';


create_pairwise_button.addEventListener('pointerup', async e => {
  let methods = invocationData?.methods || ['ion'];
  let peer = await DID.createPeerDID(invocationData.origin, { method: methods.includes('ion') ? 'ion' : 'key' });
  let nonce = UUID.v4();
  window.returnValue = {
    did: peer.did,
    nonce: nonce,
    signature: await DID.sign(peer.did, invocationData.challenge + nonce)
  }
  window.close();
});

block_did_requests.addEventListener('click', async e => {
  // DID.updateConnection(config.uri, {
  //   permissions: {
  //     did_request: false
  //   }
  // });
});