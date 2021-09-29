

import './ion-tools.js';

export default {
  name: 'ion',
  async create(){

    let signing = await ION.generateKeyPair('Ed25519');
    let encryption = await ION.generateKeyPair('Ed25519');

    let did = new ION.DID({
      content: {
        publicKeys: [
          {
            id: 'sign',
            type: 'JwsVerificationKey2020',
            publicKeyJwk: signing.publicJwk,
            purposes: [ 'authentication' ]
          },
          {
            id: 'encrypt',
            type: 'JwsVerificationKey2020',
            publicKeyJwk: encryption.publicJwk,
            purposes: [ 'keyAgreement' ]
          }
        ]
      }
    });

    let longForm = await did.getURI('long');
    let shortForm = await did.getURI('short');

    return {
      id: shortForm,
      equivalentIds: [shortForm, longForm],
      keys: { signing, encryption },
      state: await did.getAllOperations()
    }
    
  },
  async resolve (did){
    return ION.resolve(did);
  }
}