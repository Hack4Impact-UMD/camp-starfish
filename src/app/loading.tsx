"use client";

import { Title } from "@mantine/core";
import LoadingAnimation from "../components/LoadingAnimation";

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white">
      <Title order={1} classNames={{ root: "font-extrabold" }}>
        Loading...
      </Title>
      <div className="w-1/4">
        <LoadingAnimation />
      </div>
    </div>
  );
}
