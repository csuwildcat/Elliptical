
import canonicalize from '/js/modules/canonical-json.js';
import { JSONPath } from '/js/modules/jsonpath.js';
import { Storage } from '/js/modules/storage.js';
import { Natives } from '/js/modules/natives.js';
import {SemanticRenderer} from '/js/modules/semantic-renderer.js';

const SHA256 =  new Hashes.SHA256;
const colonSlashReplaceRegex = /:*\/+/g;
let sheets = {};
let templates = {};
var Data = {
  getObjectId(vc){
    return vc.id && vc.id.toLowerCase();
  },
  getTypeKey(vc){
    let uri = vc.credentialSchema && vc.credentialSchema.id;
    return uri ? uri.toLowerCase().replace(colonSlashReplaceRegex, '—') : null;
  },
  validateObject(vc){
    let id = this.getObjectId(vc);
    if (!id) throw 'DataError: all objects must include an id property';
    let type = this.getTypeKey(vc);
    if (!type) throw 'DataError: all objects must include a credentialSchema type identifier';
    return true;
  },
  async storeObject(origin, vc, merge){
    let id = this.getObjectId(vc);
    if (!id) throw 'DataError: all objects must include an id property';
    let type = this.getTypeKey(vc);
    if (!type) throw 'DataError: all objects must include a credentialSchema type identifier';
    Storage.modify('data', id, (entry, exists) => {
      let current = exists ? entry : {
        id: id,
        type: type,
        origin: origin,
        data: vc
      };
      if (merge) {
        Natives.merge(current, { data: vc });
      }
      else current.data = vc;
      return current;
    })
  },
  async getObject(id){
    return Storage.get('data', id);
  },
  async getObjectsByType(type){
    return Storage.query('data', 'type').equalsIgnoreCase(type).toArray();
  },
  async getDataViewTemplate(type){ // delimiter: —
    if (typeof type === 'object') type = this.getTypeKey(type);
    if (templates[type]) return templates[type]
    else {
      let template = templates[type] = await import('/extension/app/data-viewer/templates/' + type + '/template.js')
      .then(module => module.default)
      .catch(e => {
        console.log(e);
        return e;
      });
      template.type = type;
      template.styles = '/extension/app/data-viewer/templates/' + type + '/template.css';
      return template;
    }
  },
  async renderDataView(data, view, options = {}){
    let type = this.getTypeKey(data);
    let template;
    try {
      template = await this.getDataViewTemplate(type);
      if (template.styles && globalThis.document && !options.injectStyles && !sheets[template.styles]) {
        let sheet = document.createElement('link');
        sheet.rel = 'stylesheet';
        sheet.href = template.styles;
        document.head.appendChild(sheet);
        sheets[template.styles] = true;
      }
    }
    catch (e) { return e; }
    return SemanticRenderer.render(data, template, view, options)
  }
}

export { Data }