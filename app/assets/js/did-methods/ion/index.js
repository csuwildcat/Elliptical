

import './ion-tools.js';

export default {
  name: 'ion',
  async create(){
    let did = new ION.DID();
    let longForm = await did.getURI('long');
    let shortForm = await did.getURI('short');
    return {
      id: shortForm,
      resolvableId: longForm,
      equivalentIds: [shortForm, longForm],
      state: await did.getAllOperations()
    }
  },
  async resolve (did){
    return ION.resolve(did);
  }
}