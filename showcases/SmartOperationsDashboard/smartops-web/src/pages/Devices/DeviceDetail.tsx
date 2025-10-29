import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDevicesStore } from '../../hooks/useDevicesStore'
import { deviceService, type Device } from '../../services/deviceService'
import './DeviceForm.css'

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { devices, updateDevice, setError } = useDevicesStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [device, setDevice] = useState<Device | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    location: '',
    status: 'Offline' as Device['status'],
    description: '',
  })

  useEffect(() => {
    const loadDevice = async () => {
      if (!id) return

      try {
        setLoading(true)
        const existingDevice = devices.find(d => d.id === id)
        if (existingDevice) {
          setDevice(existingDevice)
          setFormData({
            name: existingDevice.name,
            serialNumber: existingDevice.serialNumber,
            location: existingDevice.location,
            status: existingDevice.status,
            description: existingDevice.description || '',
          })
        } else {
          const fetchedDevice = await deviceService.getDevice(id)
          setDevice(fetchedDevice)
          setFormData({
            name: fetchedDevice.name,
            serialNumber: fetchedDevice.serialNumber,
            location: fetchedDevice.location,
            status: fetchedDevice.status,
            description: fetchedDevice.description || '',
          })
        }
        setError(null)
      } catch (err) {
        let message = 'Failed to load device'
        if (err instanceof Error) {
          if (err.message.includes('404')) {
            message = '❌ Device not found. It may have been deleted.'
          } else if (err.message.includes('401')) {
            message = '🔐 Your session has expired. Please log in again.'
          } else {
            message = `❌ ${err.message}`
          }
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDevice()
  }, [id, devices, setError])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id || !device) return

    if (!formData.name.trim() || !formData.serialNumber.trim()) {
      setError('⚠️ Please fill in the required fields: Name and Serial Number')
      return
    }

    try {
      setSaving(true)
      const updatedDevice = await deviceService.updateDevice(id, {
        name: formData.name,
        serialNumber: formData.serialNumber,
        location: formData.location,
        status: formData.status,
        description: formData.description,
      })
      updateDevice(updatedDevice)
      setError(null)
      navigate('/devices')
    } catch (err) {
      let message = 'Failed to update device'
      
      if (err instanceof Error) {
        if (err.message.includes('403')) {
          message = '🔒 You don\'t have permission to update devices. Please contact an administrator.'
        } else if (err.message.includes('401')) {
          message = '🔐 Your session has expired. Please log in again.'
        } else if (err.message.includes('404')) {
          message = '❌ Device not found. It may have been deleted.'
        } else if (err.message.includes('409')) {
          message = '⚠️ A device with this serial number already exists.'
        } else {
          message = `❌ ${err.message}`
        }
      }
      
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="device-form-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading device...</p>
        </div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="device-form-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Device not found</p>
          <button
            onClick={() => navigate('/devices')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Back to Devices
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="device-form-container">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/devices')}>
          <ArrowLeft size={20} />
          Back to Devices
        </button>
        <h1>Edit Device</h1>
      </div>

      <form onSubmit={handleSubmit} className="device-form">
        <div className="form-group">
          <label htmlFor="name">Device Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Temperature Sensor 1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="serialNumber">Serial Number *</label>
          <input
            id="serialNumber"
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="e.g., SN-2024-001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Building A, Floor 2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
            <option value="Idle">Idle</option>
            <option value="Running">Running</option>
            <option value="Error">Error</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional device description"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/devices')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
