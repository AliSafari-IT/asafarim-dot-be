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
      .withAutomaticReconnect([0, 0, 0, 5000, 5000, 10000])
      .withHubMethodInvocation(true)
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

    connection.start().catch((err) => {
      console.error('SignalR connection failed:', err)
      onError?.(err)
    })

    return () => {
      connection.stop()
    }
  }, [url, hubName, onConnected, onDisconnected, onError])

  return connectionRef.current
}
