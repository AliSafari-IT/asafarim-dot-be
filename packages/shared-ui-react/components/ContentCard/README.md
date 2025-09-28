# ContentCard Component

A flexible and reusable card component for displaying various types of content such as projects, articles, publications, and reports.

## Features

- Multiple variants: project, article, publication, report, and default
- Responsive design with different size options
- Support for images or gradient backgrounds
- Tags and metrics display
- Clickable cards or separate action buttons
- Fully customizable with various props
- Dark mode support
- Accessibility features

## Usage

```tsx
import { ContentCard } from '@asafarim/shared-ui-react';

// Basic usage
<ContentCard 
  title="My Project" 
  description="A brief description of my project"
  link="/projects/my-project"
/>

// Publication example
<ContentCard
  variant="publication"
  title="Research Paper Title"
  subtitle="Author Names"
  meta="Journal Name, Year, Volume, Pages"
  description="Abstract of the research paper..."
  year="2025"
  metrics={[{ label: 'citations', value: 42 }]}
  tags={['Research', 'Topic']}
  link="https://example.com/publication"
  elevated
/>

// Clickable card
<ContentCard
  title="Click Me"
  description="This entire card is clickable"
  link="/some-page"
  clickable
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Title of the content card |
| `subtitle` | string | - | Subtitle or author information |
| `meta` | string | - | Publication date, journal name, or other secondary information |
| `description` | string | - | Main content or abstract |
| `link` | string | - | URL for the content, if clickable |
| `imageUrl` | string | - | Image URL for thumbnail |
| `useGradient` | boolean | false | Alternative to imageUrl, shows a colored gradient background |
| `tags` | string[] | [] | Tags or categories for the content |
| `metrics` | { label: string; value: string \| number }[] | [] | Citation count or other metrics |
| `variant` | 'project' \| 'article' \| 'publication' \| 'report' \| 'default' | 'default' | Content type |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Card size |
| `className` | string | - | Additional CSS classes |
| `fullWidth` | boolean | false | Whether the card should take full width |
| `elevated` | boolean | false | Whether the card should be elevated with shadow |
| `bordered` | boolean | true | Whether to show a border |
| `actionButton` | ReactNode | - | Custom action button |
| `icon` | ReactNode | - | Icon to display next to title |
| `year` | string \| number | - | Year of publication or creation |
| `clickable` | boolean | false | Whether the card is clickable as a whole |
| `featured` | boolean | false | Whether the card is featured |
| `headerContent` | ReactNode | - | Custom header content |
| `footerContent` | ReactNode | - | Custom footer content |

## Examples

See `ContentCardExample.tsx` for more usage examples.

## Customization

The component uses CSS variables from the shared-tokens package for theming. You can override these variables in your application to customize the appearance of the cards.

## Accessibility

- Cards with `clickable` prop use proper anchor tags for keyboard navigation
- External links include appropriate `rel` attributes
- Proper contrast ratios for text content
- Support for high contrast mode and reduced motion preferences
