(function(){

  let isPage = self === top;
  let isFrame = !isPage && top === parent;

  globalThis.ProtocolChannel = class ProtocolChannel {
    constructor(protocol, options = {}){
      this.options = options;
      this.blocked = {};
      this.transactions = {};
      this.activeTopics = {};
      this.protocol = protocol + ':';
      this.referrer = document.referrer;
      this.onMessage = options.onMessage;   
      if (options.block) this.blockOrigins(options.block);
      this.connect = new Promise((resolve, reject) => {
        if (isPage) {
          let frame = this.frame = document.createElement('iframe');
              frame.style.display = 'none';
              frame.src = this.protocol;
              frame.addEventListener('load', e => {
                resolve(this.frame.contentWindow);
              }, { once: true });
          addEventListener('message', e => {
            if (e.source === frame.contentWindow) {
              this.handleMessage(e);
            }
          })
          document.documentElement.prepend(frame);
        }
        else if (isFrame) {
          addEventListener('message', e => {
            if (e.source === top || e.origin === this.referrer || !this.blocked[e.origin]) {
              this.handleMessage(e);
            }
          });
          resolve(top, document.referrer);
        }
      });
    }
    sendMessage(topic, payload, options = {}){
      if (typeof topic === 'object') {
        return this.connect.then((target, origin = '*') => target.postMessage(topic, origin));
      }
      return new Promise((resolve, reject) => {
        this.connect.then((target, origin = '*') => {
          let id = crypto.getRandomValues(new Uint8Array(16)).join('');
          this.transactions[id] = {
            topic: topic,
            payload: payload,
            resolve: resolve,
            reject: reject
          }
          target.postMessage({ id: id, topic: topic, payload: payload }, origin);
        })
      })
    }
    async handleMessage(e){
      let message = e.data;
      let topic = message.topic;
      let txn = this.transactions[message.id];
      if (txn) {
        delete this.transactions[message.id];
        if ('response' in message) txn.resolve(message.response);
        else txn.reject(message.error);
      }
      else {
        if (isFrame && this.activeTopics[topic] && this.options?.topics?.[topic]?.serial){
          this.sendError('SerialRequestBlocked: there is already an active request for this serial message type.');
          return;
        }
        if (navigator.did.protocolHandler) {
          this.activeTopics[topic] = true;
          await navigator.did.protocolHandler(this, topic, message.payload, e.origin).then(response => {
            delete this.activeTopics[topic];
            message.response = response;
            this.sendMessage(message);
          }).catch(error => {
            delete this.activeTopics[topic];
            message.error = error;
            this.sendMessage(message);
          })
        }
        else {
          this.sendError('NoResponse: the handler did not respond to this request.');
        }
      }
    }
    blockOrigins(origins){
      origins.forEach(origin => this.blocked[origin] = true)
    }
    unblockOrigins(origins){
      origins.forEach(origin => delete this.blocked[origin])
    }
  }
})();

(function(){

  let isPage = self === top;
  let isFrame = !isPage && top === parent;

  let channel;
  function getChannel(){
    return channel || (channel = new ProtocolChannel('web+did', {
      topics: {
        requestDID: {
          serial: true
        }
      }
    }));
  }

  if (isPage) {

    Navigator.prototype.did = {
      requestDID: async function(methods){
        return getChannel().sendMessage('requestDID', { methods: methods });
      },
      requestData: async function(definition){
        return getChannel().sendMessage('requestData', definition);
      },
      requestPermission: async function(permissions){
        return getChannel().sendMessage('requestPermission', permissions);
      },
      storeData: async function(data){
        return getChannel().sendMessage('storeData', data);
      }
    }
  
  }
  else if (isFrame) {
    
    let channel = getChannel();
    Navigator.prototype.did = {};
  
  }
      
})()