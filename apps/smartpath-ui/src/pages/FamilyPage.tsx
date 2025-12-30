import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import smartpathService from '../api/smartpathService';
import { Users, Plus, Edit2, Trash2, UserPlus, X, Users2 } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import AddMemberModal from '../components/AddMemberModal';
import './FamilyPage.css';

export default function FamilyPage() {
    const navigate = useNavigate();
    const [families, setFamilies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFamilies, setSelectedFamilies] = useState<Set<number>>(new Set());
    const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [selectedFamilyForAddMember, setSelectedFamilyForAddMember] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentSmartPathUserId, setCurrentSmartPathUserId] = useState<number | null>(null);

    useEffect(() => {
        initializeUser();
    }, []);

    const initializeUser = async () => {
        try {
            const meResponse = await smartpathService.users.me();
            setCurrentSmartPathUserId(meResponse.data.userId);
            setIsAdmin(meResponse.data.isAdmin);
            await loadFamilies();
        } catch (error) {
            console.error('Failed to get current user:', error);
            setLoading(false);
        }
    };

    const loadFamilies = async () => {
        try {
            const response = await smartpathService.families.getMyFamilies();
            const familiesData = Array.isArray(response.data) ? response.data : [];
            setFamilies(familiesData);
            console.info('Families loaded:', familiesData);
        } catch (error) {
            console.error('Failed to load families:', error);
            setFamilies([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteFamily = async (familyId: number) => {
        if (!confirm('Are you sure you want to delete this family?')) return;
        try {
            await smartpathService.families.delete(familyId);
            loadFamilies();
        } catch (error) {
            console.error('Failed to delete family:', error);
        }
    };

    const toggleFamilySelection = (familyId: number) => {
        const newSelected = new Set(selectedFamilies);
        if (newSelected.has(familyId)) {
            newSelected.delete(familyId);
        } else {
            newSelected.add(familyId);
        }
        setSelectedFamilies(newSelected);
    };

    const toggleAllFamilies = () => {
        if (selectedFamilies.size === families.length) {
            setSelectedFamilies(new Set());
        } else {
            setSelectedFamilies(new Set(families.map(f => f.familyId)));
        }
    };

    const deleteBulkFamilies = async () => {
        if (selectedFamilies.size === 0) return;
        if (!confirm(`Delete ${selectedFamilies.size} selected family(ies)?`)) return;

        try {
            await smartpathService.families.deleteMultiple(Array.from(selectedFamilies));
            setSelectedFamilies(new Set());
            loadFamilies();
        } catch (error) {
            console.error('Failed to delete families:', error);
        }
    };

    const canRemoveMember = (family: any, member: any): boolean => {
        if (isAdmin) return true;
        if (!currentSmartPathUserId) return false;
        
        const currentUserRole = family.members?.find((m: any) => m.userId === currentSmartPathUserId)?.role;
        if (currentUserRole !== 'familyManager') return false;
        return member.role === 'familyMember';
    };

    const removeMember = async (familyId: number, targetUserId: number) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await smartpathService.families.removeMember(familyId, targetUserId);
            loadFamilies();
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="family-loading">Loading...</div>;
    }

    return (
        <div className="family-page container" data-testid="family-page">
            <header className="page-header" data-testid="family-header">
                <div>
                    <h1>Family</h1>
                    <p>Manage your family members</p>
                </div>
                <div className="header-actions" data-testid="family-header-actions">
                    {selectedFamilies.size > 0 && (
                        <ButtonComponent onClick={deleteBulkFamilies} variant="danger">
                            <Trash2 size={20} />
                            Delete {selectedFamilies.size}
                        </ButtonComponent>
                    )}
                    <ButtonComponent onClick={() => navigate('/family/new')} variant="primary">
                        <Plus size={20} />
                        Create Family
                    </ButtonComponent>
                </div>
            </header>

            <div className="families-grid" data-testid="families-grid">
                {families?.length === 0 ? (
                    <div className="empty-state" data-testid="families-empty-state">
                        <Users size={48} />
                        <p>No families yet.</p>
                        <p className="subtitle">Create your first family to get started!</p>
                    </div>
                ) : (
                    <>
                        <div className="select-all-row" data-testid="family-select-all-row">
                            <input
                                type="checkbox"
                                checked={selectedFamilies.size === families.length && families.length > 0}
                                onChange={toggleAllFamilies}
                                title="Select all families"
                                data-testid="family-select-all-checkbox"
                            />
                            <span>{selectedFamilies.size > 0 ? `${selectedFamilies.size} selected` : 'Select all'}</span>
                        </div>
                        {families?.map((family) => (
                            <div
                                key={family.familyId}
                                className={`family-detail-card ${selectedFamilies.has(family.familyId) ? 'selected' : ''}`}
                                data-testid={`family-card-${family.familyId}`}
                            >
                                <div className="family-card-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedFamilies.has(family.familyId)}
                                        onChange={() => toggleFamilySelection(family.familyId)}
                                    />
                                </div>
                                <div className="family-card-content">
                                    <div className="family-card-header">
                                        <h2>{family.familyName}</h2>
                                        <span className="member-count">{family.memberCount} members</span>
                                    </div>
                                    <div className="members-list">
                                        <h3>Members</h3>
                                        {family.members?.map((member: any) => {
                                            const roleLabel = member.role === 'familyManager' ? 'Family Manager' : 'Family Member';
                                            const age = member.dateOfBirth ? Math.floor((Date.now() - new Date(member.dateOfBirth).getTime()) / 31557600000) : null;
                                            return (
                                                <div key={member.familyMemberId} className="member-item">
                                                    <div className="member-info">
                                                        <strong>{member.userName}</strong>
                                                        <span className="role-badge">{roleLabel}</span>
                                                    </div>
                                                    <div className="member-actions">
                                                        {age !== null && (
                                                            <span className="member-age">
                                                                {age} years old
                                                            </span>
                                                        )}
                                                        {canRemoveMember(family, member) && (
                                                            <button
                                                                onClick={() => removeMember(family.familyId, member.userId)}
                                                                className="btn-remove-member"
                                                                title="Remove member"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="family-card-actions">
                                    <button
                                        onClick={() => {
                                            setSelectedFamilyForAddMember(family.familyId);
                                            setAddMemberModalOpen(true);
                                        }}
                                        className="btn-action btn-add-member"
                                        title="Add member"
                                    >
                                        <UserPlus size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/family/${family.familyId}/edit`)}
                                        className="btn-action btn-edit"
                                        title="Edit family"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteFamily(family.familyId)}
                                        className="btn-action btn-delete"
                                        title="Delete family"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {selectedFamilyForAddMember && (
                <AddMemberModal
                    familyId={selectedFamilyForAddMember}
                    isOpen={addMemberModalOpen}
                    onClose={() => {
                        setAddMemberModalOpen(false);
                        setSelectedFamilyForAddMember(null);
                    }}
                    onSuccess={loadFamilies}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
}