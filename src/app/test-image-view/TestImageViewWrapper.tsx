"use client";
import React from "react";
import { AuthContext, AuthContextType } from "@/auth/AuthProvider";
import TestImageView from "./TestImageView";
import { IdTokenResult } from "firebase/auth";

// Mock token with custom role
const mockToken: Partial<IdTokenResult> = {
  claims: {
    role: "PHOTOGRAPHER", // Change here
  },
};

const mockAuthContext: AuthContextType = {
  user: null,
  token: mockToken as IdTokenResult,
  loading: false,
  error: null,
};

export default function TestImageViewWrapper() {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      <TestImageView />
    </AuthContext.Provider>
  );
}
