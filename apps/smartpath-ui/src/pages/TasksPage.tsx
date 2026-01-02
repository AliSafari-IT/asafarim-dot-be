import { useEffect, useState } from 'react';
import smartpathService from '../api/smartpathService';
import { Plus, Calendar, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import './TasksPage.css';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import { useNavigate } from 'react-router-dom';

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [families, setFamilies] = useState<any[]>([]);
    const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        loadFamilies();
    }, []);

    useEffect(() => {
        if (selectedFamily) {
            loadTasks();
        }
    }, [selectedFamily]);

    const loadFamilies = async () => {
        try {
            const response = await smartpathService.families.getMyFamilies();
            const familiesData = Array.isArray(response.data) ? response.data : [];
            setFamilies(familiesData);
            if (familiesData.length > 0) {
                setSelectedFamily(familiesData[0].familyId);
            }
        } catch (error) {
            console.error('Failed to load families:', error);
            setFamilies([]);
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async () => {
        if (!selectedFamily) return;
        try {
            const response = await smartpathService.tasks.getAll({ familyId: selectedFamily });
            const tasksData = Array.isArray(response.data) ? response.data : [];
            setTasks(tasksData);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            setTasks([]);
        }
    };

    const completeTask = async (taskId: number) => {
        try {
            await smartpathService.tasks.complete(taskId);
            loadTasks();
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const deleteTask = async (taskId: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await smartpathService.tasks.delete(taskId);
            loadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const toggleTaskSelection = (taskId: number) => {
        const newSelected = new Set(selectedTasks);
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId);
        } else {
            newSelected.add(taskId);
        }
        setSelectedTasks(newSelected);
    };

    const toggleAllTasks = () => {
        if (selectedTasks.size === tasks.length) {
            setSelectedTasks(new Set());
        } else {
            setSelectedTasks(new Set(tasks.map(t => t.taskId)));
        }
    };

    const deleteBulkTasks = async () => {
        if (selectedTasks.size === 0) return;
        if (!confirm(`Delete ${selectedTasks.size} selected task(s)?`)) return;

        try {
            await smartpathService.tasks.deleteMultiple(Array.from(selectedTasks));
            setSelectedTasks(new Set());
            loadTasks();
        } catch (error) {
            console.error('Failed to delete tasks:', error);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="tasks-loading">Loading...</div>;
    }

    return (
        <div className="tasks-page container" data-testid="tasks-page">
            <header className="page-header" data-testid="tasks-header">
                <div>
                    <h1>Tasks</h1>
                    <p>Manage homework and activities</p>
                </div>
                <div className="header-actions" data-testid="tasks-header-actions">
                    {selectedTasks.size > 0 && (
                        <ButtonComponent onClick={deleteBulkTasks} variant="danger">
                            <Trash2 size={20} />
                            Delete {selectedTasks.size}
                        </ButtonComponent>
                    )}
                    <ButtonComponent onClick={() => navigate('/tasks/new')} variant="primary">
                        <Plus size={20} />
                        Add Task
                    </ButtonComponent>
                </div>
            </header>

            {families?.length > 0 && (
                <div className="family-selector" data-testid="family-selector">
                    <label>Family:</label>
                    <select value={selectedFamily || ''} onChange={(e) => setSelectedFamily(Number(e.target.value))} data-testid="family-select">
                        {families?.map((family) => (
                            <option key={family.familyId} value={family.familyId}>
                                {family.familyName}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="tasks-grid" data-testid="tasks-grid">
                {tasks?.length === 0 ? (
                    <div className="empty-state" data-testid="tasks-empty-state">
                        <p>No tasks yet. Create your first task to get started!</p>
                    </div>
                ) : (
                    <>
                        <div className="select-all-row" data-testid="select-all-row">
                            <input
                                type="checkbox"
                                checked={selectedTasks.size === tasks.length && tasks.length > 0}
                                onChange={toggleAllTasks}
                                title="Select all tasks"
                                data-testid="select-all-checkbox"
                            />
                            <span>{selectedTasks.size > 0 ? `${selectedTasks.size} selected` : 'Select all'}</span>
                        </div>
                        {tasks?.map((task) => (
                            <div
                                key={task.taskId}
                                className={`task-card ${task.status.toLowerCase()} ${selectedTasks.has(task.taskId) ? 'selected' : ''}`}
                                data-testid={`task-card-${task.taskId}`}
                            >
                                <div className="task-checkbox" data-testid={`task-checkbox-${task.taskId}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTasks.has(task.taskId)}
                                        onChange={() => toggleTaskSelection(task.taskId)}
                                        data-testid={`task-checkbox-input-${task.taskId}`}
                                    />
                                </div>
                                <div className="task-content" data-testid={`task-content-${task.taskId}`}>
                                    <div className="task-header" data-testid={`task-header-${task.taskId}`}>
                                        <h3>{task.title}</h3>
                                        <span className={`status-badge ${task.status.toLowerCase()}`} data-testid={`task-status-${task.taskId}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    {task.description && <p className="task-description">{task.description}</p>}
                                    {task.descriptionHtml && <div className="task-description" dangerouslySetInnerHTML={{ __html: task.descriptionHtml }} />}
                                    <div className="task-footer">
                                        {task.dueDate && (
                                            <div className="task-date">
                                                <Calendar size={16} />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="task-actions" data-testid={`task-actions-${task.taskId}`}>
                                    {task.status !== 'Completed' && (
                                        <button
                                            onClick={() => completeTask(task.taskId)}
                                            className="btn-action btn-complete"
                                            title="Mark as complete"
                                            data-testid={`task-complete-btn-${task.taskId}`}
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/tasks/${task.taskId}/edit`)}
                                        className="btn-action btn-edit"
                                        title="Edit task"
                                        data-testid={`task-edit-btn-${task.taskId}`}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.taskId)}
                                        className="btn-action btn-delete"
                                        title="Delete task"
                                        data-testid={`task-delete-btn-${task.taskId}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
