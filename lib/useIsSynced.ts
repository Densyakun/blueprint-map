import { isSynced, socket } from "@/components/Client"
import { useEffect, useState } from "react"

export default function useIsSynced() {
  const [isSyncedState, setIsSynced] = useState(isSynced)

  useEffect(() => {
    if (!socket) return

    socket.addEventListener("message", () =>
      setIsSynced(isSynced)
    )
    socket.addEventListener("close", () =>
      setIsSynced(isSynced)
    )
  }, [socket])

  return isSyncedState
}