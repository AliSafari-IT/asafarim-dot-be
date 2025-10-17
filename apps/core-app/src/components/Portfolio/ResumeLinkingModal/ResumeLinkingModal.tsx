import React, { useState, useEffect } from 'react';
import type { ResumeLinkingModalProps, ProjectResumeLink } from '../../../types/portfolio.types';
import { ResumeSelector } from '../ResumeSelector/ResumeSelector';
import './ResumeLinkingModal.css';

export const ResumeLinkingModal: React.FC<ResumeLinkingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  currentLinks,
  availableResumes
}) => {
  const [selectedLinks, setSelectedLinks] = useState<ProjectResumeLink[]>(currentLinks);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update selected links when currentLinks change
  useEffect(() => {
    setSelectedLinks(currentLinks);
    setHasChanges(false);
  }, [currentLinks, isOpen]);

  // Check if there are changes
  useEffect(() => {
    const hasChanged = JSON.stringify(selectedLinks) !== JSON.stringify(currentLinks);
    setHasChanges(hasChanged);
  }, [selectedLinks, currentLinks]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedLinks);
      onClose();
    } catch (error) {
      console.error('Failed to save resume links:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedLinks(currentLinks);
    setHasChanges(false);
    onClose();
  };

  const handleSelectionChange = (links: ProjectResumeLink[]) => {
    setSelectedLinks(links);
  };

  if (!isOpen) return null;

  return (
    <div className="resume-linking-modal-overlay" onClick={handleCancel}>
      <div className="resume-linking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="resume-linking-modal-header">
          <h2 className="resume-linking-modal-title">
            Link "{project.title}" to Resume Sections
          </h2>
          <button
            className="resume-linking-modal-close"
            onClick={handleCancel}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="resume-linking-modal-body">
          <div className="resume-linking-modal-info">
            <p className="resume-linking-modal-description">
              Select work experience entries from your resumes to link with this project. 
              This helps organize your portfolio and shows which projects are associated with specific roles.
            </p>
            
            {project.description && (
              <div className="resume-linking-modal-project-preview">
                <h4>Project Summary:</h4>
                <p>{project.summary || project.description.substring(0, 200)}...</p>
              </div>
            )}
          </div>

          <ResumeSelector
            selectedResumes={selectedLinks}
            onSelectionChange={handleSelectionChange}
            userResumes={availableResumes}
            projectId={project.id}
            disabled={isSaving}
          />

          {selectedLinks.length === 0 && (
            <div className="resume-linking-modal-warning">
              ⚠️ No resume sections selected. This project will not appear in any resume-based portfolio views.
            </div>
          )}
        </div>

        <div className="resume-linking-modal-footer">
          <div className="resume-linking-modal-stats">
            <span className="resume-linking-modal-stat">
              {selectedLinks.length} link{selectedLinks.length !== 1 ? 's' : ''} selected
            </span>
            {hasChanges && (
              <span className="resume-linking-modal-changes-indicator">
                • Unsaved changes
              </span>
            )}
          </div>
          
          <div className="resume-linking-modal-actions">
            <button
              className="resume-linking-modal-button resume-linking-modal-button-secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="resume-linking-modal-button resume-linking-modal-button-primary"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? 'Saving...' : 'Save Links'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
