import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { toEditorJson, toApiJsonString } from '../utils/richTextHelpers';
import './FormPage.css';

interface TaskForm {
    title: string;
    description?: string;
    descriptionJson?: string;
    descriptionHtml?: string;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    familyId: number;
    assignedToUserId?: number;
    category?: string;
    priority?: string;
    estimatedMinutes?: number;
    isRecurring?: boolean;
    recurrencePattern?: string;
}

export default function TaskFormPage() {
    const navigate = useNavigate();
    const { taskId } = useParams();
    const [families, setFamilies] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!taskId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<TaskForm>({
        title: '',
        description: '',
        descriptionJson: '',
        descriptionHtml: '',
        dueDate: '',
        status: 'Pending',
        familyId: 0,
        assignedToUserId: undefined,
        category: 'Homework',
        priority: 'Medium',
    });

    useEffect(() => {
        loadFamilies();
        if (taskId) {
            loadTask();
        } else {
            setLoading(false);
        }
    }, [taskId]);

    const loadFamilies = async () => {
        try {
            const response = await smartpathService.families.getMyFamilies();
            const familiesData = Array.isArray(response.data) ? response.data : [];
            setFamilies(familiesData);
            if (familiesData.length > 0 && !form.familyId) {
                setForm(prev => ({ ...prev, familyId: familiesData[0].familyId }));
            }
        } catch (err) {
            console.error('Failed to load families:', err);
            setError('Failed to load families');
        }
    };

    const loadTask = async () => {
        try {
            const response = await smartpathService.tasks.getById(Number(taskId));
            const task = response.data;
            setForm({
                title: task.title,
                description: task.description || '',
                descriptionJson: (task as any).descriptionJson || '',
                descriptionHtml: (task as any).descriptionHtml || '',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                status: task.status,
                familyId: task.familyId,
                assignedToUserId: task.assignedToUserId || 0,
                category: task.category || 'Homework',
                priority: task.priority || 'Medium',
            });
        } catch (err) {
            console.error('Failed to load task:', err);
            setError('Failed to load task');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!form.familyId) {
            setError('Family is required');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload: any = {
                title: form.title,
                dueDate: form.dueDate || null,
                status: form.status,
                category: form.category || 'Homework',
                priority: form.priority || 'Medium',
                assignedToUserId: form.assignedToUserId || null,
                estimatedMinutes: form.estimatedMinutes || null,
                isRecurring: form.isRecurring || false,
                recurrencePattern: form.recurrencePattern || null,
            };

            // If rich text is provided, use it; otherwise use plain description
            if (form.descriptionHtml) {
                payload.descriptionJson = form.descriptionJson || null;
                payload.descriptionHtml = form.descriptionHtml;
            } else if (form.description) {
                payload.description = form.description;
            }

            if (taskId) {
                await smartpathService.tasks.update(Number(taskId), payload);
            } else {
                await smartpathService.tasks.create({
                    familyId: form.familyId,
                    ...payload,
                });
            }
            navigate('/tasks');
        } catch (err) {
            console.error('Failed to save task:', err);
            setError('Failed to save task. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!taskId) return;
        if (!confirm('Are you sure you want to delete this task?')) return;

        setSaving(true);
        try {
            await smartpathService.tasks.delete(Number(taskId));
            navigate('/tasks');
        } catch (err) {
            console.error('Failed to delete task:', err);
            setError('Failed to delete task');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="task-form-loading">Loading...</div>;
    }

    return (
        <div className="form-page container" data-testid="task-form-page">
            <div className="form-header" data-testid="task-form-header">
                <button onClick={() => navigate('/tasks')} className="btn-back">
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1>{taskId ? 'Edit Task' : 'New Task'}</h1>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container" data-testid="task-form">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        id="title"
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter task title"
                        required
                        data-testid="task-title-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="family">Family *</label>
                    <select
                        id="family"
                        value={form.familyId}
                        onChange={(e) => setForm({ ...form, familyId: Number(e.target.value) })}
                        required
                        data-testid="task-family-select"
                    >
                        <option value="">Select a family</option>
                        {families.map((family) => (
                            <option key={family.familyId} value={family.familyId}>
                                {family.familyName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <RichTextEditor
                        valueJson={toEditorJson(form.descriptionJson)}
                        valueHtml={form.descriptionHtml}
                        onChangeJson={(json) => setForm(prev => ({ ...prev, descriptionJson: toApiJsonString(json) }))}
                        onChangeHtml={(html) => setForm(prev => ({ ...prev, descriptionHtml: html }))}
                        placeholder="Enter task description"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="dueDate">Due Date</label>
                        <input
                            id="dueDate"
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={form.category || 'Homework'}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            <option value="Homework">Homework</option>
                            <option value="Chore">Chore</option>
                            <option value="Project">Project</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={form.priority || 'Medium'}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="assignedToUserId">Assign To (Optional)</label>
                    <input
                        id="assignedToUserId"
                        type="number"
                        value={form.assignedToUserId || ''}
                        onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Leave blank to assign to yourself"
                    />
                </div>

                <div className="form-actions">
                    <ButtonComponent type="submit" variant="primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Task'}
                    </ButtonComponent>
                    {taskId && (
                        <ButtonComponent
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={saving}
                        >
                            <Trash2 size={20} />
                            Delete
                        </ButtonComponent>
                    )}
                    <ButtonComponent
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/tasks')}
                        disabled={saving}
                    >
                        Cancel
                    </ButtonComponent>
                </div>
            </form>
        </div>
    );
}
