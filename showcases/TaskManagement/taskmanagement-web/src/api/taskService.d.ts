export interface TaskDto {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    assignments: TaskAssignmentDto[];
    commentCount: number;
    attachmentCount: number;
}
export interface CreateTaskDto {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    assignedUserIds?: string[];
}
export interface UpdateTaskDto {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    assignedUserIds?: string[];
}
export interface TaskAssignmentDto {
    id: string;
    userId: string;
    assignedAt: string;
}
export declare enum TaskStatus {
    ToDo = 0,
    InProgress = 1,
    Done = 2,
    Blocked = 3,
    Archived = 4
}
export declare enum TaskPriority {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}
export interface TaskFilterDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    searchTerm?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    assignedUserId?: string;
    sortBy?: string;
    descending?: boolean;
    skip?: number;
    take?: number;
}
declare const taskService: {
    getTask(id: string): Promise<TaskDto>;
    getProjectTasks(projectId: string, filter?: TaskFilterDto): Promise<TaskDto[]>;
    createTask(dto: CreateTaskDto): Promise<TaskDto>;
    updateTask(id: string, dto: UpdateTaskDto): Promise<TaskDto>;
    updateTaskStatus(id: string, status: TaskStatus): Promise<TaskDto>;
    deleteTask(id: string): Promise<void>;
};
export default taskService;
