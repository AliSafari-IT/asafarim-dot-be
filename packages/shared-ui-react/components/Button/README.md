# Button Component

A versatile, accessible button component with multiple variants, sizes, and states. Built with centralized theme variables for consistent theming across light and dark modes.

## Features

- 🎨 **10 Variants**: primary, secondary, success, warning, danger, info, ghost, outline, link, brand
- 📏 **5 Sizes**: xs, sm, md, lg, xl
- 🔄 **Loading State**: Built-in loading spinner with disabled interaction
- 🎯 **Icon Support**: Left and/or right icons
- 📱 **Responsive**: Adapts to different screen sizes
- ♿ **Accessible**: Proper ARIA attributes and keyboard navigation
- 🌓 **Theme Aware**: Automatically adapts to light/dark themes
- 🎭 **Customizable**: FullWidth, rounded corners, and more modifiers

## Installation

```bash
npm install @asafarim/shared-ui-react
```

## Basic Usage

```tsx
import { Button } from '@asafarim/shared-ui-react';

function MyComponent() {
  return (
    <div>
      <Button>Default Button</Button>
      <Button variant="primary" size="lg">
        Large Primary Button
      </Button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'ghost' \| 'outline' \| 'link' \| 'brand'` | `'primary'` | Visual style variant |
| `to` | `string` | `undefined` | Internal route path (for React Router) |
| `href` | `string` | `undefined` | External URL for links |
| `target` | `string` | `undefined` | Link target (e.g., "_blank") |
| `rel` | `string` | `undefined` | Link rel attribute (e.g., "noopener noreferrer") |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `leftIcon` | `React.ReactNode` | `undefined` | Icon on the left side |
| `rightIcon` | `React.ReactNode` | `undefined` | Icon on the right side |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `rounded` | `boolean` | `false` | Rounded corners |
| `disabled` | `boolean` | `false` | Disables the button |
| `children` | `React.ReactNode` | - | Button content |

## Variants

### Primary
```tsx
<Button variant="primary">Primary Action</Button>
```
Default button style with primary color and subtle shadow.

### Secondary
```tsx
<Button variant="secondary">Secondary Action</Button>
```
Subtle button with border and background that adapts to theme.

### Success
```tsx
<Button variant="success">Save Changes</Button>
```
Green button for positive actions like save, confirm, etc.

### Warning
```tsx
<Button variant="warning">Proceed with Caution</Button>
```
Orange button for warnings or actions that need attention.

### Danger
```tsx
<Button variant="danger">Delete Item</Button>
```
Red button for destructive actions like delete, remove, etc.

### Info
```tsx
<Button variant="info">Learn More</Button>
```
Blue button for informational actions.

### Ghost
```tsx
<Button variant="ghost">Subtle Action</Button>
```
Transparent button that shows background on hover.

### Outline
```tsx
<Button variant="outline">Outlined Action</Button>
```
Button with outline border that fills on hover.

### Link
```tsx
<Button variant="link">Link Style Button</Button>
<Button variant="link" to="/dashboard">Internal Link</Button>
<Button variant="link" href="https://example.com" target="_blank">External Link</Button>
```
Text-only button that looks like a link with underline decoration. When using `to` or `href` props, it automatically renders as an anchor tag for proper navigation.

### Brand
```tsx
<Button variant="brand">Brand Action</Button>
```
Premium button with gradient background and shimmer effect on hover.

## Sizes

```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

## States

### Loading State
```tsx
<Button isLoading>Processing...</Button>
```
Shows a spinner and disables interaction while loading.

### Disabled State
```tsx
<Button disabled>Cannot Click</Button>
```
Button is visually disabled and cannot be interacted with.

## Icons

### Left Icon
```tsx
<Button leftIcon="🚀">Launch App</Button>
```

### Right Icon
```tsx
<Button rightIcon="➡️">Continue</Button>
```

### Both Icons
```tsx
<Button leftIcon="💾" rightIcon="✅">Save Changes</Button>
```

## Modifiers

### Full Width
```tsx
<Button fullWidth>Full Width Button</Button>
```

### Rounded
```tsx
<Button rounded>Rounded Button</Button>
```

## Link Behavior

When using `variant="link"` with navigation props, the button automatically renders as an anchor tag:

### Internal Navigation
```tsx
<Button variant="link" to="/dashboard">
  Go to Dashboard
</Button>
```

### External Links
```tsx
<Button variant="link" href="https://docs.example.com" target="_blank">
  View Documentation
</Button>
```

### With Icons
```tsx
<Button variant="link" to="/profile" leftIcon="👤">
  Edit Profile
</Button>
```

**Note**: The `to` prop is intended for React Router navigation, while `href` is for external URLs. Both will render the button as an anchor tag with proper link behavior.

## Examples

### Form Actions
```tsx
<div style={{ display: 'flex', gap: '1rem' }}>
  <Button variant="outline" onClick={handleCancel}>
    Cancel
  </Button>
  <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
    {isSaving ? 'Saving...' : 'Save Changes'}
  </Button>
</div>
```

### Navigation
```tsx
<Button variant="ghost" leftIcon="🏠" size="lg">
  Go Home
</Button>
```

### Link Actions
```tsx
<Button variant="link" leftIcon="🔗">
  View Documentation
</Button>
<Button variant="link" to="/settings" leftIcon="⚙️">
  Settings
</Button>
<Button variant="link" href="https://github.com" target="_blank" leftIcon="📚">
  GitHub Repository
</Button>
```

### Brand Actions
```tsx
<Button variant="brand" leftIcon="⭐" size="lg">
  Get Started
</Button>
```

### Destructive Action
```tsx
<Button 
  variant="danger" 
  leftIcon="🗑️"
  onClick={handleDelete}
  disabled={isDeleting}
>
  {isDeleting ? 'Deleting...' : 'Delete Account'}
</Button>
```

## Accessibility

The Button component includes:

- Proper `button` role and semantics
- Focus-visible outline for keyboard navigation
- Loading state announcements
- Support for `aria-label`, `aria-describedby`, and other ARIA attributes
- Reduced motion support for users with vestibular disorders
- High contrast mode support

```tsx
<Button 
  aria-label="Save document"
  aria-describedby="save-help"
>
  💾
</Button>
<div id="save-help">
  Saves the current document to your computer
</div>
```

## Theme Integration

The Button component automatically uses centralized theme variables:

- **Colors**: `var(--color-primary)`, `var(--color-success)`, etc.
- **Spacing**: `var(--spacing-sm)`, `var(--spacing-lg)`, etc.
- **Typography**: `var(--global-font-family-base)`, `var(--global-font-size-sm)`, etc.
- **Shadows**: `var(--global-shadow-sm)`, `var(--global-shadow-md)`, etc.
- **Transitions**: `var(--global-transition-fast)`

This ensures consistent theming across your entire application and automatic adaptation to light/dark themes.

## CSS Classes

The component uses BEM methodology for CSS classes:

- `.btn` - Base button class
- `.btn--{variant}` - Variant modifier (e.g., `.btn--primary`, `.btn--link`, `.btn--brand`)
- `.btn--{size}` - Size modifier (e.g., `.btn--lg`)
- `.btn--loading` - Loading state
- `.btn--disabled` - Disabled state
- `.btn--full-width` - Full width modifier
- `.btn--rounded` - Rounded modifier

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

When contributing to the Button component:

1. Ensure all variants work in both light and dark themes
2. Test accessibility with screen readers
3. Verify responsive behavior on different screen sizes
4. Use centralized theme variables for consistency
5. Add appropriate TypeScript types for new props

## License

MIT License - see LICENSE file for details.
