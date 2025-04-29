"use client";
import RequireAuth from "@/auth/RequireAuth";
import PendingPage from "./PendingPage";

export default function Page() {
  return (
    <RequireAuth allowedRoles={["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"]}>
      <PendingPage />
    </RequireAuth>
  );
}