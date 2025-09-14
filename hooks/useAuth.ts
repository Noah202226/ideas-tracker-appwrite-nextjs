// hooks/useAuth.ts

import { useState, useEffect } from "react";
import { account } from "../lib/appwrite";
import { ID } from "appwrite";
import type { Models } from "appwrite";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [current, setCurrent] =
    useState<Models.User<Models.Preferences> | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const register = async (email: string, password: string): Promise<void> => {
    await account.create(ID.unique(), email, password);
    await login(email, password);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const session = await account.createEmailPasswordSession(email, password);
    console.log("session", session);
    const user = await account.get();
    setCurrent(user);
    router.push("/");
  };

  const logout = async (): Promise<void> => {
    await account.deleteSession("current");
    setCurrent(null);
    router.push("/");
  };

  const getCurrentUser = async () => {
    try {
      await account
        .get()
        .then((res) => setCurrent(res))
        .catch(() => setCurrent(null))
        .finally(() => setLoading(false));
    } catch (error) {
      console.log("No current user", error);
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return {
    current,
    loading,
    login,
    logout,
    register,
  };
}
