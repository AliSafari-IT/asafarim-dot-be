import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import './FormPage.css';

interface FamilyForm {
    familyName: string;
}

export default function FamilyFormPage() {
    const navigate = useNavigate();
    const { familyId } = useParams();
    const [loading, setLoading] = useState(!!familyId);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<FamilyForm>({
        familyName: '',
    });

    useEffect(() => {
        if (familyId) {
            loadFamily();
        }
    }, [familyId]);

    const loadFamily = async () => {
        try {
            const response = await smartpathService.families.getById(Number(familyId));
            const family = response.data;
            setForm({
                familyName: family.familyName,
            });
        } catch (err) {
            console.error('Failed to load family:', err);
            setError('Failed to load family');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.familyName.trim()) {
            setError('Family name is required');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (familyId) {
                await smartpathService.families.update(Number(familyId), form);
            } else {
                await smartpathService.families.create(form);
            }
            navigate('/family');
        } catch (err) {
            console.error('Failed to save family:', err);
            setError('Failed to save family');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!familyId) return;
        if (!confirm('Are you sure you want to delete this family? This action cannot be undone.')) return;

        setSaving(true);
        try {
            await smartpathService.families.delete(Number(familyId));
            navigate('/family');
        } catch (err) {
            console.error('Failed to delete family:', err);
            setError('Failed to delete family');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="family-form-loading">Loading...</div>;
    }

    return (
        <div className="form-page container" data-testid="family-form-page">
            <div className="form-header" data-testid="family-form-header">
                <button onClick={() => navigate('/family')} className="btn-back">
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1>{familyId ? 'Edit Family' : 'New Family'}</h1>
            </div>

            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container" data-testid="family-form">
                <div className="form-group">
                    <label htmlFor="familyName">Family Name *</label>
                    <input
                        id="familyName"
                        type="text"
                        value={form.familyName}
                        onChange={(e) => setForm({ ...form, familyName: e.target.value })}
                        placeholder="Enter family name"
                        required
                        data-testid="family-name-input"
                    />
                </div>

                <div className="form-actions">
                    <ButtonComponent type="submit" variant="primary" disabled={saving}>
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Family'}
                    </ButtonComponent>
                    {familyId && (
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
                        onClick={() => navigate('/family')}
                        disabled={saving}
                    >
                        Cancel
                    </ButtonComponent>
                </div>
            </form>
        </div>
    );
}
