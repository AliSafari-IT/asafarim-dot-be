// ExampleFixturesPageWithGeneric.tsx - Example of using GenericCrudPage for Fixtures
import { GenericCrudPage } from "./GenericCrudPage";
import { ColumnDefinition } from "../components/GenericTable";
import { FormFieldDefinition } from "../components/GenericForm";
import { useEffect, useState } from "react";
import { api } from "../config/api";

interface Fixture {
  id: string;
  name: string;
  description?: string;
  functionalRequirementId: string;
  pageUrl: string;
  setupScript?: string;
  teardownScript?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FunctionalRequirement {
  id: string;
  name: string;
}

export default function FixturesPage() {
  const [frs, setFrs] = useState<FunctionalRequirement[]>([]);

  useEffect(() => {
    loadFRs();
  }, []);

  const loadFRs = async () => {
    try {
      const response = await api.get("/api/functional-requirements");
      setFrs(response.data);
    } catch (error) {
      console.error("Failed to load FRs:", error);
    }
  };

  const getFRName = (frId: string) => {
    return frs.find((fr) => fr.id === frId)?.name || "Unknown";
  };

  // Define table columns
  const columns: ColumnDefinition<Fixture>[] = [
    {
      header: "Name",
      field: "name",
    },
    {
      header: "Description",
      field: "description",
    },
    {
      header: "Functional Requirement",
      render: (item) => getFRName(item.functionalRequirementId) || "Unknown",
    },
    {
      header: "Page URL",
      field: "pageUrl",
    }
  ];

  // Define form fields
  const formFields: FormFieldDefinition<Fixture>[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 2,
    },
    {
      name: "functionalRequirementId",
      label: "Functional Requirement",
      type: "select",
      required: true,
      options: frs.map((fr) => ({ value: fr.id, label: fr.name })),
      placeholder: "Select a requirement",
    },
    {
      name: "pageUrl",
      label: "Page URL",
      type: "text",
      required: true,
      placeholder: "https://example.com",
    },
    {
      name: "setupScript",
      label: "Setup Script",
      type: "textarea",
      rows: 4,
      placeholder: "JavaScript code to run before tests",
    },
    {
      name: "teardownScript",
      label: "Teardown Script",
      type: "textarea",
      rows: 4,
      placeholder: "JavaScript code to run after tests",
    }
  ];

  return (
    <GenericCrudPage<Fixture>
      title="Fixtures"
      apiEndpoint="/api/fixtures"
      getItemId={(item) => item.id}
      columns={columns}
      formFields={formFields}
      getInitialFormData={() => ({
        id: "",
        name: "",
        description: "",
        functionalRequirementId: "",
        pageUrl: "",
        setupScript: "",
        teardownScript: "",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      })}
      // tableClassName="fixtures-table"
      // formClassName="fixture-form"
      emptyMessage="No fixtures found"
      createButtonLabel="+ New Fixture"
      editFormTitle="Edit Fixture"
      createFormTitle="Create Fixture"
    />
  );
}
