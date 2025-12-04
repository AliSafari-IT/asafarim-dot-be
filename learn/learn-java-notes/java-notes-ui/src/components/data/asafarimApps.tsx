import type { AppLauncherItemType } from "@asafarim/shared-ui-react";
import {
  Docs,
  Tasks,
  Settings,
  Analytics,
  Users,
  isProduction,
  Website,
} from "@asafarim/shared-ui-react";

export const asafarimApps: AppLauncherItemType[] = [
  {
    id: 'identity',
    label: 'Identity',
    icon: <Users />,
    href: isProduction?'https://identity.asafarim.be':'http://identity.asafarim.local:5177',
    description: 'User management',
  },
  {
    id: 'core',
    label: 'Core App',
    icon: <Settings />,
    href: isProduction?'https://core.asafarim.be':'http://core.asafarim.local:5174',
    description: 'Main application',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <Tasks />,
    href: isProduction?'https://taskmanagement.asafarim.be':'http://taskmanagement.asafarim.local:5176',
    description: 'Project management',
  },
  {
    id: 'smartops',
    label: 'SmartOps',
    icon: <Analytics />,
    href: isProduction?'https://smartops.asafarim.be':'http://smartops.asafarim.local:5178',
    description: 'IoT Dashboard',
  },
  {
    id: 'testora',
    label: 'Testora',
    icon: <Docs />,
    href: isProduction?'https://testora.asafarim.be':'http://testora.asafarim.local:5181',
    description: 'Test automation',
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: <Docs />,
    href: isProduction?'https://blog.asafarim.be':'http://blog.asafarim.local:3000',
    description: 'Documentation',
  },
  {
    id: 'web-app',
    label: 'Web App',
    icon: <Website />,
    href: isProduction?'https://asafarim.be':'http://web.asafarim.local:5175',
    description: 'Base domain',
  },
];
