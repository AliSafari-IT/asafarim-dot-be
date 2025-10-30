import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2, Plus } from "lucide-react";
import { useDevicesStore } from "../../hooks/useDevicesStore";
import { deviceService } from "../../services/deviceService";
import "./DeviceList.css";
import { useAuth } from "@asafarim/shared-ui-react";

export default function DeviceList() {
  const navigate = useNavigate();
  const { devices, loading, error, fetchDevices, removeDevice, setError } =
    useDevicesStore();
  const [deleting, setDeleting] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();


  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this device?")) {
      return;
    }

    try {
      setDeleting(id);
      await deviceService.deleteDevice(id);
      removeDevice(id);
      setError(null);
    } catch (err) {
      let message = "Failed to delete device";

      if (err instanceof Error) {
        if (err.message.includes("403")) {
          message =
            "🔒 Only administrators can delete devices. Please contact an administrator.";
        } else if (err.message.includes("401")) {
          message = "🔐 Your session has expired. Please log in again.";
        } else if (err.message.includes("404")) {
          message = "❌ Device not found. It may have already been deleted.";
        } else {
          message = `❌ ${err.message}`;
        }
      }

      setError(message);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Online":
        return "status-online";
      case "Offline":
        return "status-offline";
      case "Running":
        return "status-running";
      case "Idle":
        return "status-idle";
      case "Error":
        return "status-error";
      case "Maintenance":
        return "status-maintenance";
      default:
        return "status-unknown";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return (
      <div className="device-list-container">
        <div className="loading-state">
          <p>Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="device-list-container">
      {/* Header */}
      <div className="device-list-header">
        <div>
          <h1>Devices</h1>
          <p className="subtitle">Manage and monitor your IoT devices</p>
        </div>
        {isAuthenticated &&<button
          className="btn-add-device"
          onClick={() => navigate("/devices/create")}
        >
          <Plus size={20} />
          Add Device
        </button>}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {/* Devices Table */}
      {devices.length > 0 ? (
        <div className="table-wrapper">
          <table className="devices-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Serial Number</th>
                <th>Location</th>
                <th>Status</th>
                <th>Updated At</th>
                {isAuthenticated &&<th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id} className="device-row">
                  <td className="name-cell">
                    <div className="device-name">{device.name}</div>
                    {device.description && (
                      <div className="device-description">
                        {device.description}
                      </div>
                    )}
                  </td>
                  <td className="serial-cell">{device.serialNumber}</td>
                  <td className="location-cell">{device.location}</td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${getStatusColor(
                        device.status
                      )}`}
                    >
                      {device.status}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(device.updatedAt)}</td>
                  {isAuthenticated &&<td className="actions-cell">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => navigate(`/devices/${device.id}/edit`)}
                      title="Edit device"
                      aria-label="Edit device"
                    >
                      <Edit2 size={18} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(device.id)}
                      disabled={deleting === device.id}
                      title="Delete device"
                      aria-label="Delete device"
                    >
                      <Trash2 size={18} />
                      <span aria-hidden="true">{deleting === device.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No devices found</h2>
          <p>Get started by adding your first device</p>
          <button
            className="btn-add-device"
            onClick={() => navigate("/devices/create")}
          >
            <Plus size={20} />
            Add Your First Device
          </button>
        </div>
      )}

      {/* Summary Footer */}
      {devices.length > 0 && (
        <div className="table-footer">
          <p>
            Total devices: <strong>{devices.length}</strong>
          </p>
          <p>
            Online:{" "}
            <strong className="text-online">
              {devices.filter((d) => d.status === "Online").length}
            </strong>
          </p>
          <p>
            Offline:{" "}
            <strong className="text-offline">
              {devices.filter((d) => d.status === "Offline").length}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
