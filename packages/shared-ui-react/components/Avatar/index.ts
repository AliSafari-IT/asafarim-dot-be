// Avatar Component Suite (Token-based, Google-inspired)
export { Avatar } from './AvatarComponent';
export { AvatarMenu } from './AvatarMenu';
export { AvatarWithMenu } from './AvatarWithMenu';
export { useAvatarMenuPosition } from './useAvatarMenuPosition';

// Radix UI Primitives (for fine-grained control)
export {
  Avatar as AvatarPrimitive,
  AvatarImage,
  AvatarFallback,
} from './Avatar';

// Types
export type {
  User,
  AvatarProps,
  AvatarSize,
  AvatarMenuProps,
  AvatarMenuItem,
  AvatarMenuSection,
  AvatarMenuPosition,
} from './types';

// Default export
export { Avatar as default } from './AvatarComponent';