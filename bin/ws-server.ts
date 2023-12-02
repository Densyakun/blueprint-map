import { subscribe } from 'valtio';
import { WebSocketServer } from 'ws';
import { FROM_CLIENT_COUNT_UP_A, FROM_CLIENT_COUNT_UP_B, FROM_CLIENT_GET_TERRAIN, FROM_SERVER_CANCEL, FROM_SERVER_SEND_TERRAIN, FROM_SERVER_STATE, FROM_SERVER_STATE_OPS, MessageEmitter, OnMessageInServer, getNewState } from '../lib/game.js';
import { fetchHeightmap } from '../lib/terrain.js';

const host = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '8080');

const gameState = getNewState();
let messageEmitter = new MessageEmitter();

const wss = new WebSocketServer({ port, host });

const unsubscribe = subscribe(gameState, ops => {
  wss.clients.forEach(client => client.send(JSON.stringify([FROM_SERVER_STATE_OPS, ops])));
});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const [id, value] = JSON.parse(data.toString());

    messageEmitter.emit("message", id, value, ws);
  });

  ws.send(JSON.stringify([FROM_SERVER_STATE, gameState]));
});

const onMessage: OnMessageInServer = (id, value, ws) => {
  switch (id) {
    case FROM_CLIENT_COUNT_UP_A:
      ++gameState.countA;

      messageEmitter.isInvalidMessage = false;
      break;
    case FROM_CLIENT_COUNT_UP_B:
      if (gameState.countB < gameState.countA)
        ++gameState.countB;
      else
        ws.send(JSON.stringify([FROM_SERVER_CANCEL]));

      messageEmitter.isInvalidMessage = false;
      break;
    case FROM_CLIENT_GET_TERRAIN:
      const [tileX, tileY] = value;

      fetchHeightmap(tileX, tileY)
        .then(heightmap => {
          ws.send(JSON.stringify([FROM_SERVER_SEND_TERRAIN, [tileX, tileY, heightmap]]));
        });

      messageEmitter.isInvalidMessage = false;
      break;
    default:
      break;
  }
};

messageEmitter.on('message', onMessage);

wss.on('close', () => {
  unsubscribe();
  messageEmitter.off('message', onMessage);
});