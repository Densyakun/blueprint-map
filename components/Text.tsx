'use client'

import { useSnapshot } from "valtio"
import { socket } from "./Client"
import { FROM_CLIENT_COUNT_UP_A, FROM_CLIENT_COUNT_UP_B } from "@/lib/game"
import { clientState, gameState } from "@/lib/client"

export default function Text() {
  const { countA, countB } = useSnapshot(gameState)

  const { isSynced } = useSnapshot(clientState)

  return <>
    <p>isSynced: {isSynced ? "true" : "false"}</p>
    <p>countA {">="} countB</p>
    <p>countA: {countA}</p>
    <p>countB: {countB}</p>
    <button onClick={() => {
      ++gameState.countA

      socket.send(JSON.stringify([FROM_CLIENT_COUNT_UP_A]))
    }}>count up A</button>
    {" "}
    <button onClick={() => {
      socket.send(JSON.stringify([FROM_CLIENT_COUNT_UP_B]))
    }}>count up B</button>
  </>
}