import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'

interface UseSignalROptions {
  url: string
  hubName: string
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
}

export function useSignalR({
  url,
  hubName,
  onConnected,
  onDisconnected,
  onError,
}: UseSignalROptions) {
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build()

    connectionRef.current = connection

    connection.on('connect', () => {
      console.log('SignalR connected')
      onConnected?.()
    })

    connection.onreconnected(() => {
      console.log('SignalR reconnected')
      onConnected?.()
    })

    connection.onclose(() => {
      console.log('SignalR disconnected')
      onDisconnected?.()
    })

    connection.on('error', (error: Error) => {
      console.error('SignalR error:', error)
      onError?.(error)
    })

    connection.start().catch((err: unknown) => {
      console.error('SignalR connection failed:', err)
      const error = err instanceof Error ? err : new Error(String(err))
      onError?.(error)
    })

    return () => {
      connection.stop()
    }
  }, [url, hubName, onConnected, onDisconnected, onError])

  return connectionRef.current
}
