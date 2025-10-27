"use client";

import { ChooseSectionType } from "@/components/SectionTypeModal";

export default function TestModalPage() {

  const selectedDate = new Date(2025, 0, 15); // January 15, 2025

  const handleSubmit = (data: {
    startDate: Date | null;
    endDate: Date | null;
    scheduleType: string;
    name: string;
  }) => {
    console.log("Form submitted with data:", data);
    alert(
      `Submitted!\nName: ${data.name}\nSchedule Type: ${data.scheduleType}\nStart Date: ${data.startDate?.toISOString()}\nEnd Date: ${data.endDate?.toISOString()}`
    );
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", backgroundColor: "#f0f0f0" }}>
      <ChooseSectionType selectedDate={selectedDate} onSubmit={handleSubmit} />
    </div>
  );
}
