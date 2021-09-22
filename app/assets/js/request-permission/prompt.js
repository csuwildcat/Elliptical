import {UUID} from '/js/modules/uuid.js';
import {DID} from '/js/modules/did.js';
import {DOM} from '/js/modules/dom.js';
import {RenderList} from '/js/compiled/web-components.js';


create_pairwise_did.addEventListener('pointerup', async e => {
  let methods = invocationData?.options?.methods || ['ion'];
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