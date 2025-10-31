import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDevicesStore } from '../../hooks/useDevicesStore'
import { deviceService, type Device } from '../../services/deviceService'
import './DeviceForm.css'

export default function DeviceCreate() {
  const navigate = useNavigate()
  const { addDevice, setError } = useDevicesStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    location: '',
    status: 'Offline' as Device['status'],
    description: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.serialNumber.trim()) {
      setError('⚠️ Please fill in the required fields: Name and Serial Number')
      return
    }

    try {
      setLoading(true)
      const newDevice = await deviceService.createDevice({
        name: formData.name,
        serialNumber: formData.serialNumber,
        location: formData.location,
        status: formData.status,
        description: formData.description,
      })
      addDevice(newDevice)
      setError(null)
      navigate('/devices')
    } catch (err) {
      let message = 'Failed to create device'
      
      if (err instanceof Error) {
        if (err.message.includes('403')) {
          message = '🔒 You don\'t have permission to create devices.\n\n💡 If you just updated your role, please refresh the page or log out and back in for the changes to take effect.'
        } else if (err.message.includes('401')) {
          message = '🔐 Your session has expired. Please log in again.'
        } else if (err.message.includes('400')) {
          message = '❌ Invalid device data. Please check your inputs.'
        } else if (err.message.includes('409')) {
          message = '⚠️ A device with this serial number already exists.'
        } else {
          message = `❌ ${err.message}`
        }
      }
      
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="device-form-container">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/devices')}>
          <ArrowLeft size={20} />
          Back to Devices
        </button>
        <h1>Add New Device</h1>
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Device'}
          </button>
        </div>
      </form>
    </div>
  )
}
