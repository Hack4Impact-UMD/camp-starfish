"use client";
import { onAuthStateChanged, User, IdTokenResult } from "firebase/auth";
import React, { JSX, createContext, useEffect, useState } from "react";
import { auth } from "@/config/firebase";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      setLoading(true);
      if (newUser) {
        let newToken = await newUser.getIdTokenResult();
        if (!newToken.claims.role) {
          // TODO: use Cloud Function to set role
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

  return (
    <AuthContext.Provider value={{ user, token, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}