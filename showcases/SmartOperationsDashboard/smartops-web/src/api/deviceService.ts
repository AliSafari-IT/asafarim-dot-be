import { API_BASE_URL } from './config'

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

export interface CreateDeviceRequest {
  name: string
  serialNumber: string
  location: string
  description?: string
}

export interface UpdateDeviceRequest {
  name?: string
  location?: string
  description?: string
  status?: string
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

  async createDevice(data: CreateDeviceRequest): Promise<Device> {
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

  async updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device> {
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
}

export const deviceService = new DeviceService()
