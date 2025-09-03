import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Built with centralized theme variables for consistent theming across light and dark modes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'ghost', 'outline'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the button',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in a loading state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Whether the button should take full width of its container',
    },
    rounded: {
      control: { type: 'boolean' },
      description: 'Whether the button should have rounded corners',
    },
    leftIcon: {
      control: { type: 'text' },
      description: 'Icon to display on the left side of the button',
    },
    rightIcon: {
      control: { type: 'text' },
      description: 'Icon to display on the right side of the button',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Button
export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="info">Info</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants with their default styling.',
      },
    },
  },
};

// All Sizes
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes from extra small to extra large.',
      },
    },
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button leftIcon="🚀">Launch</Button>
      <Button rightIcon="➡️">Continue</Button>
      <Button leftIcon="💾" rightIcon="✅">Save</Button>
      <Button leftIcon="📧" variant="outline">Send Email</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with left, right, or both icons for enhanced visual communication.',
      },
    },
  },
};

// Loading State
export const Loading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button isLoading>Loading...</Button>
      <Button isLoading variant="success">Saving...</Button>
      <Button isLoading variant="outline" size="lg">Processing...</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons in loading state with animated spinner and disabled interaction.',
      },
    },
  },
};

// Disabled State
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button disabled>Disabled</Button>
      <Button disabled variant="success">Disabled Success</Button>
      <Button disabled variant="outline">Disabled Outline</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled buttons that cannot be interacted with.',
      },
    },
  },
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <Button fullWidth>Full Width Button</Button>
      <br />
      <Button fullWidth variant="outline" size="lg">
        Large Full Width Outline
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-width buttons that span their container width.',
      },
    },
  },
};

// Rounded
export const Rounded: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Button rounded>Rounded</Button>
      <Button rounded variant="outline">Rounded Outline</Button>
      <Button rounded variant="ghost" size="lg">Large Rounded Ghost</Button>
    </div>
  ),
  parameters: {
    docs: {
        story: 'Buttons with rounded corners for a softer, more modern appearance.',
      },
    },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleIncrement = () => setCount(prev => prev + 1);
    
    const handleAsyncAction = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Count: {count}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button onClick={handleIncrement} variant="success">
            Increment (+)
          </Button>
          <Button onClick={() => setCount(0)} variant="danger">
            Reset
          </Button>
          <Button 
            onClick={handleAsyncAction} 
            isLoading={isLoading}
            variant="primary"
          >
            {isLoading ? 'Processing...' : 'Async Action'}
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive examples showing button functionality including state management and async actions.',
      },
    },
  },
};

// Accessibility Demo
export const Accessibility: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
      <Button aria-label="Save document">💾</Button>
      <Button aria-describedby="help-text">Help</Button>
      <div id="help-text" style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
        This button provides additional help information
      </div>
      <Button role="menuitem" aria-haspopup="true">Menu Item</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of accessible buttons with proper ARIA labels and roles.',
      },
    },
  },
};
