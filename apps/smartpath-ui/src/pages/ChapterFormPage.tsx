import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import './FormPage.css';

interface ChapterForm {
    title: string;
    description: string;
}

export default function ChapterFormPage() {
    const navigate = useNavigate();
    const { courseId, chapterId } = useParams();
    const [loading, setLoading] = useState(!!chapterId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<ChapterForm>({
        title: '',
        description: '',
    });

    useEffect(() => {
        if (chapterId) {
            loadChapter();
        }
    }, [chapterId]);

    const loadChapter = async () => {
        try {
            if (!chapterId) return;
            const response = await smartpathService.courses.getChapter(Number(chapterId));
            const chapter = response.data;
            setForm({
                title: chapter.title,
                description: chapter.description || '',
            });
        } catch (err) {
            console.error('Failed to load chapter:', err);
            setError('Failed to load chapter');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Chapter title is required');
            return;
        }
        if (!courseId) {
            setError('Course ID is missing');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (chapterId) {
                await smartpathService.courses.updateChapter(Number(chapterId), form);
            } else {
                await smartpathService.courses.createChapter({
                    courseId: Number(courseId),
                    ...form,
                });
            }
            navigate(`/learning/${courseId}`);
        } catch (err) {
            console.error('Failed to save chapter:', err);
            setError('Failed to save chapter');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!chapterId) return;
        if (!confirm('Are you sure you want to delete this chapter? All lessons will be deleted.')) return;

        setSaving(true);
        try {
            await smartpathService.courses.deleteChapter(Number(chapterId));
            navigate(`/learning/${courseId}`);
        } catch (err) {
            console.error('Failed to delete chapter:', err);
            setError('Failed to delete chapter');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="chapter-form-loading">Loading...</div>;
    }

    return (
        <div className="form-page container" data-testid="chapter-form-page">
            <div className="form-header" data-testid="chapter-form-header">
                <button onClick={() => navigate(`/learning/${courseId}`)} className="btn-back">
                    <ArrowLeft size={20} />
                    Back to Course
                </button>
                <h1>{chapterId ? 'Edit Chapter' : 'New Chapter'}</h1>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container" data-testid="chapter-form">
                <div className="form-group">
                    <label htmlFor="title">Chapter Title *</label>
                    <input
                        id="title"
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter chapter title"
                        required
                        data-testid="chapter-title-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter chapter description"
                        rows={4}
                    />
                </div>

                <div className="form-actions">
                    <ButtonComponent type="submit" variant="primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Chapter'}
                    </ButtonComponent>
                    {chapterId && (
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
