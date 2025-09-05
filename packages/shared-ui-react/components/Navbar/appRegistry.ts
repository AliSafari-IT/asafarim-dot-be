import { type ReactNode } from 'react';

export interface AppInfo {
  id: string;
  name: string;
  url: string;
  icon?: ReactNode;
  description?: string;
  logo?: string;
}

export interface AppLinkGroup {
  groupName: string;
  links: AppInfo[];
}

// Central registry of all applications in the ecosystem
export const appRegistry: AppInfo[] = [
  {
    id: 'web',
    name: 'Web Portal',
    url: 'http://web.asafarim.local:5175',
    description: 'Main web portal'
  },
  {
    id: 'blog',
    name: 'Blog',
    url: 'http://blog.asafarim.local:3000',
    description: 'Documentation and blog'
  },
  {
    id: 'ai',
    name: 'AI Tools',
    url: 'http://ai.asafarim.local:5173',
    description: 'AI-powered tools and services'
  },
  {
    id: 'core',
    name: 'Core App',
    url: 'http://core.asafarim.local:5174',
    description: 'Core application features'
  },
  {
    id: 'jobs',
    name: 'Job Applications',
    url: 'http://core.asafarim.local:5174/jobs',
    description: 'Job application tracking'
  },
  {
    id: 'identity',
    name: 'Identity Portal',
    url: 'http://identity.asafarim.local:5177',
    description: 'User management and authentication'
  }
];

// Organized app links by category
export const appLinkGroups: AppLinkGroup[] = [
  {
    groupName: 'Main Applications',
    links: appRegistry.filter(app => ['web', 'blog', 'ai', 'core'].includes(app.id))
  },
  {
    groupName: 'Tools',
    links: appRegistry.filter(app => ['jobs'].includes(app.id))
  },
  {
    groupName: 'Admin',
    links: appRegistry.filter(app => ['identity'].includes(app.id))
  }
];

// Helper function to get app info by ID
export const getAppById = (id: string): AppInfo | undefined => {
  return appRegistry.find(app => app.id === id);
};

// Helper function to get current app ID based on hostname
export const getCurrentAppId = (): string => {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  
  if (hostname.startsWith('web.')) return 'web';
  if (hostname.startsWith('blog.')) return 'blog';
  if (hostname.startsWith('ai.')) return 'ai';
  if (hostname.startsWith('core.')) return 'core';
  if (hostname.startsWith('identity.')) return 'identity';
  
  // Default fallback
  return '';
};
