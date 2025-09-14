// hooks/useIdeas.ts

import { useState, useEffect } from "react";
import { ID, Query, Permission, type Models } from "appwrite";
import { databases } from "../lib/appwrite";

const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID!;
const tableId = process.env.NEXT_PUBLIC_TABLE_ID!;
const queryLimit = 10;

interface Idea extends Models.Document {
  title: string;
  description: string;
  userId: string;
}

export function useIdeas() {
  const [current, setCurrent] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the 10 most recent ideas from the database
  const fetch = async (): Promise<void> => {
    try {
      const response = await databases.listDocuments(databaseId, tableId, [
        Query.orderDesc("$createdAt"),
        Query.limit(queryLimit),
      ]);
      setCurrent(response.documents as Idea[]);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new idea to the database
  const add = async (
    idea: Omit<Idea, "$id" | "$createdAt" | "$updatedAt" | "$permissions">
  ): Promise<void> => {
    try {
      const response = await databases.createDocument(
        databaseId,
        tableId,
        ID.unique(),
        idea,
        [
          Permission.read("any"),
          Permission.update(`user:${idea.userId}`),
          Permission.delete(`user:${idea.userId}`),
        ]
      );
      setCurrent((prev) => [response as Idea, ...prev].slice(0, queryLimit));
    } catch (error) {
      console.error("Error adding idea:", error);
    }
  };

  const remove = async (id: string): Promise<void> => {
    try {
      await databases.deleteDocument(databaseId, tableId, id);
      await fetch(); // Refetch ideas to ensure we have 10 items
    } catch (error) {
      console.error("Error removing idea:", error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return {
    current,
    loading,
    add,
    fetch,
    remove,
  };
}
