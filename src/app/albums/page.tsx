"use client";
import RequireAuth from "@/auth/RequireAuth";
import AlbumsPage from "./AlbumsPage";

export default function Page() {
  return (
    <RequireAuth allowedRoles={["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"]}>
      <AlbumsPage />
    </RequireAuth>
  );
}