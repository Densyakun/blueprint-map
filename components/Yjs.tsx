'use client';

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { bind } from "valtio-yjs";
import { proxy } from "valtio";

const doc = new Y.Doc();

export const state = proxy({
  count: 0,
});

export let wsProvider: WebsocketProvider;

export default function YjsComponent() {
  if (typeof window === "undefined") {
    return;
  }

  wsProvider = new WebsocketProvider(`wss://${location.hostname}:1234`, 'my-roomname', doc);

  wsProvider.on('sync', (isSynced: boolean) => {
    if (isSynced) {
      ++state.count;
    }
  });

  const ymap = doc.getMap("mymap");

  bind(state, ymap);

  return null;
}