import { create } from 'zustand'
import { Device, DeviceSummary, deviceService } from '../services/deviceService'

interface DevicesState {
  devices: Device[]
  summary: DeviceSummary | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchDevices: () => Promise<void>
  fetchSummary: () => Promise<void>
  addDevice: (device: Device) => void
  updateDevice: (device: Device) => void
  removeDevice: (id: string) => void
  setError: (error: string | null) => void
}

export const useDevicesStore = create<DevicesState>((set) => ({
  devices: [],
  summary: null,
  loading: false,
  error: null,

  fetchDevices: async () => {
    set({ loading: true, error: null })
    try {
      const response = await deviceService.getDevices()
      set({ devices: response.devices })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch devices'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await deviceService.getSummary()
      set({ summary })
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  },

  addDevice: (device: Device) => {
    set((state) => ({
      devices: [...state.devices, device],
    }))
  },

  updateDevice: (device: Device) => {
    set((state) => ({
      devices: state.devices.map((d) => (d.id === device.id ? device : d)),
    }))
  },

  removeDevice: (id: string) => {
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    }))
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))
