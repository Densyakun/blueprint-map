const Y = require("yjs");
const WebsocketProvider = require("y-websocket").WebsocketProvider;
const bind = require("valtio-yjs").bind;
const proxy = require("valtio").proxy;

class YjsClient {
  constructor() {
    this.doc = new Y.Doc();

    this.state = proxy({
      count: 0,
    });

    this.ymap = this.doc.getMap("mymap");

    bind(this.state, this.ymap);

    if (typeof window === "undefined") {
      this.wsProvider = new WebsocketProvider(`wss://localhost:1234`, 'my-roomname', this.doc, { WebSocketPolyfill: require('ws') });
    } else {
      this.wsProvider = new WebsocketProvider(`wss://${location.hostname}:1234`, 'my-roomname', this.doc);
    }
  }
}

module.exports = YjsClient