import { proxy } from "valtio"

export function getNewState() {
  const state = proxy({
    countA: 0,
    countB: 0,
  })

  return state
}

export const FROM_SERVER_STATE = 0
export const FROM_SERVER_STATE_OPS = 1
export const FROM_SERVER_CANCEL = 2
export const FROM_CLIENT_COUNT_UP_A = 3
export const FROM_CLIENT_COUNT_UP_B = 4
