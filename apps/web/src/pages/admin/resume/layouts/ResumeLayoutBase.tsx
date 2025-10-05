import type { ResumeDetailDto } from '../../../../services/resumeApi';

export interface ResumeLayoutProps {
  resume: ResumeDetailDto;
  onLayoutChange?: (layout: string) => void;
  currentLayout?: string;
}

export type LayoutType = 'online' | 'print';

export const LAYOUT_OPTIONS: { value: LayoutType; label: string; description: string }[] = [
  { value: 'online', label: 'Online View', description: 'Full-featured interactive view' },
  { value: 'print', label: 'Print Ready', description: 'Optimized for printing' },
];

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const renderStars = (rating: number) => {
  return (
    <div className="skill-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
};
