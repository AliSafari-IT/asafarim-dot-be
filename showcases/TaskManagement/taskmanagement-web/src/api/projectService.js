import { API_BASE_URL } from '../config/api';
export var ProjectRole;
(function (ProjectRole) {
    ProjectRole[ProjectRole["Admin"] = 0] = "Admin";
    ProjectRole[ProjectRole["Manager"] = 1] = "Manager";
    ProjectRole[ProjectRole["Member"] = 2] = "Member";
})(ProjectRole || (ProjectRole = {}));
const projectService = {
    async getProject(id) {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to fetch project');
        return response.json();
    },
    async getMyProjects() {
        const response = await fetch(`${API_BASE_URL}/projects/my-projects`, {
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to fetch projects');
        return response.json();
    },
    async getSharedProjects() {
        const response = await fetch(`${API_BASE_URL}/projects/shared`, {
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to fetch shared projects');
        return response.json();
    },
    async createProject(dto) {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dto),
        });
        if (!response.ok)
            throw new Error('Failed to create project');
        return response.json();
    },
    async updateProject(id, dto) {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dto),
        });
        if (!response.ok)
            throw new Error('Failed to update project');
        return response.json();
    },
    async deleteProject(id) {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to delete project');
    },
    async getProjectMembers(projectId) {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to fetch project members');
        return response.json();
    },
    async addProjectMember(projectId, dto) {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dto),
        });
        if (!response.ok)
            throw new Error('Failed to add project member');
        return response.json();
    },
    async updateProjectMember(projectId, memberId, role) {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ role }),
        });
        if (!response.ok)
            throw new Error('Failed to update project member');
        return response.json();
    },
    async removeProjectMember(projectId, memberId) {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to remove project member');
    },
};
export default projectService;
