'use client'

import { useSnapshot } from "valtio"
import { socket, state } from "./Client"
import { FROM_CLIENT_COUNT_UP_A, FROM_CLIENT_COUNT_UP_B } from "@/lib/game"
import useIsSynced from "@/lib/useIsSynced"

export default function Text() {
  const isSynced = useIsSynced()
  const { countA, countB } = useSnapshot(state)

  return <>
    <p>isSynced: {isSynced ? "true" : "false"}</p>
    <p>countA {">="} countB</p>
    <p>countA: {countA}</p>
    <p>countB: {countB}</p>
    <button onClick={() => {
      ++state.countA

      socket.send(JSON.stringify([FROM_CLIENT_COUNT_UP_A]))
    }}>count up A</button>
    {" "}
    <button onClick={() => {
      socket.send(JSON.stringify([FROM_CLIENT_COUNT_UP_B]))
    }}>count up B</button>
  </>
}