"use client";
import { onAuthStateChanged, User, IdTokenResult } from "firebase/auth";
import React, { JSX, createContext, useEffect, useState } from "react";
import { auth, functions } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";
import LoadingPage from "@/app/loading";

export interface AuthContextType {
  user: User | null;
  token: IdTokenResult | null;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>(null!);

export default function AuthProvider({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<IdTokenResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      setLoading(true);
      if (newUser) {
        let newToken = await newUser.getIdTokenResult();
        if (!newToken.claims.role) {
          try {
            await httpsCallable(functions, "checkWhitelist")();
            newToken = await newUser.getIdTokenResult(true);
          } catch (error) {
            setError("An error occurred while trying to authenticate.");
          }
        }
        setUser(newUser);
        setToken(newToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
