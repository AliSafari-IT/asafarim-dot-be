import { api } from './notesApi';

// Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  locked: boolean;
  enabled: boolean;
  lockReason: string | null;
  lockedAt: string | null;
  lastLogin: string | null;
  lastLoginIp: string | null;
  failedLoginAttempts: number;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
  system: boolean;
  createdAt: string;
  permissions: string[];
  userCount: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  roleCount: number;
  usedByRoles: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  oldValue: string | null;
  newValue: string | null;
  severity: string;
  createdAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string | null;
  valueType: string;
  updatedAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  lockedUsers: number;
  disabledUsers: number;
  totalNotes: number;
  publicNotes: number;
  privateNotes: number;
  featuredNotes: number;
  totalTags: number;
  topTags: { name: string; count: number }[];
  failedLoginAttempts: number;
  mostActiveUsers: {
    username: string;
    displayName: string;
    noteCount: number;
    lastLogin: string | null;
  }[];
  totalAttachments: number;
  totalStorageBytes: number;
  userGrowth: { date: string; value: number }[];
  noteCreation: { date: string; value: number }[];
  visibilityDistribution: Record<string, number>;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ============ Users API ============

export const adminUsersApi = {
  getAll: (page = 0, size = 20) =>
    api.get<PageResponse<AdminUser>>(`/admin/users?page=${page}&size=${size}`),

  search: (query: string, page = 0, size = 20) =>
    api.get<PageResponse<AdminUser>>(`/admin/users/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`),

  getLocked: (page = 0, size = 20) =>
    api.get<PageResponse<AdminUser>>(`/admin/users/locked?page=${page}&size=${size}`),

  getDisabled: (page = 0, size = 20) =>
    api.get<PageResponse<AdminUser>>(`/admin/users/disabled?page=${page}&size=${size}`),

  getByRole: (roleName: string, page = 0, size = 20) =>
    api.get<PageResponse<AdminUser>>(`/admin/users/by-role/${roleName}?page=${page}&size=${size}`),

  getById: (id: string) =>
    api.get<AdminUser>(`/admin/users/${id}`),

  create: (data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    roles?: string[];
  }) => api.post<AdminUser>('/admin/users', data),

  update: (id: string, data: {
    displayName?: string;
    email?: string;
    roles?: string[];
  }) => api.put<AdminUser>(`/admin/users/${id}`, data),

  lock: (id: string, reason: string) =>
    api.post<AdminUser>(`/admin/users/${id}/lock`, { reason }),

  unlock: (id: string) =>
    api.post<AdminUser>(`/admin/users/${id}/unlock`),

  enable: (id: string) =>
    api.post<AdminUser>(`/admin/users/${id}/enable`),

  disable: (id: string) =>
    api.post<AdminUser>(`/admin/users/${id}/disable`),

  resetPassword: (id: string, newPassword: string, sendEmail = false) =>
    api.post(`/admin/users/${id}/reset-password`, { newPassword, sendEmail }),

  delete: (id: string) =>
    api.delete(`/admin/users/${id}`),

  impersonate: (id: string) =>
    api.post<string>(`/admin/users/${id}/impersonate`),
};

// ============ Roles API ============

export const adminRolesApi = {
  getAll: () =>
    api.get<AdminRole[]>('/admin/roles'),

  getById: (id: string) =>
    api.get<AdminRole>(`/admin/roles/${id}`),

  getByName: (name: string) =>
    api.get<AdminRole>(`/admin/roles/by-name/${name}`),

  create: (data: {
    name: string;
    description?: string;
    color?: string;
    permissions?: string[];
  }) => api.post<AdminRole>('/admin/roles', data),

  update: (id: string, data: {
    name?: string;
    description?: string;
    color?: string;
  }) => api.put<AdminRole>(`/admin/roles/${id}`, data),

  updatePermissions: (id: string, permissions: string[]) =>
    api.put<AdminRole>(`/admin/roles/${id}/permissions`, { permissions }),

  delete: (id: string) =>
    api.delete(`/admin/roles/${id}`),
};

// ============ Permissions API ============

export const adminPermissionsApi = {
  getAll: () =>
    api.get<Permission[]>('/admin/permissions'),

  getByCategory: () =>
    api.get<Record<string, Permission[]>>('/admin/permissions/by-category'),

  getCategories: () =>
    api.get<string[]>('/admin/permissions/categories'),

  getById: (id: string) =>
    api.get<Permission>(`/admin/permissions/${id}`),

  create: (data: {
    name: string;
    description?: string;
    category?: string;
  }) => api.post<Permission>('/admin/permissions', data),

  delete: (id: string) =>
    api.delete(`/admin/permissions/${id}`),
};

// ============ System API ============

export const adminSystemApi = {
  getStats: () =>
    api.get<SystemStats>('/admin/system/stats'),

  // Settings
  getAllSettings: () =>
    api.get<SystemSetting[]>('/admin/system/settings'),

  getSettingsByCategory: () =>
    api.get<Record<string, SystemSetting[]>>('/admin/system/settings/by-category'),

  getSetting: (key: string) =>
    api.get<SystemSetting>(`/admin/system/settings/${key}`),

  updateSetting: (key: string, value: string) =>
    api.put<SystemSetting>(`/admin/system/settings/${key}`, { value }),

  // Maintenance
  setMaintenanceMode: (enabled: boolean, announcement?: string) =>
    api.post('/admin/system/maintenance', { enabled, announcement }),

  getMaintenanceStatus: () =>
    api.get<{ maintenanceMode: boolean; announcement: string }>('/admin/system/maintenance'),

  // Audit Logs
  getLogs: (page = 0, size = 50) =>
    api.get<PageResponse<AuditLog>>(`/admin/system/logs?page=${page}&size=${size}`),

  searchLogs: (query: string, severity?: string, page = 0, size = 50) => {
    let url = `/admin/system/logs/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`;
    if (severity) url += `&severity=${severity}`;
    return api.get<PageResponse<AuditLog>>(url);
  },

  getLogsBySeverity: (severity: string, page = 0, size = 50) =>
    api.get<PageResponse<AuditLog>>(`/admin/system/logs/by-severity/${severity}?page=${page}&size=${size}`),

  getLogActions: () =>
    api.get<string[]>('/admin/system/logs/actions'),

  getLogEntityTypes: () =>
    api.get<string[]>('/admin/system/logs/entity-types'),
};

export default {
  users: adminUsersApi,
  roles: adminRolesApi,
  permissions: adminPermissionsApi,
  system: adminSystemApi,
};
