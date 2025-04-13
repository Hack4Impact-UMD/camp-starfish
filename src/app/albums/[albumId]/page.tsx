"use client";
import RequireAuth from "@/auth/RequireAuth";
import AlbumPage from "./AlbumPage";

export default function Page() {
  return (
    <RequireAuth allowedRoles={["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"]}>
      <AlbumPage />
    </RequireAuth>
  );
}