
import {UUID} from '/js/modules/uuid.js';
import {DID} from '/js/modules/did.js';
import {DOM} from '/js/modules/dom.js';
import {RenderList} from '/js/compiled/web-components.js';


create_pairwise_did.addEventListener('pointerup', async e => {
  let peer = await DID.createPeerDID(popupSettings.origin, { method: 'key' });
  console.log(peer);
 // let nonce = UUID.generate();
  window.returnValue = peer.did;
  window.close();
  // {
  //   did: peer.did,
  //   nonce: nonce,
  //   signature: await DID.sign(peer.did, config.nonce + nonce)
  // }

  // let response = {
  //   type: 'did_response',
  //   to: 'content',
  //   props: {
  //     did: peer.did,
  //     nonce: nonce,
  //     signature: await DID.sign(peer.did, config.nonce + nonce)
  //   },
  //   error: error => {
  //     console.log(error);
  //     reject(error);
  //   }
  // };
});

block_did_requests.addEventListener('click', async e => {
  // DID.updateConnection(config.uri, {
  //   permissions: {
  //     did_request: false
  //   }
  // });
});