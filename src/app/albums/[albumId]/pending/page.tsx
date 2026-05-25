"use client";
import RequireAuth from "@/auth/RequireAuth";
import PendingPage from "./PendingPage";
import { Params } from "next/dist/server/request/params";
import { useParams } from "next/navigation";
import { useAuth } from "@/auth/useAuth";
import { isEmployeeRole } from "@/types/users/userUtils";

interface AlbumPendingRouteParams extends Params {
  albumId: string;
}

export default function Page() {
  const { albumId } = useParams<AlbumPendingRouteParams>();
  const auth = useAuth();

  return (
    <RequireAuth authCases={[
      {
        authFn: () => !!auth.role && isEmployeeRole(auth.role),
        component: <PendingPage albumId={albumId} />
      }
    ]}/>
  );
}