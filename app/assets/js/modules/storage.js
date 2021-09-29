
import { Natives } from './natives.js';
import "./nano-sql.js";

const nano = nSQL;
const dbName = '_elliptical_';
const ready = nano().createDatabase({
  id: dbName,
  mode: 'PERM',
  tables: [
    {
      name: 'dids',
      model: {
        "id:string": { pk: true, immutable: true },
        'equivalentIds:array': {},
        'keys:object': {},
        'state:any': {},
        'persona:string': {},
        'icon:string': {}
      },
      indexes: {
        'persona:string': { unique: true }
      }
    },
    {
      name: 'connections',
      model: {
        "id:string": { pk: true, immutable: true },
        "did:string": {},
      }
    },
    {
      name: 'data',
      model: {
        "id:string": { pk: true, immutable: true },
        "type:string": { immutable: true },
        "origin:string": { immutable: true }
      }
    },
    {
      name: 'apps',
      model: {
        "id:string": { pk: true, immutable: true }
      }
    }
  ]
}) 


var Storage = {
  // spray (store, objects){
  //   return db[store].bulkPut(objects);
  // },
  // remove (store, id){
  //   return db[store].delete(id);
  // },
  // clear (store) {
  //   return db[store].clear();
  // },
  // async modify (store, id, fn){
  //   return this.get(store, id).then(async entry => {
  //     let obj = entry || {};
  //     let result = await fn(obj, !!entry) || obj;
  //     return this.set(store, result);
  //   })
  // },
  // async merge (store, id, changes){
  //   return this.get(store, id).then((entry = {}) => {
  //     return this.set(store, id, Natives.merge(entry, changes));
  //   })
  // },

  async txn(fn){
    return ready.then(async () => {
      await nano().useDatabase(dbName);
      return fn(nano);
    });
  },

  async get (table, id){
    return this.txn(db => db(table).query('select').where([
      'id', '=', id
    ]).exec())
    .then(rows => rows[0])
    .catch(e => console.log(e));
  },

  async getAll (table){
    return this.txn(db => db(table).query('select').exec()).catch(e => console.log(e));
  },

  async set (table, entries){
    console.log(entries);
    return this.txn(db => db(table).query('upsert', entries).exec()).catch(e => console.log(e));
  },

  async modify (store, id, fn){
    return this.get(store, id).then(async entry => {
      let obj = entry || {};
      let result = await fn(obj, !!entry) || obj;
      return this.set(store, result);
    })
  },

  async find (table, filter){
    return this.txn(db => db(table).query('select').where(filter).exec()).catch(e => console.log(e));
  },

  async getStackFromIndex (id){
    return this.txn(db => db(table).query('select').where([
      'order', '>', id
    ]).exec()).catch(e => console.log(e))
  },

  async getBySchema(table, schema){
    return this.txn(db => db(table).query('select').where([
      'schema', '=', schema.trim()
    ]).exec()).catch(e => console.log(e))
  },

  async remove (table, id){
    return this.txn(db => db(table).query('delete').where([
      'id', '=', id
    ]).exec()).catch(e => console.log(e));
  },

  async clear (table) {
    this.txn(db => {
    return table ? 
      db(table).query('delete').exec().catch(e => console.log(e)) : 
      Promise.all(this.tables.map(table => db(table).query('delete').exec())).catch(e => console.log(e))
    });
  }
}

export { Storage };