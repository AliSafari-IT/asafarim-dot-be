import { API_BASE_URL } from '../config/api';
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["ToDo"] = 0] = "ToDo";
    TaskStatus[TaskStatus["InProgress"] = 1] = "InProgress";
    TaskStatus[TaskStatus["Done"] = 2] = "Done";
    TaskStatus[TaskStatus["Blocked"] = 3] = "Blocked";
    TaskStatus[TaskStatus["Archived"] = 4] = "Archived";
})(TaskStatus || (TaskStatus = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority[TaskPriority["Low"] = 0] = "Low";
    TaskPriority[TaskPriority["Medium"] = 1] = "Medium";
    TaskPriority[TaskPriority["High"] = 2] = "High";
    TaskPriority[TaskPriority["Critical"] = 3] = "Critical";
})(TaskPriority || (TaskPriority = {}));
const taskService = {
    async getTask(id) {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to fetch task');
        return response.json();
    },
    async getProjectTasks(projectId, filter) {
        const params = new URLSearchParams();
        if (filter?.status !== undefined)
            params.append('status', filter.status.toString());
        if (filter?.priority !== undefined)
            params.append('priority', filter.priority.toString());
        if (filter?.searchTerm)
            params.append('searchTerm', filter.searchTerm);
        if (filter?.dueDateFrom)
            params.append('dueDateFrom', filter.dueDateFrom);
        if (filter?.dueDateTo)
            params.append('dueDateTo', filter.dueDateTo);
        if (filter?.assignedUserId)
            params.append('assignedUserId', filter.assignedUserId);
        if (filter?.sortBy)
            params.append('sortBy', filter.sortBy);
        if (filter?.descending !== undefined)
            params.append('descending', filter.descending.toString());
        if (filter?.skip)
            params.append('skip', filter.skip.toString());
        if (filter?.take)
            params.append('take', filter.take.toString());
        const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}?${params}`, {
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to fetch tasks');
        return response.json();
    },
    async createTask(dto) {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dto),
        });
        if (!response.ok)
            throw new Error('Failed to create task');
        return response.json();
    },
    async updateTask(id, dto) {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dto),
        });
        if (!response.ok)
            throw new Error('Failed to update task');
        return response.json();
    },
    async updateTaskStatus(id, status) {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status }),
        });
        if (!response.ok)
            throw new Error('Failed to update task status');
        return response.json();
    },
    async deleteTask(id) {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error('Failed to delete task');
    },
};
export default taskService;
