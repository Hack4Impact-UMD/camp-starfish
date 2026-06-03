"use client";

import { Title } from "@mantine/core";
import LoadingAnimation from "../components/LoadingAnimation";

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white">
      <Title order={1} classNames={{ root: "font-extrabold" }} className="flex items-end">
        <span>Loading</span>
        <span className="animate-bounce [animation-delay:-0.3s]">.</span>
        <span className="animate-bounce [animation-delay:-0.15s]">.</span>
        <span className="animate-bounce">.</span>
      </Title>
      <div className="w-1/4 max-w-[200px]">
        <LoadingAnimation />
      </div>
    </div>
  );
}
