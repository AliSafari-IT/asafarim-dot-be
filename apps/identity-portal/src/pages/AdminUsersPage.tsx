// AdminUsersPage.tsx

import AdminUsers from "../components/AdminUsers";
import AuthLayout from "../components/AuthLayout";

export default function AdminUsersPage() {
  return (
    <div data-testid="admin-users-page">
      <AuthLayout>
        <AdminUsers />
      </AuthLayout>
    </div>
  );
}
