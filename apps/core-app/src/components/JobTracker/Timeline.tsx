import { useState, useMemo } from 'react';
import type { TimelineMilestone, TimelineStage, MilestoneType } from '../../types/timelineTypes';
import type { JobApplication } from '../../types/jobTypes';
import './Timeline.css';
import { ButtonComponent as Button } from '@asafarim/shared-ui-react';

interface TimelineProps {
  job: JobApplication;
  milestones: TimelineMilestone[];
  onMilestoneUpdate: (milestone: TimelineMilestone) => void;
  onMilestoneAdd: (milestone: Omit<TimelineMilestone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onMilestoneDelete: (milestoneId: string) => void;
}

const Timeline = ({
  job,
  milestones,
  onMilestoneUpdate,
  onMilestoneAdd,
  onMilestoneDelete
}:TimelineProps) => {
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineMilestone | null>(null);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneType, setNewMilestoneType] = useState<MilestoneType>('custom');
  const [newMilestoneDate, setNewMilestoneDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Define timeline stages with their milestones
  const timelineStages: TimelineStage[] = useMemo(() => [
    {
      name: 'Application',
      milestones: ['resume_sent'],
      color: '#3b82f6',
      description: 'Initial application submitted',
      isCompleted: milestones.some(m => m.type === 'resume_sent' && m.isCompleted),
      progress: milestones.some(m => m.type === 'resume_sent' && m.isCompleted) ? 100 : 0
    },
    {
      name: 'Screening',
      milestones: ['phone_screen_scheduled', 'phone_screen_completed'],
      color: '#8b5cf6',
      description: 'Phone screening phase',
      isCompleted: milestones.some(m => m.type === 'phone_screen_completed' && m.isCompleted),
      progress: calculateStageProgress(['phone_screen_scheduled', 'phone_screen_completed'])
    },
    {
      name: 'Interview',
      milestones: ['interview_scheduled', 'interview_completed'],
      color: '#f59e0b',
      description: 'Main interview process',
      isCompleted: milestones.some(m => m.type === 'interview_completed' && m.isCompleted),
      progress: calculateStageProgress(['interview_scheduled', 'interview_completed'])
    },
    {
      name: 'Follow-up',
      milestones: ['follow_up_sent', 'feedback_received'],
      color: '#10b981',
      description: 'Post-interview communication',
      isCompleted: milestones.some(m => m.type === 'feedback_received' && m.isCompleted),
      progress: calculateStageProgress(['follow_up_sent', 'feedback_received'])
    },
    {
      name: 'Offer',
      milestones: ['offer_negotiation_started', 'offer_received', 'offer_accepted', 'offer_declined'],
      color: '#ef4444',
      description: 'Offer and negotiation',
      isCompleted: milestones.some(m => ['offer_accepted', 'offer_declined'].includes(m.type) && m.isCompleted),
      progress: calculateStageProgress(['offer_negotiation_started', 'offer_received', 'offer_accepted', 'offer_declined'])
    }
  ], []);

  function calculateStageProgress(stageMilestones: MilestoneType[]): number {
    const stageMilestoneIds = stageMilestones.map(type =>
      milestones.find(m => m.type === type)?.id
    ).filter(Boolean);

    if (stageMilestoneIds.length === 0) return 0;

    const completedCount = stageMilestoneIds.filter(id =>
      milestones.find(m => m.id === id)?.isCompleted
    ).length;

    return Math.round((completedCount / stageMilestoneIds.length) * 100);
  }

  const overallProgress = useMemo(() => {
    const totalStages = timelineStages.length;
    const completedStages = timelineStages.filter(stage => stage.isCompleted).length;
    return Math.round((completedStages / totalStages) * 100);
  }, []);

  const getMilestoneConfig = (type: MilestoneType) => {
    const configs = {
      resume_sent: { title: 'Resume Sent', icon: '📄', color: '#3b82f6' },
      phone_screen_scheduled: { title: 'Phone Screen Scheduled', icon: '📞', color: '#8b5cf6' },
      phone_screen_completed: { title: 'Phone Screen Completed', icon: '✅', color: '#8b5cf6' },
      interview_scheduled: { title: 'Interview Scheduled', icon: '🗓️', color: '#f59e0b' },
      interview_completed: { title: 'Interview Completed', icon: '🎯', color: '#f59e0b' },
      follow_up_sent: { title: 'Follow-up Sent', icon: '📨', color: '#10b981' },
      feedback_received: { title: 'Feedback Received', icon: '💬', color: '#10b981' },
      offer_negotiation_started: { title: 'Negotiation Started', icon: '🤝', color: '#ef4444' },
      offer_received: { title: 'Offer Received', icon: '🎉', color: '#ef4444' },
      offer_accepted: { title: 'Offer Accepted', icon: '🎊', color: '#22c55e' },
      offer_declined: { title: 'Offer Declined', icon: '❌', color: '#ef4444' },
      application_rejected: { title: 'Application Rejected', icon: '🚫', color: '#ef4444' },
      custom: { title: 'Custom Milestone', icon: '⭐', color: '#6b7280' }
    };
    return configs[type] || configs.custom;
  };

  const handleAddMilestone = () => {
    const config = getMilestoneConfig(newMilestoneType);
    const newMilestone: Omit<TimelineMilestone, 'id' | 'createdAt' | 'updatedAt'> = {
      jobApplicationId: job.id,
      type: newMilestoneType,
      title: config.title,
      date: newMilestoneDate,
      status: 'pending',
      isCompleted: false,
      color: config.color,
      icon: config.icon,
      notes: '',
      attachments: ''
    };
    onMilestoneAdd(newMilestone);
    setIsAddingMilestone(false);
    setNewMilestoneType('custom');
    setNewMilestoneDate(new Date().toISOString().split('T')[0]); // Reset to today's date
  };

  const handleMilestoneToggle = (milestone: TimelineMilestone) => {
    const updated = {
      ...milestone,
      isCompleted: !milestone.isCompleted,
      completedDate: !milestone.isCompleted ? new Date().toISOString() : undefined
    };
    onMilestoneUpdate(updated);
  };

  return (
    <div className="timeline-container">
      {/* Progress Overview */}
      <div className="timeline-overview">
        <div className="overview-header">
          <h3>Application Progress</h3>
          <div className="progress-stats">
            <span className="progress-percentage">{overallProgress}%</span>
            <span className="progress-label">Complete</span>
          </div>
        </div>
        <div className="overall-progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline Stages */}
      <div className="timeline-stages">
        {timelineStages.map((stage, index) => (
          <div key={stage.name} className={`timeline-stage ${stage.isCompleted ? 'completed' : ''}`}>
            <div className="stage-header">
              <div className="stage-indicator" style={{ backgroundColor: stage.color }}>
                <span className="stage-number">{index + 1}</span>
              </div>
              <div className="stage-info">
                <h4 className="stage-name">{stage.name}</h4>
                <p className="stage-description">{stage.description}</p>
                <div className="stage-progress">
                  <div className="stage-progress-bar">
                    <div
                      className="stage-progress-fill"
                      style={{ width: `${stage.progress}%`, backgroundColor: stage.color }}
                    ></div>
                  </div>
                  <span className="stage-progress-text">{stage.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Milestones */}
      <div className="milestones-section">
        <div className="milestones-header">
          <h3>Milestones & Events</h3>
          <Button
            variant="info"
            onClick={() => {
              setIsAddingMilestone(true);
              setNewMilestoneDate(new Date().toISOString().split('T')[0]); // Reset to today's date when opening form
            }}
          >
            + Add Milestone
          </Button>
        </div>

        {/* Add Milestone Form */}
        {isAddingMilestone && (
          <div className="add-milestone-form">
            <div className="form-row">
              <select
                value={newMilestoneType}
                onChange={(e) => setNewMilestoneType(e.target.value as MilestoneType)}
                className="milestone-type-select"
              >
                <option value="resume_sent">📄 Resume Sent</option>
                <option value="phone_screen_scheduled">📞 Phone Screen Scheduled</option>
                <option value="phone_screen_completed">✅ Phone Screen Completed</option>
                <option value="interview_scheduled">🗓️ Interview Scheduled</option>
                <option value="interview_completed">🎯 Interview Completed</option>
                <option value="follow_up_sent">📨 Follow-up Sent</option>
                <option value="feedback_received">💬 Feedback Received</option>
                <option value="offer_negotiation_started">🤝 Negotiation Started</option>
                <option value="offer_received">🎉 Offer Received</option>
                <option value="offer_accepted">🎊 Offer Accepted</option>
                <option value="offer_declined">❌ Offer Declined</option>
                <option value="application_rejected">🚫 Application Rejected</option>
                <option value="custom">⭐ Custom Milestone</option>
              </select>
              <input
                type="date"
                className="milestone-date-input"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <Button onClick={handleAddMilestone} variant="success">Add</Button>
              <Button onClick={() => setIsAddingMilestone(false)} variant="danger">Cancel</Button>
            </div>
          </div>
        )}

        {/* Milestones List */}
        <div className="milestones-list">
          {milestones.length === 0 ? (
            <div className="no-milestones">
              <p>No milestones yet. Add your first milestone to start tracking your progress!</p>
            </div>
          ) : (
            milestones
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className={`milestone-item ${milestone.isCompleted ? 'completed' : ''} ${milestone.status}`}
                >
                  <div className="milestone-header">
                    <div className="milestone-icon" style={{ backgroundColor: milestone.color }}>
                      {milestone.icon}
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title">
                        <span className="milestone-text">{milestone.title}</span>
                        <span className="milestone-date">
                          {new Date(milestone.date).toLocaleDateString()}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="milestone-description">{milestone.description}</p>
                      )}
                    </div>
                    <div className="milestone-actions">
                      <Button
                        variant="ghost"
                        className={` ${milestone.isCompleted ? 'completed' : ''}`}
                        onClick={() => handleMilestoneToggle(milestone)}
                        title={milestone.isCompleted ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {milestone.isCompleted ? '✅' : '⭕'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedMilestone(milestone)}
                        title="Edit milestone"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => onMilestoneDelete(milestone.id)}
                        title="Delete milestone"
                        children={<span>🗑️</span>}
                      />
                    </div>
                  </div>

                  {milestone.notes && (
                    <div className="milestone-notes">
                      <strong>Notes:</strong> {milestone.notes}
                    </div>
                  )}

                  {milestone.attachments && milestone.attachments.trim() !== '' && (
                    <div className="milestone-attachments">
                      <strong>Attachments:</strong>
                      <div className="attachments-list">
                        {milestone.attachments.split(',').map((attachment, index) => (
                          <span key={index} className="attachment-tag">{attachment.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Milestone Edit Modal */}
      {selectedMilestone && (
        <div className="milestone-modal-overlay" onClick={() => setSelectedMilestone(null)}>
          <div className="milestone-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Milestone</h3>
              <button onClick={() => setSelectedMilestone(null)} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={selectedMilestone.title}
                  onChange={(e) => setSelectedMilestone({
                    ...selectedMilestone,
                    title: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={selectedMilestone.date}
                  onChange={(e) => setSelectedMilestone({
                    ...selectedMilestone,
                    date: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={selectedMilestone.notes || ''}
                  onChange={(e) => setSelectedMilestone({
                    ...selectedMilestone,
                    notes: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={selectedMilestone.status}
                  onChange={(e) => setSelectedMilestone({
                    ...selectedMilestone,
                    status: e.target.value as TimelineMilestone['status']
                  })}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <Button
                onClick={() => {
                  onMilestoneUpdate(selectedMilestone);
                  setSelectedMilestone(null);
                }}
                variant="success"
              >
                Save Changes
              </Button>
              <Button onClick={() => setSelectedMilestone(null)} variant='danger'>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
