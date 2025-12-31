import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import './FormPage.css';

interface LessonForm {
    title: string;
    description: string;
    learningObjectives?: string;
    estimatedMinutes?: number;
    orderIndex?: number;
}

export default function LessonFormPage() {
    const navigate = useNavigate();
    const { courseId, chapterId, lessonId } = useParams();
    const [loading, setLoading] = useState(!!lessonId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<LessonForm>({
        title: '',
        description: '',
        learningObjectives: '',
        estimatedMinutes: 30,
        orderIndex: 0,
    });

    useEffect(() => {
        if (lessonId) {
            loadLesson();
        }
    }, [lessonId]);

    const loadLesson = async () => {
        try {
            if (!lessonId) return;
            const response = await smartpathService.courses.getLesson(Number(lessonId));
            const lesson = response.data;
            setForm({
                title: lesson.title,
                description: lesson.description || '',
                learningObjectives: lesson.learningObjectives || '',
                estimatedMinutes: lesson.estimatedMinutes || 30,
                orderIndex: lesson.orderIndex || 0,
            });
        } catch (err) {
            console.error('Failed to load lesson:', err);
            setError('Failed to load lesson');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Lesson title is required');
            return;
        }
        if (!chapterId) {
            setError('Chapter ID is missing');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (lessonId) {
                await smartpathService.courses.updateLesson(Number(lessonId), form);
            } else {
                await smartpathService.courses.createLesson({
                    chapterId: Number(chapterId),
                    ...form,
                });
            }
            navigate(`/learning/${courseId}`);
        } catch (err) {
            console.error('Failed to save lesson:', err);
            setError('Failed to save lesson');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!lessonId) return;
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        setSaving(true);
        try {
            await smartpathService.courses.deleteLesson(Number(lessonId));
            navigate(`/learning/${courseId}`);
        } catch (err) {
            console.error('Failed to delete lesson:', err);
            setError('Failed to delete lesson');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="lesson-form-loading">Loading...</div>;
    }

    return (
        <div className="form-page container" data-testid="lesson-form-page">
            <div className="form-header" data-testid="lesson-form-header">
                <button onClick={() => navigate(`/learning/${courseId}`)} className="btn-back">
                    <ArrowLeft size={20} />
                    Back to Course
                </button>
                <h1>{lessonId ? 'Edit Lesson' : 'New Lesson'}</h1>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container" data-testid="lesson-form">
                <div className="form-group">
                    <label htmlFor="title">Lesson Title *</label>
                    <input
                        id="title"
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter lesson title"
                        required
                        data-testid="lesson-title-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter lesson description"
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="learningObjectives">Learning Objectives</label>
                    <textarea
                        id="learningObjectives"
                        value={form.learningObjectives}
                        onChange={(e) => setForm({ ...form, learningObjectives: e.target.value })}
                        placeholder="What will students learn in this lesson?"
                        rows={3}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="estimatedMinutes">Estimated Minutes</label>
                        <input
                            id="estimatedMinutes"
                            type="number"
                            value={form.estimatedMinutes}
                            onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                            placeholder="30"
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="orderIndex">Order Index</label>
                        <input
                            id="orderIndex"
                            type="number"
                            value={form.orderIndex}
                            onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <ButtonComponent type="submit" variant="primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Lesson'}
                    </ButtonComponent>
                    {lessonId && (
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
                        onClick={() => navigate(`/learning/${courseId}`)}
                        disabled={saving}
                    >
                        Cancel
                    </ButtonComponent>
                </div>
            </form>
        </div>
    );
}
