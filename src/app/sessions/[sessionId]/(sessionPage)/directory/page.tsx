"use client"
import { useParams } from "next/navigation";
import DirectoryTableView from "./DirectoryTableView";
import useSession from "@/hooks/sessions/useSession";

export default function DirectoryPage() {
  const { sessionId } = useParams();
  const { data: session } = useSession(sessionId);
  return <DirectoryTableView sessionId={session.id} />;
}