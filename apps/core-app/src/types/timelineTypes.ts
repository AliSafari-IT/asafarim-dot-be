export type MilestoneType = 
  | 'resume_sent'
  | 'phone_screen_scheduled'
  | 'phone_screen_completed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'follow_up_sent'
  | 'feedback_received'
  | 'offer_negotiation_started'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'application_rejected'
  | 'custom';

export interface TimelineMilestone {
  id: string;
  jobApplicationId: string;
  type: MilestoneType;
  title: string;
  description?: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  notes?: string;
  attachments?: string;
  reminderDate?: string;
  isCompleted: boolean;
  completedDate?: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TimelineStage {
  name: string;
  milestones: MilestoneType[];
  color: string;
  description: string;
  isCompleted: boolean;
  progress: number; // 0-100
}

export interface JobTimeline {
  jobId: string;
  milestones: TimelineMilestone[];
  currentStage: string;
  overallProgress: number;
  lastUpdated: string;
  nextReminder?: string;
}

export interface TimelineAnalytics {
  totalApplications: number;
  averageTimeToOffer: number;
  successRate: number;
  mostResponsiveCompanies: string[];
  averageResponseTime: number;
  interviewSuccessRate: number;
}
