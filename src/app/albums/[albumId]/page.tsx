"use client";
import RequireAuth from "@/auth/RequireAuth";
import AlbumPage from "./AlbumPage";

export default function Page({ params }: { params: { albumId: string } }) {
  const { albumId } = params;
  return (
    <RequireAuth allowedRoles={["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"]}>
      <AlbumPage albumId={albumId} />
    </RequireAuth>
  );
}