import { notes } from "./data.js";
import axios from "axios";

const BASE_URL = process.env.SEED_API_URL || "http://localhost:8080";
const SEED_USERNAME = process.env.SEED_USERNAME;
const SEED_PASSWORD = process.env.SEED_PASSWORD;

async function loginAndCreateApiClient() {
  const authRes = await axios.post(`${BASE_URL}/api/auth/signin`, {
    username: SEED_USERNAME,
    password: SEED_PASSWORD,
  });

  const token = authRes.data?.token;
  if (!token) {
    throw new Error("Login succeeded but no token returned from /api/auth/signin");
  }

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function seedNotes() {
  const api = await loginAndCreateApiClient();

  for (const n of notes) {
    try {
      const createRes = await api.post("/api/notes", {
        title: n.title,
        content: n.content,
        tags: n.tags,
      });

      const createdId = createRes.data.id;

      if (!createdId) {
        console.warn("Note created but no id returned for title:", n.title);
        continue;
      }

      if (n.visibility) {
        await api.put(`/api/notes/${createdId}/visibility`, {
          visibility: n.visibility,
        });
      }

      console.log("Seeded note:", n.title, "->", createdId, "visibility:", n.visibility);
    } catch (err) {
      console.error("Failed to seed note", n.title, err.response?.data || err.message);
    }
  }
}

seedNotes().then(() => {
  console.log("Seeding completed");
});

