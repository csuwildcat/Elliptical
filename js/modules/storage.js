
import { Natives } from '/js/modules/natives.js';
import Dexie from '/js/modules/dexie.js';

const db = new Dexie('DIDWebExtension');

db.version(1).stores({
  dids: 'id',
  personas: 'id',
  connections: 'id,did',
  data: 'id,type,origin',
  apps: 'id'
});

var Storage = {
  db: db,
  query (store, keys){
    return db[store].where(keys);
  },
  get (store, id){
    return db[store].get(id);
  },
  getAll (store){
    return db[store].toArray();
  },
  set (store, obj, id){
    return db[store].put(obj, id);
  },
  spray (store, objects){
    return db[store].bulkPut(objects);
  },
  remove (store, id){
    return db[store].delete(id);
  },
  clear (store) {
    return db[store].clear();
  },
  async modify (store, id, fn){
    return this.get(store, id).then(async entry => {
      let obj = entry || {};
      let result = await fn(obj, !!entry) || obj;
      return this.set(store, result);
    })
  },
  async merge (store, id, changes){
    return this.get(store, id).then((entry = {}) => {
      return this.set(store, id, Natives.merge(entry, changes));
    })
  }
}

export { Storage };