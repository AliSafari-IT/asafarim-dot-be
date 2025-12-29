import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import './FormPage.css';

interface LearningForm {
    title: string;
    description: string;
    courseId: number;
    childUserId: number;
}

export default function LearningFormPage() {
    const navigate = useNavigate();
    const { learningId } = useParams();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!learningId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<LearningForm>({
        title: '',
        description: '',
        courseId: 0,
        childUserId: 0,
    });

    useEffect(() => {
        loadCourses();
        if (learningId) {
            loadLearning();
        }
    }, [learningId]);

    const loadCourses = async () => {
        try {
            const response = await smartpathService.courses.getAll();
            const coursesData = Array.isArray(response.data) ? response.data : [];
            setCourses(coursesData);
            if (coursesData.length > 0 && !form.courseId) {
                setForm(prev => ({ ...prev, courseId: coursesData[0].courseId }));
            }
        } catch (err) {
            console.error('Failed to load courses:', err);
            setError('Failed to load courses');
        }
    };

    const loadLearning = async () => {
        try {
            const response = await smartpathService.courses.getLesson(Number(learningId));
            const lesson = response.data;
            setForm({
                title: lesson.title,
                description: lesson.description || '',
                courseId: lesson.courseId,
                childUserId: lesson.childUserId || 0,
            });
        } catch (err) {
            console.error('Failed to load learning item:', err);
            setError('Failed to load learning item');
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
        if (!form.courseId) {
            setError('Course is required');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (learningId) {
                await smartpathService.courses.getLessons(form.courseId);
            } else {
                await smartpathService.courses.getLesson(form.courseId);
            }
            navigate('/learning');
        } catch (err) {
            console.error('Failed to save learning item:', err);
            setError('Failed to save learning item');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!learningId) return;
        if (!confirm('Are you sure you want to delete this learning item?')) return;

        setSaving(true);
        try {
            await smartpathService.courses.getLessons(form.courseId);
            navigate('/learning');
        } catch (err) {
            console.error('Failed to delete learning item:', err);
            setError('Failed to delete learning item');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="form-page container">
            <div className="form-header">
                <button onClick={() => navigate('/learning')} className="btn-back">
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1>{learningId ? 'Edit Learning Item' : 'New Learning Item'}</h1>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        id="title"
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter learning item title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="course">Course *</label>
                    <select
                        id="course"
                        value={form.courseId}
                        onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}
                        required
                    >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                            <option key={course.courseId} value={course.courseId}>
                                {course.courseName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter learning item description"
                        rows={4}
                    />
                </div>

                <div className="form-actions">
                    <ButtonComponent type="submit" variant="primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Learning Item'}
                    </ButtonComponent>
                    {learningId && (
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
                        onClick={() => navigate('/learning')}
                        disabled={saving}
                    >
                        Cancel
                    </ButtonComponent>
                </div>
            </form>
        </div>
    );
}
