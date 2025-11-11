// Card.tsx
import { cn } from '../../lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';


interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          variant === 'outlined' ? 'border-border' : 'border-transparent',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export { Card };