import EventEmitter from "events"
import { proxy } from "valtio"
import { WebSocket as WebSocketInNode } from "ws"

export type GameStateType = {
  countA: number;
  countB: number;
}

export function getNewState() {
  const state = proxy<GameStateType>({
    countA: 0,
    countB: 0,
  })

  return state
}

export type OnMessageInClient = (id: number, value: any, ws: WebSocket | WebSocket) => void;
export type OnMessageInServer = (id: number, value: any, ws: WebSocket | WebSocketInNode) => void;

export class MessageEmitter extends EventEmitter {
  isInvalidMessage: boolean

  constructor() {
    super()

    this.isInvalidMessage = false
  }

  emit(eventName : string | symbol, ...args: any[]): boolean {
    if (eventName === "message") {
      this.isInvalidMessage = true

      const result = super.emit(eventName, ...args)

      if (this.isInvalidMessage)
        console.log(`Received invalid message. id: ${args[0]}, value: ${args[1]}`)

      return result
    } else
      return super.emit(eventName, ...args)
  }
}

export const FROM_SERVER_STATE = 0
export const FROM_SERVER_STATE_OPS = 1
export const FROM_SERVER_CANCEL = 2
export const FROM_CLIENT_COUNT_UP_A = 3
export const FROM_CLIENT_COUNT_UP_B = 4
