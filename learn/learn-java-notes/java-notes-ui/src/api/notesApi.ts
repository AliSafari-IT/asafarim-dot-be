import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export interface NoteAnalytics {
  totalViews: number;
  publicViews: number;
  privateViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  uniqueViewers: number;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  wordCount: number;
  isPublic: boolean;
  tags: string[];
  createdBy?: string;
  analytics?: NoteAnalytics;
}

export interface StudyNoteRequest {
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
}

export interface NotesFilter {
  query?: string;
  tag?: string;
  sort?: string;
}

export const getNotes = async (filter?: NotesFilter) => {
  const params: Record<string, string> = {};
  if (filter?.query) params.query = filter.query;
  if (filter?.tag) params.tag = filter.tag;
  if (filter?.sort) params.sort = filter.sort;
  const res = await api.get<StudyNote[]>("/notes", { params });
  return res.data;
};

export const getNote = async (id: string) => {
  const res = await api.get<StudyNote>(`/notes/${id}`);
  return res.data;
};

export const createNote = async (data: StudyNoteRequest) => {
  const res = await api.post<StudyNote>("/notes", data);
  return res.data;
};

export const updateNote = async (id: string, data: StudyNoteRequest) => {
  const res = await api.put<StudyNote>(`/notes/${id}`, data);
  return res.data;
};

export const deleteNote = async (id: string) => {
  await api.delete(`/notes/${id}`);
};

// Tags API
export const getTags = async () => {
  const res = await api.get<string[]>("/tags");
  return res.data;
};

export const getAllTags = async () => {
  const res = await api.get<string[]>("/tags/all");
  return res.data;
};

// Tag Management Types
export interface TagUsage {
  id: string;
  name: string;
  usageCount: number;
  createdAt?: string;
}

export interface TagRenameRequest {
  tagId: string;
  newName: string;
}

export interface TagMergeRequest {
  sourceTagIds: string[];
  targetName: string;
}

export interface TagDeleteRequest {
  tagId: string;
  force?: boolean;
}

// Tag Management API
export const getTagUsage = async (): Promise<TagUsage[]> => {
  const res = await api.get<TagUsage[]>("/tags/manage/usage");
  return res.data;
};

export const renameTag = async (req: TagRenameRequest): Promise<TagUsage> => {
  const res = await api.post<TagUsage>("/tags/manage/rename", req);
  return res.data;
};

export const mergeTags = async (req: TagMergeRequest): Promise<TagUsage> => {
  const res = await api.post<TagUsage>("/tags/manage/merge", req);
  return res.data;
};

export const deleteTag = async (req: TagDeleteRequest): Promise<void> => {
  await api.post("/tags/manage/delete", req);
};

export const getNoteCount = async () => {
  const res = await api.get<number>("/notes/count");
  return res.data;
};

// Public Notes API
export const getPublicNotes = async (filter?: NotesFilter) => {
  const params: Record<string, string> = {};
  if (filter?.query) params.query = filter.query;
  if (filter?.tag) params.tag = filter.tag;
  if (filter?.sort) params.sort = filter.sort;
  const res = await api.get<StudyNote[]>("/public/notes", { params });
  return res.data;
};

export const getPublicNote = async (id: string) => {
  const res = await api.get<StudyNote>(`/public/notes/${id}`);
  return res.data;
};

export const getPublicNoteCount = async () => {
  const res = await api.get<number>("/public/notes/count");
  return res.data;
};

// View Tracking API
export const trackNoteView = async (id: string) => {
  try {
    await api.post(`/notes/${id}/view`);
  } catch (error) {
    console.log("Failed to track view (non-critical):", error);
  }
};

export const trackPublicNoteView = async (id: string) => {
  try {
    await api.post(`/public/notes/${id}/view`);
  } catch (error) {
    console.log("Failed to track public view (non-critical):", error);
  }
};

// Analytics API
export const getNoteAnalytics = async (id: string) => {
  const res = await api.get<NoteAnalytics>(`/notes/${id}/analytics`);
  return res.data;
};

// Dashboard Analytics Types
export interface TagCount {
  tag: string;
  count: number;
}

export interface NoteViewSummary {
  id: string;
  title: string;
  viewCount: number;
  isPublic: boolean;
}

export interface DashboardAnalytics {
  totalNotes: number;
  publicNotes: number;
  privateNotes: number;
  totalViews: number;
  totalPublicViews: number;
  totalPrivateViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  totalWords: number;
  totalReadingTimeMinutes: number;
  tagDistribution: TagCount[];
  mostViewedNotes: NoteViewSummary[];
  viewsPerDay: Record<string, number>;
  notesCreatedPerDay: Record<string, number>;
}

// Dashboard Analytics API
export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const res = await api.get<DashboardAnalytics>("/analytics/dashboard");
  return res.data;
};

// Full-Text Search Types
export interface SearchResult {
  id: string;
  title: string;
  content: string;
  highlightedTitle: string | null;
  highlightedContent: string | null;
  tags: string[];
  isPublic: boolean;
  readingTimeMinutes: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  relevanceScore: number;
  analytics: NoteAnalytics | null;
}

export interface SearchFilter {
  q?: string;
  tag?: string;
}

// Full-Text Search API
export const searchNotes = async (filter?: SearchFilter): Promise<SearchResult[]> => {
  const params: Record<string, string> = {};
  if (filter?.q) params.q = filter.q;
  if (filter?.tag) params.tag = filter.tag;
  const res = await api.get<SearchResult[]>("/search", { params });
  return res.data;
};

export const searchPublicNotes = async (filter?: SearchFilter): Promise<SearchResult[]> => {
  const params: Record<string, string> = {};
  if (filter?.q) params.q = filter.q;
  if (filter?.tag) params.tag = filter.tag;
  const res = await api.get<SearchResult[]>("/search/public", { params });
  return res.data;
};

// Attachment Types
export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  isPublic: boolean;
  uploadedAt: string;
}

// Attachment API (Private - Owner Only)
export const uploadAttachment = async (
  noteId: string,
  file: File,
  isPublic: boolean = false
): Promise<Attachment> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<Attachment>(
    `/notes/${noteId}/attachments?public=${isPublic}`,
    formData
  );
  return res.data;
};

export const getAttachments = async (noteId: string): Promise<Attachment[]> => {
  const res = await api.get<Attachment[]>(`/notes/${noteId}/attachments`);
  return res.data;
};

export const downloadAttachment = async (attachmentId: string): Promise<Blob> => {
  const res = await api.get(`/attachments/${attachmentId}/download`, {
    responseType: "blob",
  });
  return res.data;
};

export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  await api.delete(`/attachments/${attachmentId}`);
};

export const updateAttachment = async (attachmentId: string, data: { isPublic: boolean }): Promise<Attachment> => {
  const res = await api.put<Attachment>(`/attachments/${attachmentId}`, data);
  return res.data;
};

// Attachment API (Public - No Auth Required)
export const getPublicAttachments = async (noteId: string): Promise<Attachment[]> => {
  const res = await api.get<Attachment[]>(`/public/notes/${noteId}/attachments`);
  return res.data;
};

export const downloadPublicAttachment = async (attachmentId: string): Promise<Blob> => {
  const res = await api.get(`/public/attachments/${attachmentId}/download`, {
    responseType: "blob",
  });
  return res.data;
};