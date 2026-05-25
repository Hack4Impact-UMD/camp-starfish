"use client";
import { onAuthStateChanged, User, IdTokenResult } from "firebase/auth";
import React, { JSX, createContext, useEffect, useState } from "react";
import { auth } from "@/config/firebase";
import LoadingPage from "@/app/loading";

export interface AuthContextType {
  user: User | null;
  token: IdTokenResult | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>(null!);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<IdTokenResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      setLoading(true);
      if (newUser) {
        const newToken = await newUser.getIdTokenResult();
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
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
