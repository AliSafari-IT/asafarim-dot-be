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
}

export interface StudyNoteRequest {
  title: string;
  content: string;
}

export const getNotes = async () => {
  const res = await api.get<StudyNote[]>("/notes");
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
