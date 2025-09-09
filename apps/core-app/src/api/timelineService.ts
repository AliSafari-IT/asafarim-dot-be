import type { TimelineMilestone } from '../types/timelineTypes';
import { coreApi } from './config';

// Timeline Milestones API
export const fetchMilestonesByJob = async (jobId: string): Promise<TimelineMilestone[]> => {
  const response = await fetch(coreApi(`TimelineMilestones/job/${jobId}`));
  if (!response.ok) {
    throw new Error('Failed to fetch milestones');
  }
  return response.json();
};

export const fetchMilestoneById = async (id: string): Promise<TimelineMilestone> => {
  const response = await fetch(coreApi(`TimelineMilestones/${id}`));
  if (!response.ok) {
    throw new Error('Failed to fetch milestone');
  }
  return response.json();
};

export const createMilestone = async (milestone: Omit<TimelineMilestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimelineMilestone> => {
  const response = await fetch(coreApi('TimelineMilestones'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jobApplicationId: milestone.jobApplicationId,
      type: milestone.type,
      title: milestone.title,
      description: milestone.description,
      date: new Date(milestone.date).toISOString(),
      status: milestone.status,
      notes: milestone.notes,
      attachments: milestone.attachments,
      reminderDate: milestone.reminderDate ? new Date(milestone.reminderDate).toISOString() : null,
      color: milestone.color,
      icon: milestone.icon
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('Server response:', errorData);
    throw new Error(`Failed to create milestone: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const updateMilestone = async (id: string, milestone: Partial<TimelineMilestone>): Promise<void> => {
  const response = await fetch(coreApi(`TimelineMilestones/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: milestone.title,
      description: milestone.description,
      date: milestone.date ? new Date(milestone.date).toISOString() : undefined,
      status: milestone.status,
      notes: milestone.notes,
      attachments: milestone.attachments,
      reminderDate: milestone.reminderDate ? new Date(milestone.reminderDate).toISOString() : null,
      isCompleted: milestone.isCompleted,
      completedDate: milestone.completedDate ? new Date(milestone.completedDate).toISOString() : null
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('Server response:', errorData);
    throw new Error(`Failed to update milestone: ${response.status} ${response.statusText}`);
  }
};

export const deleteMilestone = async (id: string): Promise<void> => {
  const response = await fetch(coreApi(`TimelineMilestones/${id}`), {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('Server response:', errorData);
    throw new Error(`Failed to delete milestone: ${response.status} ${response.statusText}`);
  }
};

// Analytics API
export const fetchTimelineAnalytics = async () => {
  const response = await fetch(coreApi('TimelineMilestones/analytics'));
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
};

export const fetchJobProgress = async (jobId: string) => {
  const response = await fetch(coreApi(`TimelineMilestones/progress/${jobId}`));
  if (!response.ok) {
    throw new Error('Failed to fetch job progress');
  }
  return response.json();
};

export const fetchJobSearchInsights = async () => {
  const response = await fetch(coreApi('TimelineMilestones/insights'));
  if (!response.ok) {
    throw new Error('Failed to fetch job search insights');
  }
  return response.json();
};
