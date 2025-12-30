import { useState } from 'react';
import { Mail, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import smartpathService from '../api/smartpathService';
import './AddMemberModal.css';

interface AddMemberModalProps {
    familyId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isAdmin?: boolean;
}

export default function AddMemberModal({ familyId, isOpen, onClose, onSuccess, isAdmin = false }: AddMemberModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('familyMember');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await smartpathService.families.addMemberByEmail(familyId, {
                email: email.trim().toLowerCase(),
                role,
            });

            setSuccess(true);
            setEmail('');
            setRole('familyMember');

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to add member';

            if (err.response?.status === 404) {
                setError('User not found. Please check the email address.');
            } else if (err.response?.status === 409) {
                setError('This user is already a member of the family.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to add members to this family.');
            } else if (err.response?.status === 400) {
                setError(errorMessage);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} data-testid="add-member-modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="add-member-modal-content">
                <div className="modal-header" data-testid="add-member-modal-header">
                    <h2>Add Family Member</h2>
                    <button className="modal-close" onClick={onClose} data-testid="add-member-modal-close">×</button>
                </div>

                {success ? (
                    <div className="success-state" data-testid="add-member-success-state">
                        <CheckCircle size={48} />
                        <p>Member added successfully!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} data-testid="add-member-form" className="modal-form">
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={20} />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="member@example.com"
                                    disabled={loading}
                                    autoFocus
                                    data-testid="add-member-email-input"
                                />
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="form-group">
                                <label htmlFor="role">Role *</label>
                                <div className="input-wrapper">
                                    <Users size={18} />
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        disabled={loading}
                                        data-testid="add-member-role-select"
                                    >
                                        <option value="familyMember">Family Member</option>
                                        <option value="familyManager">Family Manager</option>
                                    </select>
                                </div>
                                <small>Admin can assign either role</small>
                            </div>
                        )}

                        <div className="modal-actions">
                            <ButtonComponent
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Member'}
                            </ButtonComponent>
                            <ButtonComponent
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </ButtonComponent>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
