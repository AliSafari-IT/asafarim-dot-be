import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import smartpathService from '../api/smartpathService';
import './TasksPage.css';

interface Task {
  taskId: number;
  familyId: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  dueDate?: string;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    userId: number;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
  };
  assignedTo?: {
    userId: number;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
  };
  assignedBy?: {
    userId: number;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
  };
  assignedAt?: string;
  lastEditedBy?: {
    userId: number;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
  };
  lastEditedAt?: string;
}

export default function TasksPage() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<any[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamilyId) {
      loadTasks();
      loadFamilyMembers();
    }
  }, [selectedFamilyId]);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter]);

  const loadFamilies = async () => {
    try {
      const response = await smartpathService.families.getMyFamilies();
      setFamilies(response.data);
      if (response.data.length > 0) {
        setSelectedFamilyId(response.data[0].familyId);
      }
    } catch (err) {
      setError('Failed to load families');
    }
  };

  const loadTasks = async () => {
    if (!selectedFamilyId) return;
    setLoading(true);
    try {
      const response = await smartpathService.api.get(`/tasks?familyId=${selectedFamilyId}`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    if (!selectedFamilyId) return;
    try {
      const response = await smartpathService.families.getFamilyDetails(selectedFamilyId);
      setFamilyMembers(response.data.members || []);
    } catch (err) {
      console.error('Failed to load family members');
    }
  };

  const filterTasks = () => {
    let filtered = tasks;
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    setFilteredTasks(filtered);
  };

  const handleAssignTask = async () => {
    if (!selectedTaskId || selectedAssigneeId === null) return;

    try {
      await smartpathService.api.post(`/tasks/${selectedTaskId}/assign`, {
        assignedToUserId: selectedAssigneeId || null,
      });
      loadTasks();
      setShowAssignModal(false);
      setSelectedTaskId(null);
      setSelectedAssigneeId(null);
    } catch (err) {
      setError('Failed to assign task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await smartpathService.api.delete(`/tasks/${taskId}`);
      loadTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const getAuditText = (task: Task): string => {
    if (task.lastEditedAt && task.lastEditedAt !== task.createdAt) {
      const date = new Date(task.lastEditedAt);
      return `Last edited by ${task.lastEditedBy?.displayName || 'Unknown'} • ${date.toLocaleDateString()}`;
    }
    const date = new Date(task.createdAt);
    return `Created by ${task.createdBy?.displayName || 'Unknown'} • ${date.toLocaleDateString()}`;
  };

  return (
    <div className="tasks-page" data-testid="tasks-page">
      <div className="tasks-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={() => navigate('/tasks/new')} data-testid="create-task-btn">
          New Task
        </button>
      </div>

      {error && <div className="error-banner" data-testid="error-banner">{error}</div>}

      <div className="tasks-controls">
        <div className="form-group">
          <label>Family</label>
          <select
            value={selectedFamilyId || ''}
            onChange={(e) => setSelectedFamilyId(parseInt(e.target.value))}
            data-testid="family-select"
          >
            {families.map(f => (
              <option key={f.familyId} value={f.familyId}>{f.familyName}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="status-filter"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map(task => (
            <div key={task.taskId} className="task-card" data-testid={`task-card-${task.taskId}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setSelectedTaskId(task.taskId);
                      setShowAssignModal(true);
                    }}
                    data-testid={`assign-btn-${task.taskId}`}
                  >
                    Assign
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteTask(task.taskId)}
                    data-testid={`delete-btn-${task.taskId}`}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {task.description && <p className="task-description">{task.description}</p>}

              <div className="task-meta">
                <span className="badge" data-testid={`status-${task.taskId}`}>{task.status}</span>
                <span className="badge priority">{task.priority}</span>
                {task.dueDate && (
                  <span className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>

              {task.assignedTo && (
                <div className="task-assignment">
                  <strong>Assigned to:</strong> {task.assignedTo.displayName}
                  {task.assignedAt && (
                    <span className="assignment-date">
                      on {new Date(task.assignedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              <div className="task-audit">
                {getAuditText(task)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay" data-testid="assign-modal">
          <div className="modal-content">
            <h2>Assign Task</h2>
            <div className="form-group">
              <label>Assign to</label>
              <select
                value={selectedAssigneeId || ''}
                onChange={(e) => setSelectedAssigneeId(e.target.value ? parseInt(e.target.value) : null)}
                data-testid="assignee-select"
              >
                <option value="">Unassign</option>
                {familyMembers.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.firstName} {member.lastName} ({member.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleAssignTask} data-testid="assign-confirm">
                Assign
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTaskId(null);
                  setSelectedAssigneeId(null);
                }}
                data-testid="assign-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
