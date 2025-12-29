import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import './FormPage.css';

interface CourseForm {
    name: string;
    description: string;
    gradeLevel: number;
    colorCode: string;
}

export default function CourseFormPage() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(!!courseId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<CourseForm>({
        name: '',
        description: '',
        gradeLevel: 1,
        colorCode: '#3B82F6',
    });

    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const response = await smartpathService.courses.getById(Number(courseId));
            const course = response.data;
            setForm({
                name: course.name,
                description: course.description || '',
                gradeLevel: course.gradeLevel,
                colorCode: course.colorCode || '#3B82F6',
            });
        } catch (err) {
            console.error('Failed to load course:', err);
            setError('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Course name is required');
            return;
        }
        if (form.gradeLevel < 1 || form.gradeLevel > 12) {
            setError('Grade level must be between 1 and 12');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (courseId) {
                await smartpathService.courses.update(Number(courseId), form);
            } else {
                await smartpathService.courses.create(form);
            }
            navigate('/learning');
        } catch (err) {
            console.error('Failed to save course:', err);
            setError('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!courseId) return;
        if (!confirm('Are you sure you want to delete this course? All chapters and lessons will be deleted.')) return;

        setSaving(true);
        try {
            await smartpathService.courses.delete(Number(courseId));
            navigate('/learning');
        } catch (err) {
            console.error('Failed to delete course:', err);
            setError('Failed to delete course');
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
                <h1>{courseId ? 'Edit Course' : 'New Course'}</h1>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label htmlFor="name">Course Name *</label>
                    <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter course name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter course description"
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gradeLevel">Grade Level *</label>
                    <input
                        id="gradeLevel"
                        type="number"
                        min="1"
                        max="12"
                        value={form.gradeLevel}
                        onChange={(e) => setForm({ ...form, gradeLevel: Number(e.target.value) })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="colorCode">Color</label>
                    <input
                        id="colorCode"
                        type="color"
                        value={form.colorCode}
                        onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    />
                </div>

                <div className="form-actions">
                    <ButtonComponent type="submit" variant="primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Course'}
                    </ButtonComponent>
                    {courseId && (
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
