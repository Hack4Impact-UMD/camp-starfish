"use client";

import { DirectoryTableView } from "@/components/DirectoryTableView";
import { Container, Text, Title } from "@mantine/core";

export default function DirectoryPage() {
  return (
    <>
      <Container>
        <Title order={3} className="text-center !font-bold !mb-10">DIRECTORY</Title>
        <DirectoryTableView />
      </Container>
    </>
  );
}
