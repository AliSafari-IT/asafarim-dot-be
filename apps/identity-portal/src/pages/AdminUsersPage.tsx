// AdminUsersPage.tsx

import AdminUsers from "../components/AdminUsers";
import AuthLayout from "../components/AuthLayout";

export default function AdminUsersPage() {
  return (
    <AuthLayout key="identity-portal-admin-users">
      <AdminUsers />
    </AuthLayout>
  );
}
