export interface ProjectDto {
    id: string;
    name: string;
    description?: string;
    userId: string;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
    taskCount: number;
    memberCount: number;
}
export interface CreateProjectDto {
    name: string;
    description?: string;
    isPrivate?: boolean;
}
export interface UpdateProjectDto {
    name: string;
    description?: string;
    isPrivate: boolean;
}
export interface ProjectMemberDto {
    id: string;
    projectId: string;
    userId: string;
    role: ProjectRole;
    joinedAt: string;
}
export interface AddProjectMemberDto {
    userId: string;
    role?: ProjectRole;
}
export declare enum ProjectRole {
    Admin = 0,
    Manager = 1,
    Member = 2
}
declare const projectService: {
    getProject(id: string): Promise<ProjectDto>;
    getMyProjects(): Promise<ProjectDto[]>;
    getSharedProjects(): Promise<ProjectDto[]>;
    createProject(dto: CreateProjectDto): Promise<ProjectDto>;
    updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectDto>;
    deleteProject(id: string): Promise<void>;
    getProjectMembers(projectId: string): Promise<ProjectMemberDto[]>;
    addProjectMember(projectId: string, dto: AddProjectMemberDto): Promise<ProjectMemberDto>;
    updateProjectMember(projectId: string, memberId: string, role: ProjectRole): Promise<ProjectMemberDto>;
    removeProjectMember(projectId: string, memberId: string): Promise<void>;
};
export default projectService;
