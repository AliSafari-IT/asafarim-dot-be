import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ASafariM Blog',
  tagline: 'Sharing my thoughts and experiences',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://blog.asafarim.be',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/logo.svg',
    navbar: {
      title: 'ASafariM',
      logo: {
        alt: 'ASafariM Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'dropdown',
          items: [
            {
              label: 'React Themes',
              href: 'https://www.npmjs.com/package/@asafarim/react-themes',
            },
            {
              label: 'Theme Switch',
              href: 'https://www.npmjs.com/package/@asafarim/themeswitch',
            },
            {
              label: 'Dropdown Menu',
              href: 'https://www.npmjs.com/package/@asafarim/dd-menu',
            },
            {
              label: 'React Privacy Consent',
              href: 'https://www.npmjs.com/package/@asafarim/react-privacy-consent',
            },
            {
              label: 'Markdown Utils',
              href: 'https://www.npmjs.com/package/@asafarim/markdown-utils',
            },
            {
              label: 'Sidebar',
              href: 'https://www.npmjs.com/package/@asafarim/sidebar',
            },
            {
              label: 'Display Code',
              href: 'https://www.npmjs.com/package/@asafarim/display-code',
            },
            {
              label: 'Markdown Explorer Viewer',
              href: 'https://www.npmjs.com/package/@asafarim/markdown-explorer-viewer',
            },
            {
              label: 'Project Card',
              href: 'https://www.npmjs.com/package/@asafarim/project-card',
            },
            {
              label: 'Paginated Project Grid',
              href: 'https://www.npmjs.com/package/@asafarim/paginated-project-grid',
            },
            {
              label: 'View All Packages',
              href: 'https://www.npmjs.com/~asafarim.be?activeTab=packages',
            },
          ],
          sidebarid: 'tutorialSidebar',
          position: 'left',
          label: 'NPM Packages',
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Current Projects',
          items: [
            {
              label: 'Pharmacy Management System',
              href: 'https://github.com/AliSafari-IT/igs-pharma',
            },
            {
              label: 'ASafariM Bibliography',
              href: 'https://github.com/AliSafari-IT/asafarim-bibliography',
            }
          ],
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
