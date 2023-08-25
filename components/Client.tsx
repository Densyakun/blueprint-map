'use client'

import { FROM_SERVER_CANCEL, FROM_SERVER_STATE, FROM_SERVER_STATE_OPS, getNewState } from "@/lib/game"
import { useEffect } from "react"
import { subscribe } from "valtio"

export const state = getNewState()

export let socket: WebSocket

export let isSynced = false

export default function Client() {
  useEffect(() => {
    const address = `wss://${location.hostname}:8080/ws`
    socket = new WebSocket(address)

    socket.addEventListener("message", (event) => {
      const [id, data] = JSON.parse(event.data)

      switch (id) {
        case FROM_SERVER_STATE:
          isSynced = true
          Object.keys(state).forEach(key => (state as any)[key] = data[key])
          break
        case FROM_SERVER_STATE_OPS:
          (data as Parameters<Parameters<typeof subscribe>[1]>[0]).forEach(op => {
            switch (op[0]) {
              case "set":
                if (op[1].length !== 1)
                  console.error(`op[1].length is ${op[1].length}`)
                else
                  (state as any)[op[1][0]] = op[2]
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
          break
        case FROM_SERVER_CANCEL:
          break
        default:
          console.log("Message from server ", event.data)
          break
      }
    })

    socket.addEventListener("close", () => {
      isSynced = false
    })
  }, [])

  return null
}