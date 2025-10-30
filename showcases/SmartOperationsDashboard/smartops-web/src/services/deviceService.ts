import { API_BASE_URL } from '../api/config'

export interface Device {
  id: string
  name: string
  serialNumber: string
  location: string
  status: 'Offline' | 'Online' | 'Idle' | 'Running' | 'Error' | 'Maintenance'
  description?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Reading {
  id: string
  deviceId: string
  temperature: number
  humidity: number
  pressure: number
  powerConsumption: number
  operationCount: number
  recordedAt: string
}

export interface DeviceSummary {
  totalDevices: number
  activeDevices: number
  offlineDevices: number
  recentReadings: Reading[]
}

export interface DeviceFilter {
  status?: string
  location?: string
  page?: number
  pageSize?: number
}

export interface DeviceListResponse {
  devices: Device[]
  total: number
  page: number
  pageSize: number
}

class DeviceService {
  private baseUrl = `${API_BASE_URL}/devices`

  async getDevices(filter?: DeviceFilter): Promise<DeviceListResponse> {
    const params = new URLSearchParams()
    if (filter?.status) params.append('status', filter.status)
    if (filter?.location) params.append('location', filter.location)
    if (filter?.page) params.append('page', filter.page.toString())
    if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString())

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.statusText}`)
    }

    return response.json()
  }

  async getDevice(id: string): Promise<Device> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch device: ${response.statusText}`)
    }

    return response.json()
  }

  async getSummary(): Promise<DeviceSummary> {
    const response = await fetch(`${API_BASE_URL}/devices/summary`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch summary: ${response.statusText}`)
    }

    return response.json()
  }

  async createDevice(data: Omit<Device, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Device> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create device: ${response.statusText}`)
    }

    return response.json()
  }

  async updateDevice(id: string, data: Partial<Omit<Device, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>): Promise<Device> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update device: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteDevice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete device: ${response.statusText}`)
    }
  }

  async archiveDevice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/archive`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to archive device: ${response.statusText}`)
    }
  }


  async unarchiveDevice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/unarchive`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to unarchive device: ${response.statusText}`)
    }
  }

  async getDevicesByUserId(userId: string): Promise<Device[]> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch devices by user ID: ${response.statusText}`)
    }

    return response.json()
  }

  async getDevicesByArchived(userId: string): Promise<Device[]> {
    const response = await fetch(`${this.baseUrl}/user/${userId}/archived`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch devices by user ID: ${response.statusText}`)
    }

    return response.json()
  }

  // getReadings
  async getReadings(deviceId: string): Promise<Reading[]> {
    const response = await fetch(`${this.baseUrl}/${deviceId}/readings`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch readings for device ID: ${response.statusText}`)
    }

    return response.json()
  }

  async createReading(deviceId: string, reading: Reading): Promise<Reading> {
    const response = await fetch(`${this.baseUrl}/${deviceId}/readings`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    })

    if (!response.ok) {
      throw new Error(`Failed to create reading for device ID: ${response.statusText}`)
    }

    return response.json()
  }

  async updateReading(deviceId: string, readingId: string, reading: Reading): Promise<Reading> {
    const response = await fetch(`${this.baseUrl}/${deviceId}/readings/${readingId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading),
    })

    if (!response.ok) {
      throw new Error(`Failed to update reading for device ID: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteReading(deviceId: string, readingId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${deviceId}/readings/${readingId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete reading for device ID: ${response.statusText}`)
    }
  }

  async getAllReadings(startDate?: Date, endDate?: Date): Promise<Reading[]> {
    const readingsUrl = `${API_BASE_URL}/readings`
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    const url = params.toString() ? `${readingsUrl}?${params}` : readingsUrl
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch readings: ${response.statusText}`)
    }
    const data = await response.json()
    console.log(data.readings)
    return data.readings || []
  }
}

export const deviceService = new DeviceService()
