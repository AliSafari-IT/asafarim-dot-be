import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDevicesStore } from '../../hooks/useDevicesStore'
import { deviceService, Reading } from '../../services/deviceService'
import './Dashboard.css'

interface ChartData {
  name: string
  temperature?: number
  humidity?: number
  powerConsumption?: number
  devices?: number
}

// Helper function to group readings by time intervals
function groupReadingsByTime(readings: Reading[], intervalHours: number = 6): ChartData[] {
  if (!readings || readings.length === 0) return []

  // Sort readings by time
  const sortedReadings = [...readings].sort((a, b) => 
    new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )

  // Group readings into time buckets
  const grouped = new Map<string, Reading[]>()
  
  sortedReadings.forEach(reading => {
    const date = new Date(reading.recordedAt)
    const hour = Math.floor(date.getHours() / intervalHours) * intervalHours
    const key = `${hour.toString().padStart(2, '0')}:00`
    
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(reading)
  })

  // Calculate averages for each time bucket
  const chartData: ChartData[] = []
  grouped.forEach((readings, timeKey) => {
    const avgTemp = readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length
    const avgHumidity = readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length
    const avgPower = readings.reduce((sum, r) => sum + r.powerConsumption, 0) / readings.length

    chartData.push({
      name: timeKey,
      temperature: parseFloat(avgTemp.toFixed(1)),
      humidity: parseFloat(avgHumidity.toFixed(1)),
      powerConsumption: parseFloat(avgPower.toFixed(1))
    })
  })

  return chartData.sort((a, b) => a.name.localeCompare(b.name))
}

export default function Dashboard() {
  const { summary, fetchSummary } = useDevicesStore()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Fetch summary data
      await fetchSummary()
      
      // Fetch readings for the last 24 hours
      const endDate = new Date()
      const startDate = new Date()
      startDate.setHours(startDate.getHours() - 240)
      
      const readings = await deviceService.getAllReadings(startDate, endDate)
      
      // Transform readings into chart data
      const transformedData = groupReadingsByTime(readings, 1)
      
      // If no data, use empty array (charts will show "no data" message)
      setChartData(transformedData)
      setLastRefresh(new Date())
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
      if (isManualRefresh) {
        setIsRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Initial load
  useEffect(() => {
    loadData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(false) // Auto refresh, not manual
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Listen for data seeding events from Admin panel
  useEffect(() => {
    const handleDataSeeded = () => {
      loadData(true) // Refresh immediately when data is seeded
    }

    window.addEventListener('data-seeded', handleDataSeeded)
    return () => window.removeEventListener('data-seeded', handleDataSeeded)
  }, [])

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
        <div className="header-content">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">Real-time device monitoring and analytics</p>
            <p className="last-refresh">
              Last updated: {lastRefresh.toLocaleTimeString()}
              <span className="auto-refresh-indicator">🔄 Auto-refresh (30s)</span>
            </p>
          </div>
          <button 
            className="refresh-button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            title="Refresh dashboard data"
          >
            {isRefreshing ? (
              <>
                <span className="refresh-spinner"></span>
                Refreshing...
              </>
            ) : (
              <>
                <span className="refresh-icon">🔄</span>
                Refresh Now
              </>
            )}
          </button>
        </div>
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
          {chartData.length > 0 ? (
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
          ) : (
            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p>No data available for the selected time period</p>
            </div>
          )}
        </div>

        {/* Power Consumption Chart */}
        <div className="chart-card">
          <h2>Power Consumption</h2>
          {chartData.length > 0 ? (
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
          ) : (
            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p>No data available for the selected time period</p>
            </div>
          )}
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
                    Temp: {reading.temperature}°C | Humidity: {reading.humidity}% | Power: {reading.powerConsumption}kW
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