// AdminUsersPage.tsx

import AdminUsers from "../components/AdminUsers";
import AuthLayout from "../components/AuthLayout";

export default function AdminUsersPage() {
  return (
    <AuthLayout
      title="Admin Users"
      subtitle="Manage users"
    >
      <AdminUsers />
    </AuthLayout>
  );
}
