"use client";

import { ChooseSectionType } from "@/components/SectionTypeModal";

export default function TestModalPage() {

  const selectedDate = new Date(2025, 0, 15); // January 15, 2025
  // The test session ID from firebase
  const testSessionId = "test-session-2025";
  
  // FOR TESTING EDIT MODE: Copy a section ID from Firestore and paste it here
  // Leave undefined for CREATE mode, set to a UUID for EDIT mode
  const testSectionId = undefined; 
  
  console.log("🔍 Current testSessionId:", testSessionId);
  console.log("🔍 Current testSectionId:", testSectionId);

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

  const handleClose = () => {
    console.log("Modal closed");
  };

  const handleDelete = () => {
    console.log("Section deleted!");
    alert("Section deleted!");
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", backgroundColor: "#f0f0f0" }}>
      <ChooseSectionType 
        sessionId={testSessionId}
        sectionId={testSectionId} // Pass the section ID for edit mode
        selectedDate={selectedDate} 
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </div>
  );
}
