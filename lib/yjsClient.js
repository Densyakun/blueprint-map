const Y = require("yjs");
const WebsocketProvider = require("y-websocket").WebsocketProvider;
const bind = require("valtio-yjs").bind;

class YjsClient {
  constructor(state, wsOpts) {
    this.doc = new Y.Doc();

    this.ymap = this.doc.getMap("mymap");

    bind(state, this.ymap);

    if (typeof window === "undefined") {
      this.wsProvider = new WebsocketProvider(`wss://localhost:1234`, 'my-roomname', this.doc, { WebSocketPolyfill: require('ws'), ...wsOpts });
    } else {
      this.wsProvider = new WebsocketProvider(`wss://${location.hostname}:1234`, 'my-roomname', this.doc, wsOpts);
    }
  }
}

module.exports = YjsClient