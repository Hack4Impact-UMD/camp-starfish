"use client"
import DirectoryTableView from "./DirectoryTableView";
import { useSessionContext } from "./../SessionContext";

export default function DirectoryPage() {
  const session = useSessionContext();
  return <DirectoryTableView sessionId={session.id} />;
}