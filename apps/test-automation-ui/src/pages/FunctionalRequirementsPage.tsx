import { useState, useEffect } from 'react';
import { GenericCrudPage } from './GenericCrudPage';
import { ColumnDefinition } from '../components/GenericTable';
import { FormFieldDefinition } from '../components/GenericForm';
import { api } from '../config/api';

interface FunctionalRequirement {
  id: string;
  name: string;
  description?: string;
  projectName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Fixture {
  id: string;
  name: string;
  description?: string;
  pageUrl: string;
  functionalRequirementId: string;
}

export default function FunctionalRequirementsPage() {
  const [fixturesCache, setFixturesCache] = useState<Record<string, Fixture[]>>({});

  const fetchFixtures = async (functionalRequirementId: string) => {
    if (!fixturesCache[functionalRequirementId]) {
      try {
        const response = await api.get(`/api/fixtures?functionalRequirementId=${functionalRequirementId}`);
        setFixturesCache((prevCache) => ({ ...prevCache, [functionalRequirementId]: response.data }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Define table columns
  const columns: ColumnDefinition<FunctionalRequirement>[] = [
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Description',
      field: 'description',
    },
    {
      header: 'Project',
      field: 'projectName',
      render: (item) => item.projectName || '-',
    },
    {
      header: 'Status',
      align: 'center',
      render: (item) => (
        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  // Define form fields
  const formFields: FormFieldDefinition<FunctionalRequirement>[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
    },
    {
      name: 'projectName',
      label: 'Project Name',
      type: 'text',
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
    },
  ];

  const renderExpandedRow = (fr: FunctionalRequirement) => {
    const fixtures = fixturesCache[fr.id] || [];
    const isLoading = !(fr.id in fixturesCache);

    // Fetch fixtures if not cached
    if (isLoading) {
      api.get(`/api/fixtures?functionalRequirementId=${fr.id}`)
        .then((response) => {
          setFixturesCache((prev) => ({
            ...prev,
            [fr.id]: response.data || [],
          }));
        })
        .catch((error) => {
          console.error('Failed to fetch fixtures:', error);
          setFixturesCache((prev) => ({
            ...prev,
            [fr.id]: [],
          }));
        });
    }

    if (isLoading) {
      return (
        <div className="expanded-content">
          <h5>Related Test Fixtures</h5>
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-foreground-muted)' }}>
            Loading fixtures...
          </div>
        </div>
      );
    }

    if (fixtures.length === 0) {
      return (
        <div className="expanded-content">
          <h5>Related Test Fixtures</h5>
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-foreground-muted)' }}>
            No fixtures found for this functional requirement.
          </div>
        </div>
      );
    }

    return (
      <div className="expanded-content">
        <h5>Related Test Fixtures ({fixtures.length})</h5>
        <table className="nested-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Page URL</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((fixture) => (
              <tr key={fixture.id}>
                <td>{fixture.name}</td>
                <td>{fixture.description || '-'}</td>
                <td>
                  <a
                    href={fixture.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                  >
                    {fixture.pageUrl}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <GenericCrudPage<FunctionalRequirement>
      title="Functional Requirements"
      apiEndpoint="/api/functional-requirements"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: '',
        name: '',
        description: '',
        projectName: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      })}
      emptyMessage="No requirements found. Create one to get started."
      createButtonLabel="+ New Requirement"
      editFormTitle="Edit Requirement"
      createFormTitle="Create Requirement"
      renderExpandedRow={renderExpandedRow}
      expandLabel="View Fixtures"
    />
  );
}