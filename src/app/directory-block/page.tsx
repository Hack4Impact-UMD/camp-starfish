"use client";

import DirectoryTableView  from "@/components/DirectoryTableView";
import { Container, Title } from "@mantine/core";

export default function DirectoryPage() {
  return (
    <>
        <DirectoryTableView sessionId="session1"/>
    </>
  );
}
