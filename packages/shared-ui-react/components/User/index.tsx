// packages/shared-ui-react/components/User/index.tsx
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { forwardRef, HTMLAttributes } from 'react';

export interface UserProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  email?: string;
  avatar?: string;
  className?: string;
}

const User = forwardRef<HTMLDivElement, UserProps>(
  ({ name, email, avatar, className, ...props }, ref) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            ref={ref}
            className={cn(
              'flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors',
              className
            )}
            {...props}
          >
            <Avatar className="h-8 w-8">
              {avatar && <AvatarImage src={avatar} alt={name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">{name}</span>
              {email && (
                <span className="text-xs text-muted-foreground">{email}</span>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="flex flex-col gap-2">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{name}</p>
              {email && (
                <p className="text-xs text-muted-foreground">{email}</p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

User.displayName = 'User';

export { User };