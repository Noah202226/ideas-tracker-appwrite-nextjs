import { create } from "zustand";
import {
  Client,
  Databases,
  ID,
  Query,
  Permission,
  type Models,
} from "appwrite";

// 🔗 Shared Appwrite client setup
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID!;
const collectionId = process.env.NEXT_PUBLIC_TABLE_ID!;

// 📌 Idea type (document returned by Appwrite)
export interface Idea extends Models.Document {
  title: string;
  description: string;
  userId: string;
}

// 📌 Idea input type (when adding new idea)
export interface IdeaInput {
  title: string;
  description: string;
  userId: string;
}

// 📌 Zustand store interface
interface IdeasStore {
  ideas: Idea[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (idea: IdeaInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

// 📌 Zustand store definition
export const useIdeasStore = create<IdeasStore>((set, get) => ({
  ideas: [],
  loading: true,

  // 🔍 Fetch latest 10 ideas
  fetch: async () => {
    set({ loading: true });
    try {
      const res = await databases.listDocuments<Idea>(
        databaseId,
        collectionId,
        [Query.orderDesc("$createdAt"), Query.limit(10)]
      );

      set({ ideas: res.documents, loading: false });
    } catch (err) {
      console.error("Error fetching ideas:", err);
      set({ loading: false });
    }
  },

  // ➕ Add new idea
  add: async (idea) => {
    try {
      const res = await databases.createDocument<Idea>(
        databaseId,
        collectionId,
        ID.unique(),
        idea,
        [
          Permission.read("any"), // 👈 allow guests & logged-in users to see
          Permission.update(`user:${idea.userId}`),
          Permission.delete(`user:${idea.userId}`),
        ]
      );
      set({ ideas: [res, ...get().ideas].slice(0, 10) });
    } catch (err) {
      console.error("Error adding idea:", err);
    }
  },

  // ❌ Remove idea
  remove: async (id) => {
    try {
      await databases.deleteDocument(databaseId, collectionId, id);
      set({ ideas: get().ideas.filter((i) => i.$id !== id) });
    } catch (err) {
      console.error("Error removing idea:", err);
    }
  },
}));
