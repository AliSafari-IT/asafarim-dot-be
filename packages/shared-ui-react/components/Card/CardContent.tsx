// CardContent.tsx
import { cn } from '../../lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';


const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { CardContent };