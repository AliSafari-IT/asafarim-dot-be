import type { AppLauncherItemType } from "@asafarim/shared-ui-react";
import {
  Docs,
  Tasks,
  Settings,
  Analytics,
  Users,
} from "@asafarim/shared-ui-react";

export const asafarimApps: AppLauncherItemType[] = [
  {
    id: 'identity',
    label: 'Identity',
    icon: <Users />,
    href: 'http://identity.asafarim.local:5177',
    description: 'User management',
  },
  {
    id: 'core',
    label: 'Core App',
    icon: <Settings />,
    href: 'http://core.asafarim.local:5175',
    description: 'Main application',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <Tasks />,
    href: 'http://taskmanagement.asafarim.local:5176',
    description: 'Project management',
  },
  {
    id: 'smartops',
    label: 'SmartOps',
    icon: <Analytics />,
    href: 'http://smartops.asafarim.local:5180',
    description: 'IoT Dashboard',
  },
  {
    id: 'testora',
    label: 'Testora',
    icon: <Docs />,
    href: 'http://testora.asafarim.local:5181',
    description: 'Test automation',
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: <Docs />,
    href: 'http://blog.asafarim.local:3000',
    description: 'Documentation',
  },
];
