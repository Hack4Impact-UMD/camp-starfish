"use client";
import { ActivityGrid } from "@/components/ActivityGrid";
import { useSectionPageData } from "@/hooks/sections/useSectionPageData";

export default function TestPage() {
  const {
    schedule,
    isLoading,
    isError,
  } = useSectionPageData({
    sessionId: "session1",
    sectionId: "Bundle-1",
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading section data</div>;
  if (!schedule) return "No schedul";

  return <ActivityGrid sectionSchedule={schedule} />;
}
