import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const config: Config = {
  title: "Blog",
  tagline: "Sharing my thoughts and experiences",
  favicon: "img/logo.svg",
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://blog.asafarim.be",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "AliSafari-IT", // Usually your GitHub org/user name.
  projectName: "asafarim-dot-be", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        pages: {
          path: "src/pages",
          routeBasePath: "",
          include: ["**/*.{js,jsx,ts,tsx,md,mdx}"],
          exclude: [
            "**/_*.{js,jsx,ts,tsx,md,mdx}",
            "**/_*/**",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__tests__/**",
          ],
          mdxPageComponent: "@theme/MDXPage",
          remarkPlugins: [require("./my-remark-plugin")],
          rehypePlugins: [],
          beforeDefaultRemarkPlugins: [],
          beforeDefaultRehypePlugins: [],
        },
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/AliSafari-IT/asafarim-dot-be/tree/main/apps/blog",
        },
        blog: {
          path: "blog",
          // Simple use-case: string editUrl
          // editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
          // Advanced use-case: functional editUrl
          editUrl: ({ locale, blogDirPath, blogPath, permalink }) =>
            `https://github.com/AliSafari-IT/asafarim-dot-be/edit/main/apps/blog/${blogDirPath}/${blogPath}`,
          editLocalizedFiles: false,
          blogTitle: "Blog title",
          blogDescription: "Blog",
          blogSidebarCount: 5,
          blogSidebarTitle: "All our posts",
          routeBasePath: "blog",
          include: ["**/*.{md,mdx}"],
          exclude: [
            "**/_*.{js,jsx,ts,tsx,md,mdx}",
            "**/_*/**",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__tests__/**",
          ],
          postsPerPage: 10,
          blogListComponent: "@theme/BlogListPage",
          blogPostComponent: "@theme/BlogPostPage",
          blogTagsListComponent: "@theme/BlogTagsListPage",
          blogTagsPostsComponent: "@theme/BlogTagsPostsPage",
          remarkPlugins: [require("./my-remark-plugin")],
          rehypePlugins: [],
          beforeDefaultRemarkPlugins: [],
          beforeDefaultRehypePlugins: [],
          truncateMarker: /<!--\s*(truncate)\s*-->/,
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom", "json"],
            title: "ASafariM Blog",
            description: "Sharing my thoughts and experiences",
            copyright: "Copyright © " + new Date().getFullYear() + " ASafariM",
            language: undefined,
            createFeedItems: async (params) => {
              const { blogPosts, defaultCreateFeedItems, ...rest } = params;
              return defaultCreateFeedItems({
                // keep only the 10 most recent blog posts in the feed
                blogPosts: blogPosts.filter((item, index) => index < 10),
                ...rest,
              });
            },
          },
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/logo.svg",
    navbar: {
      title: "ASafariM",
      logo: {
        alt: "ASafariM Logo",
        src: "/img/logo.svg",
      },
      items: [
        {
          type: "dropdown",
          items: [
            {
              label: "React Themes",
              href: "https://www.npmjs.com/package/@asafarim/react-themes",
            },
            {
              label: "Theme Switch",
              href: "https://www.npmjs.com/package/@asafarim/themeswitch",
            },
            {
              label: "Dropdown Menu",
              href: "https://www.npmjs.com/package/@asafarim/dd-menu",
            },
            {
              label: "React Privacy Consent",
              href: "https://www.npmjs.com/package/@asafarim/react-privacy-consent",
            },
            {
              label: "Markdown Utils",
              href: "https://www.npmjs.com/package/@asafarim/markdown-utils",
            },
            {
              label: "Sidebar",
              href: "https://www.npmjs.com/package/@asafarim/sidebar",
            },
            {
              label: "Display Code",
              href: "https://www.npmjs.com/package/@asafarim/display-code",
            },
            {
              label: "Markdown Explorer Viewer",
              href: "https://www.npmjs.com/package/@asafarim/markdown-explorer-viewer",
            },
            {
              label: "Project Card",
              href: "https://www.npmjs.com/package/@asafarim/project-card",
            },
            {
              label: "Paginated Project Grid",
              href: "https://www.npmjs.com/package/@asafarim/paginated-project-grid",
            },
            {
              label: "View All Packages",
              href: "https://www.npmjs.com/~asafarim.be?activeTab=packages",
            },
          ],
          sidebarid: "tutorialSidebar",
          position: "left",
          label: "NPM Packages",
        },
        {
          type: "dropdown",
          position: "left",
          label: "Current Projects",
          items: [
            {
              label: "Pharmacy Management System",
              href: "https://github.com/AliSafari-IT/igs-pharma",
            },
            {
              label: "ASafariM Bibliography",
              href: "https://github.com/AliSafari-IT/asafarim-bibliography",
            },
          ],
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/facebook/docusaurus",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Tutorial",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/users/10703628/ali-safari",
            },
            {
              label: "Discord",
              href: "https://discord.com/invite/ali-safari",
            },
            {
              label: "X",
              href: "https://x.com/asafarim",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/AliSafari-IT/asafarim-dot-be",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ASafariM, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  // Ensure our client module runs early to sync theme key
  clientModules: [require.resolve("./src/clientModules/themeKey.ts")],
  
  // Add theme preloader script to HTML head
  scripts: [
    {
      src: '/theme-preloader.js',
      async: false,
      defer: false,
    },
  ],
};

export default config;
