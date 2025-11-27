import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export interface StudyNote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  wordCount: number;
  tags: string[];
}

export interface StudyNoteRequest {
  title: string;
  content: string;
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

export const getNote = async (id: number) => {
  const res = await api.get<StudyNote>(`/notes/${id}`);
  return res.data;
};

export const createNote = async (data: StudyNoteRequest) => {
  const res = await api.post<StudyNote>("/notes", data);
  return res.data;
};

export const updateNote = async (id: number, data: StudyNoteRequest) => {
  const res = await api.put<StudyNote>(`/notes/${id}`, data);
  return res.data;
};

export const deleteNote = async (id: number) => {
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

export const getNoteCount = async () => {
  const res = await api.get<number>("/notes/count");
  return res.data;
};