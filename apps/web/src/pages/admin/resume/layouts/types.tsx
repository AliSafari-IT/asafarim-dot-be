import React from 'react';
import type { ResumeDetailDto } from '../../../../services/resumeApi';

export type LayoutType = 'online' | 'print';

export interface ResumeLayoutProps {
  resume: ResumeDetailDto;
  children?: React.ReactNode;
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
};

export const renderStars = (rating: number) => {
    return (
      <div className="skill-rating">
        {[1, 2, 3, 4, 5].map((star: number) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

export const renderDots = (rating: number, maxDots: number = 5) => {
  return (
    <div className="skill-dots">
      {Array.from({ length: maxDots }).map((_, index: number) => (
        <span key={index} className={index < rating ? 'dot filled' : 'dot'}></span>
      ))}
    </div>
  );
};
