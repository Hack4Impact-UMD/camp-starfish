"use client";
import RequireAuth from "@/auth/RequireAuth";
import AlbumPage from "./AlbumPage";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/users/userTypes";
import { Params } from "next/dist/server/request/params";
import { useParams } from "next/navigation";

interface AlbumRouteParams extends Params {
  albumId: string;
}

export default function Page() {
  const { albumId } = useParams<AlbumRouteParams>();
  const { token } = useAuth();
  const allowedRoles: Role[] = ["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"];

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            allowedRoles.some((role: Role) => token?.claims.role === role),
          component: <AlbumPage albumId={albumId} />,
        },
      ]}
    />
  );
}
