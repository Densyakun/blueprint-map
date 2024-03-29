'use client'

import { gameState, clientState, messageEmitter } from "@/lib/client"
import { FROM_SERVER_CANCEL, FROM_SERVER_STATE, FROM_SERVER_STATE_OPS, OnMessageInClient } from "@/lib/game"
import { useEffect } from "react"
import { subscribe } from "valtio"

export let socket: WebSocket

export default function Client() {
  const onMessage: OnMessageInClient = (id, value, ws) => {
    switch (id) {
      case FROM_SERVER_STATE:
        clientState.isSynced = true
        Object.keys(gameState).forEach(key => (gameState as any)[key] = value[key])

        messageEmitter.isInvalidMessage = false
        break
      case FROM_SERVER_STATE_OPS:
        (value as Parameters<Parameters<typeof subscribe>[1]>[0]).forEach(op => {
          switch (op[0]) {
            case "set":
              if (op[1].length !== 1)
                console.error(`op[1].length is ${op[1].length}`)
              else
                (gameState as any)[op[1][0]] = op[2]
              break
            /*case "delete":
              break
            case "resolve":
              break
            case "reject":
              break*/
            default:
              console.error(`op: ${op}`)
              break
          }
        })

        messageEmitter.isInvalidMessage = false
        break
      case FROM_SERVER_CANCEL:
        messageEmitter.isInvalidMessage = false
        break
      default:
        break
    }
  }

  useEffect(() => {
    const address = `wss://${location.hostname}:8080/ws`
    socket = new WebSocket(address)

    messageEmitter.on('message', onMessage)

    socket.addEventListener("message", (event) => {
      const [id, data] = JSON.parse(event.data)

      messageEmitter.emit("message", id, data, socket)
    })

    socket.addEventListener("close", () => {
      clientState.isSynced = false
      messageEmitter.off('message', onMessage)
    })

    return () => {
      socket.close()
    }
  }, [])

  return null
}