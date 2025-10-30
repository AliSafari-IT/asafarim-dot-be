import { API_BASE_URL } from './config'

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

export interface CreateReadingRequest {
  deviceId: string
  temperature: number
  humidity: number
  pressure: number
  powerConsumption: number
  operationCount: number
}

export interface ReadingStats {
  deviceId: string
  avgTemperature: number
  avgHumidity: number
  avgPressure: number
  totalPowerConsumption: number
  totalOperations: number
  startDate: string
  endDate: string
  readingCount: number
}

export interface ReadingFilter {
  deviceId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface ReadingListResponse {
  readings: Reading[]
  total: number
  page: number
  pageSize: number
}

class ReadingService {
  private baseUrl = `${API_BASE_URL}/readings`

  async getReadings(filter?: ReadingFilter): Promise<ReadingListResponse> {
    const params = new URLSearchParams()
    if (filter?.deviceId) params.append('deviceId', filter.deviceId)
    if (filter?.startDate) params.append('startDate', filter.startDate)
    if (filter?.endDate) params.append('endDate', filter.endDate)
    if (filter?.page) params.append('page', filter.page.toString())
    if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString())

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch readings: ${response.statusText}`)
    }

    return response.json()
  }

  async getReading(id: string): Promise<Reading> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch reading: ${response.statusText}`)
    }

    return response.json()
  }

  async getLatestReading(deviceId: string): Promise<Reading> {
    const response = await fetch(`${this.baseUrl}/device/${deviceId}/latest`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch latest reading: ${response.statusText}`)
    }

    return response.json()
  }

  async createReading(data: CreateReadingRequest): Promise<Reading> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create reading: ${response.statusText}`)
    }

    return response.json()
  }

  async getStats(deviceId: string, startDate: string, endDate: string): Promise<ReadingStats> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    })

    const response = await fetch(`${this.baseUrl}/device/${deviceId}/stats?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`)
    }

    return response.json()
  }
}

export const readingService = new ReadingService()
