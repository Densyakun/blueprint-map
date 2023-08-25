import { subscribe } from 'valtio';
import { WebSocketServer } from 'ws';
import { FROM_CLIENT_COUNT_UP_A, FROM_CLIENT_COUNT_UP_B, FROM_SERVER_CANCEL, FROM_SERVER_STATE, FROM_SERVER_STATE_OPS, getNewState } from '../lib/game.js';

const host = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '8080');

const state = getNewState();

const wss = new WebSocketServer({ port, host });

const unsubscribe = subscribe(state, ops => {
  wss.clients.forEach(client => client.send(JSON.stringify([FROM_SERVER_STATE_OPS, ops])));
});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const [id, value] = JSON.parse(data.toString());

    switch (id) {
      case FROM_CLIENT_COUNT_UP_A:
        ++state.countA;
        break;
      case FROM_CLIENT_COUNT_UP_B:
        if (state.countB < state.countA)
          ++state.countB;
        else
          ws.send(JSON.stringify([FROM_SERVER_CANCEL]));
        break;
      default:
        console.log(`received, id: ${id}, value: ${value}`);
        break;
    }
  });

  ws.send(JSON.stringify([FROM_SERVER_STATE, state]));
});

wss.on('close', () => {
  unsubscribe();
});