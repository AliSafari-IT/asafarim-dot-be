import { useState, useEffect, useRef } from 'react';
import type { JobApplication, JobStatus } from '../../types/jobTypes';
import { createJobApplication, updateJobApplication } from '../../api/jobService';
import { useNotifications } from '../../contexts/useNotifications';
import { useToast } from '@asafarim/toast';
import './JobForm.css';

interface JobFormProps {
  job?: JobApplication;
  onSave: () => void;
  onCancel: () => void;
}

const initialState: Omit<JobApplication, 'id'> = {
  company: '',
  role: '',
  status: 'Applied',
  appliedDate: new Date().toISOString().split('T')[0],
  notes: ''
};

const JobForm = ({ job, onSave, onCancel }: JobFormProps) => {
  const [formData, setFormData] = useState<Omit<JobApplication, 'id'> & { id?: string }>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();
  const toast = useToast();

  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        appliedDate: new Date(job.appliedDate).toISOString().split('T')[0]
      });
    }
  }, [job]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.appliedDate) newErrors.appliedDate = 'Applied date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setIsSubmitting(true);
      
      if (formData.id) {
        // Update existing job
        await updateJobApplication(formData as JobApplication);
        toast.success('Job application updated successfully');
        addNotification('success', 'Job application updated successfully');
      } else {
        // Create new job
        await createJobApplication(formData);
        toast.success('New job application created successfully');
        addNotification('success', 'New job application created successfully');
      }
      
      onSave();
    } catch (err) {
      console.error('Failed to save job application:', err);
      setErrors({ submit: 'Failed to save job application. Please try again.' });
      toast.error('Failed to save job application');
      addNotification('error', 'Failed to save job application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom dropdown state for Status
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusButtonRef = useRef<HTMLButtonElement | null>(null);
  const statusListRef = useRef<HTMLUListElement | null>(null);
  const statuses: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected'];

  const toggleStatusOpen = () => setIsStatusOpen((o) => !o);
  const closeStatus = () => setIsStatusOpen(false);
  const selectStatus = (value: JobStatus) => {
    setFormData((prev) => ({ ...prev, status: value }));
    closeStatus();
  };

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isStatusOpen) return;
      const btn = statusButtonRef.current;
      const list = statusListRef.current;
      if (btn && btn.contains(e.target as Node)) return;
      if (list && list.contains(e.target as Node)) return;
      closeStatus();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isStatusOpen]);

  // Basic keyboard support
  const onStatusKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsStatusOpen(true);
      // focus first selected/option handled by css/selection
    } else if (e.key === 'Escape') {
      closeStatus();
    }
  };

  return (
    <div className="job-form-container">
      <h2>{job ? 'Edit Job Application' : 'Add New Job Application'}</h2>
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            disabled={isSubmitting}
            className={errors.company ? 'error' : ''}
          />
          {errors.company && <span className="error-message">{errors.company}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isSubmitting}
            className={errors.role ? 'error' : ''}
          />
          {errors.role && <span className="error-message">{errors.role}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          {/* Custom themed dropdown to avoid native popup theming limitations */}
          <div className="custom-select" data-disabled={isSubmitting || undefined}>
            <button
              id="status"
              ref={statusButtonRef}
              type="button"
              className="custom-select__button"
              aria-haspopup="listbox"
              aria-expanded={isStatusOpen}
              onClick={toggleStatusOpen}
              onKeyDown={onStatusKeyDown}
              disabled={isSubmitting}
            >
              <span className="custom-select__label">{formData.status}</span>
              <span className="custom-select__chevron" aria-hidden>▾</span>
            </button>
            {isStatusOpen && (
              <ul
                ref={statusListRef}
                className="custom-select__list"
                role="listbox"
                aria-labelledby="status"
              >
                {statuses.map((s) => (
                  <li
                    key={s}
                    role="option"
                    aria-selected={formData.status === s}
                    className={
                      'custom-select__option' + (formData.status === s ? ' is-selected' : '')
                    }
                    onClick={() => selectStatus(s)}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="appliedDate">Applied Date</label>
          <input
            type="date"
            id="appliedDate"
            name="appliedDate"
            value={formData.appliedDate}
            onChange={handleChange}
            disabled={isSubmitting}
            className={errors.appliedDate ? 'error' : ''}
          />
          {errors.appliedDate && <span className="error-message">{errors.appliedDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="save-btn">
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
