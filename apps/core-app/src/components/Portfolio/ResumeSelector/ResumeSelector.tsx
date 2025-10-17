import React, { useState, useMemo } from 'react';
import type { ResumeSelectorProps, WorkExperienceMetadata } from '../../../types/portfolio.types';
import './ResumeSelector.css';

export const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  selectedResumes,
  onSelectionChange,
  userResumes,
  projectId,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Filter resumes based on search and type
  const filteredResumes = useMemo(() => {
    return userResumes.filter(resume => {
      const matchesSearch = resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.workExperiences.some(we => 
          we.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          we.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesType = filterType === 'all' || resume.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [userResumes, searchTerm, filterType]);

  const handleWorkExperienceToggle = (
    resumeId: string,
    resumeTitle: string,
    workExp: WorkExperienceMetadata
  ) => {
    const existingLink = selectedResumes.find(
      link => link.resumeId === resumeId && link.workExperienceId === workExp.id
    );

    if (existingLink) {
      // Remove the link
      onSelectionChange(
        selectedResumes.filter(link => 
          !(link.resumeId === resumeId && link.workExperienceId === workExp.id)
        )
      );
    } else {
      // Add the link
      onSelectionChange([
        ...selectedResumes,
        {
          projectId: projectId || '',
          resumeId,
          workExperienceId: workExp.id,
          resumeTitle,
          workExperienceTitle: `${workExp.position} at ${workExp.company}`,
          linkedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const isWorkExperienceSelected = (resumeId: string, workExpId: string) => {
    return selectedResumes.some(
      link => link.resumeId === resumeId && link.workExperienceId === workExpId
    );
  };

  const getResumeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      academic: '🎓 Academic',
      professional: '💼 Professional',
      freelance: '🚀 Freelance',
      general: '📄 General'
    };
    return labels[type] || type;
  };

  return (
    <div className={`resume-selector ${disabled ? 'disabled' : ''}`}>
      <div className="resume-selector-header">
        <label className="resume-selector-label">
          Link to Resume Sections
          <span className="resume-selector-count">
            ({selectedResumes.length} selected)
          </span>
        </label>
        <button
          type="button"
          className="resume-selector-toggle"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {isOpen ? '▼ Collapse' : '▶ Expand'}
        </button>
      </div>

      {isOpen && (
        <div className="resume-selector-content">
          {/* Search and Filter */}
          <div className="resume-selector-controls">
            <input
              type="text"
              className="resume-selector-search"
              placeholder="Search resumes or work experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={disabled}
            />
            <select
              className="resume-selector-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              disabled={disabled}
            >
              <option value="all">All Types</option>
              <option value="academic">Academic</option>
              <option value="professional">Professional</option>
              <option value="freelance">Freelance</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Resume List */}
          <div className="resume-selector-list">
            {filteredResumes.length === 0 ? (
              <div className="resume-selector-empty">
                {userResumes.length === 0 
                  ? 'No resumes found. Create a resume first.'
                  : 'No resumes match your search.'}
              </div>
            ) : (
              filteredResumes.map(resume => (
                <div key={resume.id} className="resume-selector-item">
                  <div className="resume-selector-item-header">
                    <span className="resume-selector-item-type">
                      {getResumeTypeLabel(resume.type)}
                    </span>
                    <h4 className="resume-selector-item-title">{resume.title}</h4>
                  </div>

                  {resume.workExperiences.length > 0 ? (
                    <div className="resume-selector-work-experiences">
                      {resume.workExperiences.map(workExp => (
                        <label
                          key={workExp.id}
                          className={`resume-selector-work-exp ${
                            isWorkExperienceSelected(resume.id, workExp.id) ? 'selected' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isWorkExperienceSelected(resume.id, workExp.id)}
                            onChange={() => handleWorkExperienceToggle(resume.id, resume.title, workExp)}
                            disabled={disabled}
                          />
                          <div className="resume-selector-work-exp-info">
                            <span className="resume-selector-work-exp-position">
                              {workExp.position}
                            </span>
                            <span className="resume-selector-work-exp-company">
                              {workExp.company}
                            </span>
                            <span className="resume-selector-work-exp-dates">
                              {new Date(workExp.startDate).toLocaleDateString()} - {
                                workExp.isCurrent 
                                  ? 'Present' 
                                  : workExp.endDate 
                                    ? new Date(workExp.endDate).toLocaleDateString()
                                    : 'N/A'
                              }
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="resume-selector-no-experiences">
                      No work experiences in this resume
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Selected Summary */}
          {selectedResumes.length > 0 && (
            <div className="resume-selector-summary">
              <h5>Selected Links:</h5>
              <div className="resume-selector-selected-list">
                {selectedResumes.map((link, index) => (
                  <div key={index} className="resume-selector-selected-item">
                    <span>{link.workExperienceTitle || link.resumeTitle}</span>
                    <button
                      type="button"
                      className="resume-selector-remove"
                      onClick={() => {
                        onSelectionChange(
                          selectedResumes.filter((_, i) => i !== index)
                        );
                      }}
                      disabled={disabled}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
