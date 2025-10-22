import { type ReactNode } from 'react';
import { getIsProduction } from '../../configs/isProduction';
import { useTranslation } from '@asafarim/shared-i18n';

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

// URL configuration for each app (production and development)
const appUrlConfig = {
  web: {
    production: 'https://asafarim.be',
    development: 'http://web.asafarim.local:5175'
  },
  blog: {
    production: 'https://blog.asafarim.be',
    development: 'http://blog.asafarim.local:3000'
  },
  ai: {
    production: 'https://ai.asafarim.be',
    development: 'http://ai.asafarim.local:5173'
  },
  core: {
    production: 'https://core.asafarim.be',
    development: 'http://core.asafarim.local:5174'
  },
  jobs: {
    production: 'https://core.asafarim.be/jobs',
    development: 'http://core.asafarim.local:5174/jobs'
  },
  identity: {
    production: 'https://identity.asafarim.be',
    development: 'http://identity.asafarim.local:5177'
  }
};

// Helper function to get URL at runtime
const getAppUrl = (appId: keyof typeof appUrlConfig): string => {
  const config = appUrlConfig[appId];
  return getIsProduction() ? config.production : config.development;
};

// React Hook for app registry with i18n support
// Use this in React components for translated app names and descriptions
export const useAppRegistry = (): AppInfo[] => {
  const { t } = useTranslation('common');
  
  return [
    {
      id: 'web',
      name: t('apps.appName.web'),
      url: getAppUrl('web'),
      description: t('apps.description.web')
    },
    {
      id: 'blog',
      name: t('apps.appName.blog'),
      url: getAppUrl('blog'),
      description: t('apps.description.blog')
    },
    {
      id: 'ai',
      name: t('apps.appName.ai'),
      url: getAppUrl('ai'),
      description: t('apps.description.ai')
    },
    {
      id: 'core',
      name: t('apps.appName.core'),
      url: getAppUrl('core'),
      description: t('apps.description.core')
    },
    {
      id: 'jobs',
      name: t('apps.appName.jobs'),
      url: getAppUrl('jobs'),
      description: t('apps.description.jobs')
    },
    {
      id: 'identity',
      name: t('apps.appName.identity'),
      url: getAppUrl('identity'),
      description: t('apps.description.identity')
    }
  ];
};

// Non-hook version for use outside React components (fallback to English)
// Use useAppRegistry() hook instead when possible for i18n support
export const getAppRegistry = (): AppInfo[] => [
  {
    id: 'web',
    name: 'ASafariM web',
    url: getAppUrl('web'),
    description: 'ASafariM web portal'
  },
  {
    id: 'blog',
    name: 'Blog & documentation',
    url: getAppUrl('blog'),
    description: 'Documentation and blog'
  },
  {
    id: 'ai',
    name: 'AI Tools',
    url: getAppUrl('ai'),
    description: 'AI-powered tools and services'
  },
  {
    id: 'core',
    name: 'Core App',
    url: getAppUrl('core'),
    description: 'Core application features'
  },
  {
    id: 'jobs',
    name: 'Job Applications',
    url: getAppUrl('jobs'),
    description: 'Job application tracking'
  },
  {
    id: 'identity',
    name: 'Identity Portal',
    url: getAppUrl('identity'),
    description: 'User management and authentication'
  }
];

// Maintain backward compatibility with direct array access
// Use a Proxy to ensure URLs are always evaluated at runtime, never at build time
export const appRegistry = new Proxy([] as AppInfo[], {
  get(_target, prop) {
    const registry = getAppRegistry();
    return (registry as any)[prop];
  },
  ownKeys() {
    return Reflect.ownKeys(getAppRegistry());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Reflect.getOwnPropertyDescriptor(getAppRegistry(), prop);
  },
  has(_target, prop) {
    return prop in getAppRegistry();
  }
});

// Helper function to get app info by ID
export const getAppById = (id: string): AppInfo | undefined => {
  return getAppRegistry().find(app => app.id === id);
};

// Helper function to get current app ID based on hostname
export const getCurrentAppId = (): string => {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;

  // Check for production domains first
  if (hostname === 'asafarim.be' || hostname === 'www.asafarim.be') return 'web';
  if (hostname === 'blog.asafarim.be') return 'blog';
  if (hostname === 'ai.asafarim.be') return 'ai';
  if (hostname === 'core.asafarim.be') return 'core';
  if (hostname === 'identity.asafarim.be') return 'identity';

  // Check for development domains
  if (hostname.startsWith('web.') || hostname.includes('web.asafarim.local')) return 'web';
  if (hostname.startsWith('blog.') || hostname.includes('blog.asafarim.local')) return 'blog';
  if (hostname.startsWith('ai.') || hostname.includes('ai.asafarim.local')) return 'ai';
  if (hostname.startsWith('core.') || hostname.includes('core.asafarim.local')) return 'core';
  if (hostname.startsWith('identity.') || hostname.includes('identity.asafarim.local')) return 'identity';

  // Default fallback
  return '';
};

// Debug logging for troubleshooting
if (typeof window !== 'undefined' && window.location.hostname.includes('blog')) {
  console.log('App Registry Debug:', {
    isProduction: getIsProduction(),
    currentHostname: window.location.hostname,
    currentAppId: getCurrentAppId(),
    blogApp: getAppRegistry().find(app => app.id === 'blog')
  });
}
