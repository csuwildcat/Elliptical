
export default Promise.all([
  import('./did-key/utils/ipfs.js'),
  import('./did-key/utils/nacl.js'),
  import('./did-key/utils/base58.js')
]).then(modules => {
  return {
    ipfs: globalThis.Ipfs,
    nacl: globalThis.nacl,
    base58: {
      encode: globalThis.base58,
      decode: globalThis.base58.decode
    }
  }
});