
import {UUID} from './uuid.js';
import {Natives} from './natives.js';
import { Storage } from './storage.js';
import CryptoUtils from './crypto-utils.js';
import DIDKey from '../did-methods/key/index.js';
import '../did-methods/ion/ion-tools.js';
import '../secp256k1.js';

let PeerModel = {
  permissions: {}
};
let createConnection = (uri, options) => {
  let entry = JSON.parse(JSON.stringify(PeerModel));
  entry.id = uri;
  return entry;
}

var testKey = {
  "kty": "EC",
  "crv": "P-256",
  "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
  "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
  "d": "jpsQnnGQmL-YBIffH1136cspYG6-0iY7X1fCE9-E9LI"
}

const jwsHeader = {
  alg: 'EdDSA',
  typ: 'JWT'
};

let DID = {
  async create (method = 'ion', options = {}){
    let module = (await import(`../did-methods/${method}/index.js`)).default;
    console.log(module);
    let did = await module.create();
    await Storage.set('dids', did);
    return did;
  },
  async createPersona(persona = {}){
    let did = await this.create();
    persona.id = did.id;
    return Storage.set('personas', persona);
  },
  async createPeerDID (uri, options = {}){
    let entry = await Storage.get('connections', uri) || createConnection(uri);
    if (entry.did) {
      return entry;
    }
    entry.did = (await this.create(options.method)).id;
    await Storage.set('connections', entry);
    return entry;
  },
  async get(didUri){
    return Storage.get('dids', didUri);
  },
  async getConnection (uri, options = {}){
    return await Storage.get('connections', uri);
  },
  async setConnection (obj){
    await Storage.set('connections', obj);
  },
  async updateConnection (uri, obj){
    return await Storage.modify('connections', uri, (entry, exists) => {
      Natives.merge(entry, exists ? entry : createConnection(uri), obj);
    });
  },
  async resolve(did){
    return fetch('https://resolver.identity.foundation/1.0/identifiers/' + did).then(res => res.json());
  },
  async sign(didUri, message, decode){
    let did = await this.get(didUri);
    switch (did.curve) {
      case 'Ed25519':
        let utils = await CryptoUtils;
        let _message = Uint8Array.from(decode ? utils.base58.decode(message) : message);
        let sig = utils.nacl.sign.detached(_message, utils.base58.decode(did.keys.private));
        return utils.base58.encode(sig);
      case 'ES256':
        let crypt = new Jose.WebCryptographer();
        crypt.setContentSignAlgorithm("ES256");
        var signer = new Jose.JoseJWS.Signer(crypt);
        return await signer.addSigner(testKey).then(async () => await signer.sign(message, null, {}));
    }
  },
  async verify(publicKey, message, signature){
    //let did = this.resolve(didUri);
    // switch (did.curve) {
    //   case 'Ed25519':
        let utils = await CryptoUtils;

        console.log()
        return utils.nacl.sign.detached.verify(
          utils.base58.decode(message),
          utils.base58.decode(signature),
          utils.base58.decode(publicKey)
        );
    //   case 'P-256':         
    //     let crypt = new Jose.WebCryptographer();
    //     crypt.setContentSignAlgorithm("ES256");
    //     var signer = new Jose.JoseJWS.Signer(crypt);
    //     return await signer.addSigner(testKey).then(async () => await signer.sign(message, null, {}));
    // }
  }
}

export { DID };