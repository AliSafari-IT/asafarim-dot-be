export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  userId?: string;
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  notes?: string;
}
