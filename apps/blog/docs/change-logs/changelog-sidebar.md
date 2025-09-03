---
id: changelog-sidebar
title: Creating and Styling Sidebars in Docusaurus
sidebar_label: Sidebar Implementation
description: Learn how to create, configure, and style sidebars in Docusaurus for better navigation and user experience
slug: /change-logs/changelog-sidebar
---

# Creating and Styling Sidebars in Docusaurus

Docusaurus provides a powerful and flexible sidebar system that helps organize your documentation and improve navigation. This guide covers everything you need to know about creating, configuring, and styling sidebars.

## Table of Contents

- [Basic Sidebar Configuration](#basic-sidebar-configuration)
- [Sidebar Structure](#sidebar-structure)
- [Customizing Sidebar Appearance](#customizing-sidebar-appearance)
- [Advanced Sidebar Features](#advanced-sidebar-features)
- [Responsive Sidebar Design](#responsive-sidebar-design)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Basic Sidebar Configuration

### 1. Sidebar Configuration File

Create a `sidebars.js` file in your Docusaurus project root:

```js:sidebars.js
const sidebars = {
  // Sidebar for the "docs" slice
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/basic-usage',
        'guides/advanced-features',
        'guides/troubleshooting',
      ],
    },
  ],
  
  // Sidebar for the "tutorial" slice
  tutorial: [
    'intro',
    {
      type: 'category',
      label: 'Tutorial',
      items: [
        'tutorial-basics/create-a-document',
        'tutorial-basics/create-a-blog-post',
        'tutorial-basics/markdown-features',
      ],
    },
  ],
};

module.exports = sidebars;
```

### 2. Docusaurus Configuration

Update your `docusaurus.config.js` to reference the sidebar:

```js:docusaurus.config.js
module.exports = {
  // ... other config
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // ... other docs options
        },
        // ... other presets
      },
    ],
  ],
};
```

## Sidebar Structure

### Sidebar Item Types

Docusaurus supports several sidebar item types:

#### 1. Document (`doc`)
```js
{
  type: 'doc',
  id: 'document-id',
  label: 'Document Title', // Optional, defaults to document title
}
```

#### 2. Category (`category`)
```js
{
  type: 'category',
  label: 'Category Name',
  items: [
    'document-id',
    'another-document',
    {
      type: 'category',
      label: 'Subcategory',
      items: ['sub-document'],
    },
  ],
}
```

#### 3. Link (`link`)
```js
{
  type: 'link',
  label: 'External Link',
  href: 'https://example.com',
}
```

#### 4. HTML (`html`)
```js
{
  type: 'html',
  value: '<div class="custom-sidebar-item">Custom HTML</div>',
  className: 'custom-sidebar-item',
}
```

### 5. Ref (`ref`)
```js
{
  type: 'ref',
  id: 'document-id',
}
```

## Customizing Sidebar Appearance

### 1. CSS Customization

Create custom CSS for your sidebar in `src/css/custom.css`:

```css:src/css/custom.css
/* Sidebar container */
.theme-doc-sidebar-container {
  background: var(--ifm-color-emphasis-100);
  border-right: 1px solid var(--ifm-color-emphasis-200);
}

/* Sidebar menu */
.menu__list {
  padding: 0;
  margin: 0;
}

/* Sidebar menu items */
.menu__list-item {
  margin: 0;
}

/* Sidebar menu links */
.menu__link {
  color: var(--ifm-color-emphasis-700);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  margin: 0.125rem 0.5rem;
  transition: all 0.2s ease;
}

.menu__link:hover {
  color: var(--ifm-color-primary);
  background: var(--ifm-color-emphasis-100);
  text-decoration: none;
}

/* Active menu item */
.menu__link--active {
  color: var(--ifm-color-primary);
  background: var(--ifm-color-primary-lightest);
  font-weight: 600;
}

/* Category labels */
.menu__list-item--collapsible .menu__link {
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
}

/* Collapsed category indicator */
.menu__caret {
  color: var(--ifm-color-emphasis-600);
}

/* Nested menu items */
.menu__list-item .menu__list-item .menu__link {
  padding-left: 2rem;
  font-size: 0.9em;
}

.menu__list-item .menu__list-item .menu__list-item .menu__link {
  padding-left: 3rem;
  font-size: 0.85em;
}
```

### 2. Theme Variables

Use Docusaurus theme variables for consistent styling:

```css:src/css/custom.css
:root {
  --sidebar-bg: var(--ifm-color-emphasis-50);
  --sidebar-border: var(--ifm-color-emphasis-200);
  --sidebar-item-hover: var(--ifm-color-emphasis-100);
  --sidebar-active: var(--ifm-color-primary-lightest);
}

/* Dark theme overrides */
[data-theme='dark'] {
  --sidebar-bg: var(--ifm-color-emphasis-900);
  --sidebar-border: var(--ifm-color-emphasis-800);
  --sidebar-item-hover: var(--ifm-color-emphasis-800);
  --sidebar-active: var(--ifm-color-primary-darkest);
}
```

### 3. Custom Sidebar Components

Create custom React components for advanced sidebar functionality:

```tsx:src/components/CustomSidebar/index.tsx
import React from 'react';
import { useLocation } from '@docusaurus/router';
import { useDocSidebarItemsExpandedState } from '@docusaurus/theme-common';
import styles from './CustomSidebar.module.css';

export default function CustomSidebar() {
  const location = useLocation();
  const { expandedState, setExpandedState } = useDocSidebarItemsExpandedState();
  
  return (
    <div className={styles.customSidebar}>
      <div className={styles.sidebarHeader}>
        <h3>Documentation</h3>
      </div>
      
      <nav className={styles.sidebarNav}>
        {/* Custom navigation logic */}
      </nav>
      
      <div className={styles.sidebarFooter}>
        <span>Last updated: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}
```

## Advanced Sidebar Features

### 1. Collapsible Categories

Enable collapsible categories in your sidebar configuration:

```js:sidebars.js
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Advanced Topics',
      collapsed: false, // Default expanded state
      collapsible: true, // Allow collapsing
      items: [
        'advanced/feature-1',
        'advanced/feature-2',
      ],
    },
  ],
};
```

### 2. Sidebar Position

Control sidebar position in your Docusaurus configuration:

```js:docusaurus.config.js
module.exports = {
  themeConfig: {
    docs: {
      sidebar: {
        hideable: true, // Allow hiding sidebar
        autoCollapseCategories: true, // Auto-collapse other categories
      },
    },
  },
};
```

### 3. Multiple Sidebars

Create different sidebars for different sections:

```js:sidebars.js
const sidebars = {
  docs: [
    // Documentation sidebar
  ],
  api: [
    // API reference sidebar
  ],
  tutorials: [
    // Tutorial sidebar
  ],
};
```

### 4. Dynamic Sidebar Generation

Generate sidebars programmatically:

```js:sidebars.js
const fs = require('fs');
const path = require('path');

function generateSidebarItems(dir) {
  const items = [];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      items.push({
        type: 'category',
        label: file.charAt(0).toUpperCase() + file.slice(1),
        items: generateSidebarItems(filePath),
      });
    } else if (file.endsWith('.md')) {
      items.push(file.replace('.md', ''));
    }
  });
  
  return items;
}

const sidebars = {
  docs: generateSidebarItems('./docs'),
};

module.exports = sidebars;
```

## Responsive Sidebar Design

### 1. Mobile-First Approach

Ensure your sidebar works well on mobile devices:

```css:src/css/custom.css
/* Mobile sidebar adjustments */
@media (max-width: 996px) {
  .theme-doc-sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .theme-doc-sidebar-container[data-sidebar-open="true"] {
    transform: translateX(0);
  }
  
  /* Mobile menu button */
  .sidebar-toggle {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
  }
}

/* Desktop sidebar */
@media (min-width: 997px) {
  .theme-doc-sidebar-container {
    position: sticky;
    top: var(--ifm-navbar-height);
    height: calc(100vh - var(--ifm-navbar-height));
    overflow-y: auto;
  }
  
  .sidebar-toggle {
    display: none;
  }
}
```

### 2. Smooth Transitions

Add smooth transitions for better user experience:

```css:src/css/custom.css
.theme-doc-sidebar-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu__link {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu__caret {
  transition: transform 0.2s ease;
}

.menu__list-item--collapsed .menu__caret {
  transform: rotate(-90deg);
}
```

## Best Practices

### 1. Sidebar Organization

- **Logical Grouping**: Group related documents together
- **Progressive Disclosure**: Use categories to organize complex documentation
- **Consistent Naming**: Use clear, descriptive labels
- **Depth Limitation**: Avoid nesting deeper than 3-4 levels

### 2. Performance Optimization

- **Lazy Loading**: Load sidebar items as needed
- **Minimal DOM**: Keep sidebar structure simple
- **Efficient CSS**: Use CSS selectors efficiently

### 3. Accessibility

- **Keyboard Navigation**: Ensure sidebar is keyboard accessible
- **Screen Reader Support**: Use proper ARIA labels
- **Focus Management**: Handle focus appropriately

### 4. User Experience

- **Clear Visual Hierarchy**: Use typography and spacing effectively
- **Consistent Interactions**: Maintain consistent hover and active states
- **Responsive Design**: Ensure sidebar works on all devices

## Troubleshooting

### Common Issues

#### 1. Sidebar Not Displaying

```bash
# Check if sidebars.js is properly configured
# Verify file paths in sidebar configuration
# Ensure docusaurus.config.js references the sidebar file
```

#### 2. Styling Not Applied

```css
/* Use more specific selectors */
.theme-doc-sidebar-container .menu__link {
  /* Your styles here */
}

/* Or use !important for critical styles */
.menu__link--active {
  background: var(--ifm-color-primary) !important;
}
```

#### 3. Mobile Sidebar Issues

```css
/* Ensure proper z-index */
.theme-doc-sidebar-container {
  z-index: 1000;
}

/* Check for conflicting CSS */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
```

### Debugging Tips

1. **Browser DevTools**: Inspect sidebar elements and CSS
2. **Console Logs**: Add logging to sidebar components
3. **Docusaurus Debug**: Enable debug mode in configuration
4. **Theme Override**: Use CSS custom properties for debugging

## Examples

### Complete Sidebar Configuration

```js:sidebars.js
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: '🚀 Getting Started',
    },
    {
      type: 'category',
      label: '📚 Core Concepts',
      collapsed: false,
      items: [
        'concepts/architecture',
        'concepts/components',
        'concepts/styling',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Development',
      items: [
        'development/setup',
        'development/workflow',
        'development/testing',
      ],
    },
    {
      type: 'category',
      label: '📖 API Reference',
      items: [
        'api/endpoints',
        'api/authentication',
        'api/errors',
      ],
    },
    {
      type: 'link',
      label: '🔗 External Resources',
      href: 'https://github.com/your-repo',
    },
  ],
};

module.exports = sidebars;
```

### Advanced Styling Example

```css:src/css/custom.css
/* Custom sidebar with gradient background */
.theme-doc-sidebar-container {
  background: linear-gradient(135deg, 
    var(--ifm-color-primary-lightest) 0%, 
    var(--ifm-color-emphasis-50) 100%);
  border-right: 2px solid var(--ifm-color-primary-light);
}

/* Custom category headers */
.menu__list-item--collapsible .menu__link {
  background: var(--ifm-color-primary-lightest);
  border-radius: 8px;
  margin: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--ifm-color-primary-darkest);
  border: 1px solid var(--ifm-color-primary-light);
}

/* Hover effects */
.menu__link:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Active state with animation */
.menu__link--active {
  background: var(--ifm-color-primary);
  color: white;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## Conclusion

Creating and styling sidebars in Docusaurus is a powerful way to improve your documentation's navigation and user experience. By following the best practices outlined in this guide, you can create professional, accessible, and responsive sidebars that enhance your documentation site.

Remember to:
- Plan your sidebar structure carefully
- Use consistent styling and theming
- Test on different devices and screen sizes
- Optimize for performance and accessibility
- Keep your sidebar organized and easy to navigate

For more advanced customization, explore the [Docusaurus documentation](https://docusaurus.io/docs) and [theme customization guide](https://docusaurus.io/docs/theme-customization).
