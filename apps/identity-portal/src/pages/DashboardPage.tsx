// DashboardPage.tsx

import AuthLayout from "../components/AuthLayout";
import { Dashboard } from "../components/Dashboard";

export default function DashboardPage() {
  return (
    <AuthLayout
      title="Dashboard"
      subtitle="Welcome to the dashboard"
    >
      <Dashboard />
    </AuthLayout>
  );
}
