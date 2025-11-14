// apps/test-automation-ui/src/pages/FixturesPage.tsx
import { GenericCrudPage } from "./GenericCrudPage";
import { ColumnDefinition } from "../components/GenericTable";
import { FormFieldDefinition } from "../components/GenericForm";
import { useEffect, useMemo, useState } from "react";
import { api } from "../config/api";

interface Fixture {
  id: string;
  name: string;
  description?: string;
  functionalRequirementId: string;
  pageUrl: string;
  
  // Fixture Hooks
  beforeHook?: string;
  afterHook?: string;
  beforeEachHook?: string;
  afterEachHook?: string;
  
  // Authentication
  httpAuthUsername?: string;
  httpAuthPassword?: string;
  
  // Scripts and Hooks
  clientScripts?: string;
  requestHooks?: string;
  metadata?: string;
  
  setupScript?: string;
  teardownScript?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
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
      width: "20%"
    },
    {
      header: "Description",
      field: "description",
      width: "25%"
    },
    {
      header: "Functional Requirement",
      render: (item) => getFRName(item.functionalRequirementId) || "Unknown",
      width: "15%"
    },
    {
      header: "Page URL",
      field: "pageUrl",
      width: "20%"
    },
    {
      header: "Hooks",
      render: (item) => {
        const hooks = [
          item.beforeHook && "Before",
          item.afterHook && "After",
          item.beforeEachHook && "Before Each",
          item.afterEachHook && "After Each"
        ].filter(Boolean);
        return hooks.length > 0 ? hooks.join(", ") : "None";
      },
      width: "20%"
    }
  ];

  // Define form fields
  const formFields: FormFieldDefinition<Fixture>[] = useMemo(() =>[
    // Basic Information
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      group: "Basic Information"
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 2,
      group: "Basic Information"
    },
    {
      name: "functionalRequirementId",
      label: "Functional Requirement",
      type: "select",
      required: true,
      options: frs.map((fr) => ({ value: fr.id, label: fr.name })),
      placeholder: "Select a requirement",
      group: "Basic Information"
    },
    {
      name: "pageUrl",
      label: "Page URL",
      type: "text",
      required: true,
      placeholder: "https://example.com",
      group: "Basic Information"
    },
    
    // Fixture Hooks
    {
      name: "beforeHook",
      label: "Before Hook",
      type: "textarea",
      rows: 3,
      placeholder: "Code to run before the first test in the fixture",
      group: "Fixture Hooks"
    },
    {
      name: "afterHook",
      label: "After Hook",
      type: "textarea",
      rows: 3,
      placeholder: "Code to run after the last test in the fixture",
      group: "Fixture Hooks"
    },
    {
      name: "beforeEachHook",
      label: "Before Each Hook",
      type: "textarea",
      rows: 3,
      placeholder: "Code to run before each test in the fixture",
      group: "Fixture Hooks"
    },
    {
      name: "afterEachHook",
      label: "After Each Hook",
      type: "textarea",
      rows: 3,
      placeholder: "Code to run after each test in the fixture",
      group: "Fixture Hooks"
    },
    
    // Authentication
    {
      name: "httpAuthUsername",
      label: "HTTP Auth Username",
      type: "text",
      placeholder: "username",
      group: "HTTP Authentication"
    },
    {
      name: "httpAuthPassword",
      label: "HTTP Auth Password",
      type: "password",
      placeholder: "••••••••",
      group: "HTTP Authentication"
    },
    
    // Scripts and Hooks
    {
      name: "clientScripts",
      label: "Client Scripts (JSON)",
      type: "textarea",
      rows: 4,
      placeholder: "JSON array of client scripts to inject",
      group: "Advanced Configuration"
    },
    {
      name: "requestHooks",
      label: "Request Hooks (JSON)",
      type: "textarea",
      rows: 4,
      placeholder: "JSON array of request hooks",
      group: "Advanced Configuration"
    },
    {
      name: "metadata",
      label: "Metadata (JSON)",
      type: "textarea",
      rows: 4,
      placeholder: "JSON object containing fixture metadata",
      group: "Advanced Configuration"
    },
    
    // Setup/Teardown Scripts
    {
      name: "setupScript",
      label: "Setup Script",
      type: "textarea",
      rows: 4,
      placeholder: "JavaScript code to run before tests",
      group: "Setup & Teardown"
    },
    {
      name: "teardownScript",
      label: "Teardown Script",
      type: "textarea",
      rows: 4,
      placeholder: "JavaScript code to run after tests",
      group: "Setup & Teardown"
    }
  ] , [frs]);

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
        
        // Fixture Hooks
        beforeHook: "",
        afterHook: "",
        beforeEachHook: "",
        afterEachHook: "",
        
        // Authentication
        httpAuthUsername: "",
        httpAuthPassword: "",
        
        // Scripts and Hooks
        clientScripts: "",
        requestHooks: "",
        metadata: "",
        
        setupScript: "",
        teardownScript: "",
        isActive: true,
        createdAt: "",
        updatedAt: "",
        createdById: "",
        updatedById: ""
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
