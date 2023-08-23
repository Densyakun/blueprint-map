#!/usr/bin/env node

const WebSocket = require('ws')
const createServer = require('http').createServer
const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection

const YjsClient = require('../lib/yjsClient.js')

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 1234

const server = createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', (conn, req, opts) => {
  setupWSConnection(conn, req, opts)

  conn.on('message', message => {
    console.log(`message: ${message}`)

    /*wss.clients.forEach(client => {
        client.send(message)
    })*/
  })

  conn.on('close', () => {
    console.log('close')
  })
})

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  // See https://github.com/websockets/ws#client-authentication
  /**
   * @param {any} ws
   */
  const handleAuth = ws => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`)
})

function setupAntiCheatClient() {
  const yjsClient = new YjsClient()

  /*yjsClient.wsProvider.on('sync', (isSynced: boolean) => {
    if (isSynced) {
      ++state.count
    }
  })*/
}
setupAntiCheatClient()
