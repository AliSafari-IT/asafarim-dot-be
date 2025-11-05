# Generic CRUD Components

This folder contains reusable components for creating CRUD (Create, Read, Update, Delete) pages with minimal code duplication.

## Components

### 1. GenericTable

A reusable table component that can display any data model with customizable columns.

**Features:**

- Configurable columns with custom render functions
- Built-in Edit/Delete actions
- Loading and empty states
- Responsive design with horizontal scrolling
- Sticky first column on mobile

### 2. GenericForm

A reusable form component that can handle any data model with configurable fields.

**Features:**

- Support for multiple field types: text, textarea, number, select, checkbox, JSON
- Built-in validation
- Customizable labels and placeholders
- Responsive design

### 3. GenericCrudPage

A complete CRUD page template that combines GenericTable and GenericForm.

**Features:**

- Full CRUD operations (Create, Read, Update, Delete)
- API integration
- Form state management
- Error handling
- Customizable for any model

## Usage

### Basic Example

```tsx
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';

interface MyModel {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function MyModelPage() {
  const columns: ColumnDefinition<MyModel>[] = [
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    {
      header: 'Active',
      align: 'center',
      render: (item) => (
        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const formFields: FormFieldDefinition<MyModel>[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
  ];

  return (
    <GenericCrudPage<MyModel>
      title="My Models"
      apiEndpoint="/api/my-models"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        name: '',
        description: '',
        isActive: true,
      })}
    />
  );
}
```

### Advanced Example with Related Data

```tsx
import { useEffect, useState } from 'react';
import { GenericCrudPage } from './GenericCrudPage';
import { api } from '../config/api';

interface TestDataSet {
  id: string;
  testCaseId: string;
  name: string;
  data: any;
  isActive: boolean;
}

interface TestCase {
  id: string;
  name: string;
}

export default function TestDataSetsPage() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    api.get('/api/test-cases').then(res => setTestCases(res.data));
  }, []);

  const getTestCaseName = (id: string) => 
    testCases.find(tc => tc.id === id)?.name || 'Unknown';

  const columns: ColumnDefinition<TestDataSet>[] = [
    { header: 'Name', field: 'name' },
    { header: 'Test Case', render: (item) => getTestCaseName(item.testCaseId) },
    {
      header: 'Data',
      render: (item) => (
        <span className="json-preview" title={JSON.stringify(item.data)}>
          {JSON.stringify(item.data)}
        </span>
      ),
    },
  ];

  const formFields: FormFieldDefinition<TestDataSet>[] = [
    {
      name: 'testCaseId',
      label: 'Test Case',
      type: 'select',
      required: true,
      options: testCases.map(tc => ({ value: tc.id, label: tc.name })),
    },
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'data',
      label: 'Data (JSON)',
      type: 'json',
      required: true,
      rows: 6,
      placeholder: '{"key": "value"}',
    },
  ];

  return (
    <GenericCrudPage<TestDataSet>
      title="Test Data Sets"
      apiEndpoint="/api/test-data-sets"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        testCaseId: '',
        name: '',
        data: '{}',
        isActive: true,
      })}
      preparePayload={(formData) => ({
        ...formData,
        data: JSON.parse(formData.data as string),
      })}
      onItemLoaded={(item) => ({
        ...item,
        data: JSON.stringify(item.data, null, 2),
      })}
    />
  );
}
```

## Column Definition Options

```tsx
interface ColumnDefinition<T> {
  header: string;              // Column header text
  field?: keyof T;             // Field name to display (simple text)
  render?: (item: T) => React.ReactNode;  // Custom render function
  align?: 'left' | 'center' | 'right';    // Text alignment
  width?: string;              // Column width (e.g., '200px', '20%')
}
```

## Form Field Types

- **text**: Single-line text input
- **textarea**: Multi-line text input
- **number**: Numeric input with optional min/max
- **select**: Dropdown with options
- **checkbox**: Boolean checkbox
- **json**: JSON editor with monospace font

## Form Field Definition Options

```tsx
interface FormFieldDefinition<T> {
  name: keyof T;               // Field name
  label: string;               // Field label
  type: FormFieldType;         // Field type
  required?: boolean;          // Is field required?
  placeholder?: string;        // Placeholder text
  rows?: number;               // Rows for textarea/json
  options?: Array<{            // Options for select
    value: string | number;
    label: string;
  }>;
  min?: number;                // Min value for number
  max?: number;                // Max value for number
}
```

## GenericCrudPage Props

```tsx
interface GenericCrudPageProps<T> {
  title: string;                           // Page title
  apiEndpoint: string;                     // API endpoint (e.g., '/api/fixtures')
  getItemId: (item: T) => string;          // Function to get item ID
  columns: ColumnDefinition<T>[];          // Table column definitions
  formFields: FormFieldDefinition<T>[];    // Form field definitions
  getInitialFormData: () => T;             // Function to get initial form data
  preparePayload?: (formData: T) => any;   // Transform form data before API call
  onItemLoaded?: (item: T) => T;           // Transform item when loading for edit
  
  // Optional customization
  tableClassName?: string;                 // Custom table CSS class
  formClassName?: string;                  // Custom form CSS class
  emptyMessage?: string;                   // Empty state message
  createButtonLabel?: string;              // Create button label
  editFormTitle?: string;                  // Edit form title
  createFormTitle?: string;                // Create form title
}
```

## Styling

Import the generic styles in your page:

```tsx
import '../components/GenericTable.css';
```

Or use your own custom CSS classes by specifying `tableClassName` and `formClassName`.

## Examples

See the following example pages:
- `ExampleFixturesPageWithGeneric.tsx` - Simple model with text fields
- `ExampleTestDataSetsPageWithGeneric.tsx` - Model with JSON data and related entities
- `ExampleTestRunsPageWithGeneric.tsx` - Model with status badges and formatted data

## Benefits

1. **DRY (Don't Repeat Yourself)**: Write CRUD logic once, reuse everywhere
2. **Type Safety**: Full TypeScript support with generics
3. **Consistency**: Same UI/UX across all pages
4. **Maintainability**: Fix bugs or add features in one place
5. **Flexibility**: Highly customizable for different models
6. **Responsive**: Mobile-friendly out of the box
