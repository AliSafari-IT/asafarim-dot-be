import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { toEditorJson, toApiJsonString } from '../utils/richTextHelpers';
import './FormPage.css';

interface CourseForm {
    name: string;
    description?: string;
    descriptionJson?: string;
    descriptionHtml?: string;
    gradeLevel: number;
    colorCode: string;
}

export default function CourseFormPage() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [familyId, setFamilyId] = useState<number | null>(null);
    const [form, setForm] = useState<CourseForm>({
        name: '',
        description: '',
        gradeLevel: 1,
        colorCode: '#3B82F6',
    });

    useEffect(() => {
        initializePage();
    }, [courseId]);

    const initializePage = async () => {
        try {
            const me = await smartpathService.users.me();
            const families = await smartpathService.families.getMyFamilies();
            const familiesData = families.data || [];
            if (familiesData.length > 0) {
                setFamilyId(familiesData[0].familyId);
            }
            if (courseId) {
                loadCourse();
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to initialize:', err);
            setError('Failed to load family information');
            setLoading(false);
        }
    };

    const loadCourse = async () => {
        try {
            const response = await smartpathService.courses.getById(Number(courseId));
            const course = response.data;
            setForm({
                name: course.name,
                description: course.description || '',
                descriptionJson: (course as any).descriptionJson || '',
                descriptionHtml: (course as any).descriptionHtml || '',
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
        if (!courseId && !familyId) {
            setError('Family information is required');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            // Debug: Log form state before building payload
            console.log('🔍 Form state before save:', {
                description: form.description,
                descriptionJson: form.descriptionJson,
                descriptionHtml: form.descriptionHtml,
            });

            // Build payload - only include description if not using rich text
            const payload: any = {
                name: form.name,
                gradeLevel: form.gradeLevel,
                colorCode: form.colorCode,
                isActive: true, // Ensure course remains active when updating
            };

            // If rich text is provided, use it; otherwise use plain description
            if (form.descriptionHtml) {
                payload.descriptionJson = form.descriptionJson || null;
                payload.descriptionHtml = form.descriptionHtml;
                console.log('✅ Using rich text - HTML length:', form.descriptionHtml.length);
            } else if (form.description) {
                payload.description = form.description;
                console.log('✅ Using plain description:', form.description);
            } else {
                console.log('⚠️ No description provided in form state');
            }

            console.log('📤 Payload being sent:', payload);

            if (courseId) {
                await smartpathService.courses.update(Number(courseId), payload);
            } else {
                const courseData = { ...payload, familyId };
                await smartpathService.courses.create(courseData);
            }
            navigate('/learning');
        } catch (err) {
            console.error('Failed to save course:', err);
            setError('Failed to save course. Please try again.');
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
        return <div className="loading" data-testid="course-form-loading">Loading...</div>;
    }

    return (
        <div className="form-page container" data-testid="course-form-page">
            <div className="form-header" data-testid="course-form-header">
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

            <form onSubmit={handleSubmit} className="form-container" data-testid="course-form">
                <div className="form-group">
                    <label htmlFor="name">Course Name *</label>
                    <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter course name"
                        required
                        data-testid="course-name-input"
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <RichTextEditor
                        valueJson={toEditorJson(form.descriptionJson)}
                        valueHtml={form.descriptionHtml}
                        onChangeJson={(json) => {
                            const jsonString = toApiJsonString(json);
                            console.log('📝 RichTextEditor onChangeJson:', { json, jsonString });
                            setForm(prev => ({ ...prev, descriptionJson: jsonString }));
                        }}
                        onChangeHtml={(html) => {
                            console.log('📝 RichTextEditor onChangeHtml:', html);
                            setForm(prev => ({ ...prev, descriptionHtml: html }));
                        }}
                        placeholder="Enter course description"
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
