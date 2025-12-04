import { notes, citations, tags } from "./data.js";
import axios from "axios";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const BASE_URL = process.env.SEED_API_URL || "http://localhost:8080";
const SEED_USERNAME = process.env.SEED_USERNAME;
const SEED_PASSWORD = process.env.SEED_PASSWORD;

if (!SEED_USERNAME || !SEED_PASSWORD) {
  throw new Error("SEED_USERNAME and SEED_PASSWORD environment variables are required");
}

// Store created note IDs for citations
let createdNoteIds = [];

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
  console.log("\n📝 Seeding notes...");

  for (const n of notes) {
    try {
      const createRes = await api.post("/api/notes", {
        title: n.title,
        subtitle: n.subtitle,
        content: n.content,
        noteType: n.noteType,
        tags: n.tags,
        isPublic: n.isPublic,
        visibility: n.visibility,
        authors: n.authors,
        publicationYear: n.publicationYear,
        keywords: n.keywords,
        favorite: n.favorite || false,
      });

      const createdId = createRes.data.id;

      if (!createdId) {
        console.warn("⚠️  Note created but no id returned for title:", n.title);
        continue;
      }

      createdNoteIds.push(createdId);

      if (n.visibility) {
        await api.put(`/api/notes/${createdId}/visibility`, {
          visibility: n.visibility,
        });
      }

      console.log(`✅ Seeded note: "${n.title}" (ID: ${createdId})`);
    } catch (err) {
      console.error(`❌ Failed to seed note "${n.title}":`, err.response?.data || err.message);
    }
  }
}

async function seedCitations() {
  if (createdNoteIds.length < 2) {
    console.warn("⚠️  Not enough notes to create citations");
    return;
  }

  const api = await loginAndCreateApiClient();
  console.log("\n🔗 Seeding citations (note-to-note relationships)...");

  for (const citation of citations) {
    try {
      const citingNoteId = createdNoteIds[citation.citingNoteIndex];
      const citedNoteId = createdNoteIds[citation.citedNoteIndex];

      if (!citingNoteId || !citedNoteId) {
        console.warn(`⚠️  Skipping citation: note indices out of range`);
        continue;
      }

      const createRes = await api.post("/api/citations", {
        noteId: citingNoteId,
        referencedNoteId: citedNoteId,
        citationOrder: citation.citationOrder,
        inlineMarker: citation.inlineMarker,
        pageReference: citation.pageReference,
        context: citation.context,
      });

      const citationId = createRes.data.id;
      console.log(`✅ Seeded citation: Note ${citingNoteId} → ${citedNoteId} (ID: ${citationId})`);
    } catch (err) {
      console.error(`❌ Failed to seed citation:`, err.response?.data || err.message);
    }
  }
}

async function seedTags() {
  const api = await loginAndCreateApiClient();
  console.log("\n🏷️  Seeding tags...");

  for (const tag of tags) {
    try {
      const createRes = await api.post("/api/tags", {
        name: tag.name,
        description: tag.description,
      });

      const tagId = createRes.data.id;
      console.log(`✅ Seeded tag: "${tag.name}" (ID: ${tagId})`);
    } catch (err) {
      // Tags might already exist, so we don't fail on duplicate
      if (err.response?.status === 409) {
        console.log(`ℹ️  Tag "${tag.name}" already exists`);
      } else {
        console.error(`❌ Failed to seed tag "${tag.name}":`, err.response?.data || err.message);
      }
    }
  }
}

async function main() {
  try {
    console.log("🌱 Starting database seeding...\n");
    await seedNotes();
    await seedCitations();
    await seedTags();
    console.log("\n✨ Seeding completed successfully!");
  } catch (err) {
    console.error("\n❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

main();

