"use client";

import DirectoryTableView  from "@/components/DirectoryTableView";
import { useParams } from "next/navigation";
import { Params } from "next/dist/server/request/params";
interface SessionRouteParams extends Params {
  sessionId: string;
}

export default function DirectoryPageRoute() {
  
  const { sessionId } = useParams<SessionRouteParams>();
  
  return (
    <>
        <DirectoryTableView sessionId={sessionId}/>
    </>
  );
}
