import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import { ArrowLeft } from 'lucide-react';
import './MemberEditPage.css';

interface Member {
    familyMemberId: number;
    userId: number;
    role: string;
    userName: string;
    dateOfBirth?: string;
    joinedAt: string;
}

interface Family {
    familyId: number;
    familyName: string;
}

export default function MemberEditPage() {
    const navigate = useNavigate();
    const { familyId, familyMemberId } = useParams<{ familyId: string; familyMemberId: string }>();
    const [family, setFamily] = useState<Family | null>(null);
    const [member, setMember] = useState<Member | null>(null);
    const [role, setRole] = useState('familyMember');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [familyId, familyMemberId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!familyId) {
                setError('Family ID is required');
                return;
            }

            const familyResponse = await smartpathService.families.getById(parseInt(familyId));
            setFamily(familyResponse.data);

            const familiesResponse = await smartpathService.families.getMyFamilies();
            const families = Array.isArray(familiesResponse.data) ? familiesResponse.data : [];
            const currentFamily = families.find(f => f.familyId === parseInt(familyId));

            if (currentFamily && familyMemberId) {
                const memberData = currentFamily.members?.find(
                    (m: { familyMemberId: number; }) => m.familyMemberId === parseInt(familyMemberId)
                );
                if (memberData) {
                    setMember(memberData);
                    setRole(memberData.role);
                } else {
                    setError('Member not found');
                }
            }
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load member data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!familyId || !familyMemberId || !member) return;

        try {
            setSaving(true);
            setError(null);

            await smartpathService.families.updateMemberRole(
                parseInt(familyId),
                parseInt(familyMemberId),
                role
            );

            navigate(`/family`);
        } catch (err: any) {
            console.error('Failed to update member role:', err);
            setError(err.response?.data?.error || 'Failed to update member role');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="member-edit-page loading">Loading...</div>;
    }

    if (error && !member) {
        return (
            <div className="member-edit-page error-state">
                <div className="error-message">{error}</div>
                <ButtonComponent onClick={() => navigate('/family')} variant="primary">
                    <ArrowLeft size={18} />
                    Back to Families
                </ButtonComponent>
            </div>
        );
    }

    return (
        <div className="member-edit-page">
            <header className="page-header">
                <div>
                    <h1>Edit Member Role</h1>
                    <p>Update {member?.userName}'s role in {family?.familyName}</p>
                </div>
                <ButtonComponent onClick={() => navigate('/family')} variant="secondary">
                    <ArrowLeft size={18} />
                    Back
                </ButtonComponent>
            </header>

            <div className="form-container">
                <div className="form-group">
                    <label htmlFor="memberName">Member Name</label>
                    <input
                        id="memberName"
                        type="text"
                        value={member?.userName || ''}
                        disabled
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="familyName">Family</label>
                    <input
                        id="familyName"
                        type="text"
                        value={family?.familyName || ''}
                        disabled
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="form-input"
                    >
                        <option value="familyMember">Family Member</option>
                        <option value="familyManager">Family Manager</option>
                    </select>
                </div>

                {member?.dateOfBirth && (
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="text"
                            value={new Date(member.dateOfBirth).toLocaleDateString()}
                            disabled
                            className="form-input"
                        />
                    </div>
                )}

                {member?.joinedAt && (
                    <div className="form-group">
                        <label>Joined At</label>
                        <input
                            type="text"
                            value={new Date(member.joinedAt).toLocaleDateString()}
                            disabled
                            className="form-input"
                        />
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <ButtonComponent
                        onClick={() => navigate('/family')}
                        variant="secondary"
                    >
                        Cancel
                    </ButtonComponent>
                    <ButtonComponent
                        onClick={handleSave}
                        variant="primary"
                        disabled={saving || role === member?.role}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </ButtonComponent>
                </div>
            </div>
        </div>
    );
}
