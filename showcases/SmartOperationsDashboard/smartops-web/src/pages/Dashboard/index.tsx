import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDevicesStore } from '../../hooks/useDevicesStore'
import { deviceService, DeviceSummary } from '../../services/deviceService'
import './Dashboard.css'

interface ChartData {
  name: string
  temperature?: number
  humidity?: number
  powerConsumption?: number
  devices?: number
}

export default function Dashboard() {
  const { summary, fetchSummary } = useDevicesStore()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await fetchSummary()
        
        // Generate mock chart data based on recent readings
        // In production, this would come from the backend
        const mockData: ChartData[] = [
          { name: '00:00', temperature: 22.5, humidity: 45, powerConsumption: 12.5 },
          { name: '04:00', temperature: 21.8, humidity: 48, powerConsumption: 11.2 },
          { name: '08:00', temperature: 23.1, humidity: 42, powerConsumption: 14.8 },
          { name: '12:00', temperature: 24.5, humidity: 40, powerConsumption: 18.5 },
          { name: '16:00', temperature: 23.8, humidity: 43, powerConsumption: 16.2 },
          { name: '20:00', temperature: 22.3, humidity: 46, powerConsumption: 13.5 },
        ]
        setChartData(mockData)
        setError(null)
      } catch (err) {
        let message = 'Failed to load dashboard'
        if (err instanceof Error) {
          if (err.message.includes('401')) {
            message = '🔐 Your session has expired. Please log in again.'
          } else if (err.message.includes('403')) {
            message = '🔒 You don\'t have permission to view the dashboard.'
          } else if (err.message.includes('Network')) {
            message = '🌐 Network error. Please check your connection.'
          } else {
            message = `❌ ${err.message}`
          }
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchSummary])

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Real-time device monitoring and analytics</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Devices</div>
          <div className="metric-value">{summary?.totalDevices || 0}</div>
          <div className="metric-description">All registered devices</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active Devices</div>
          <div className="metric-value active">{summary?.activeDevices || 0}</div>
          <div className="metric-description">Currently online</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Offline Devices</div>
          <div className="metric-value offline">{summary?.offlineDevices || 0}</div>
          <div className="metric-description">Not responding</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Recent Readings</div>
          <div className="metric-value">{summary?.recentReadings?.length || 0}</div>
          <div className="metric-description">Last 24 hours</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        {/* Temperature & Humidity Chart */}
        <div className="chart-card">
          <h2>Temperature & Humidity Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'var(--color-text)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#ef4444" 
                name="Temperature (°C)"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#3b82f6" 
                name="Humidity (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Power Consumption Chart */}
        <div className="chart-card">
          <h2>Power Consumption</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'var(--color-text)' }}
              />
              <Legend />
              <Bar 
                dataKey="powerConsumption" 
                fill="#10b981" 
                name="Power (kW)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {summary?.recentReadings && summary.recentReadings.length > 0 ? (
            summary.recentReadings.slice(0, 5).map((reading) => (
              <div key={reading.id} className="activity-item">
                <div className="activity-time">
                  {new Date(reading.recordedAt).toLocaleTimeString()}
                </div>
                <div className="activity-details">
                  <div className="activity-title">Device Reading</div>
                  <div className="activity-description">
                    Temp: {reading.temperature}°C | Humidity: {reading.humidity}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No recent readings available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
