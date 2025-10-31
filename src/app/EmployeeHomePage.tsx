"use client";

import { useAuth } from "@/auth/useAuth";
import GalleryCardOne from "../components/GalleryCardOne";
// Updated import - now default export
import CreateSession from "@/components/SessionModal";
import { useState } from "react";
import { createSession } from "@/data/firestore/sessions";

export default function EmployeeHomePage() {
  const auth = useAuth();
  const [showCreateSession, setShowCreateSession] = useState(false);

  // Updated handler to match new interface
  const handleSessionSubmit = async (sessionName: string, startDate: Date | null, endDate: Date | null) => {
    try {
      if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
      }

      const session = {
        name: sessionName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        driveFolderId: "test-folder-id", // You'll need to provide this
      };

      const sessionId = await createSession(session);
      console.log("Session created successfully:", sessionId);
      alert(`Session "${sessionName}" created successfully!`);
      setShowCreateSession(false);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Check console for details.");
    }
  };

  // Handler for cancel button
  const handleCancel = () => {
    setShowCreateSession(false);
  };

  // Show CreateSession component if state is true
  if (showCreateSession) {
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px' }}>
        <CreateSession 
          onSubmit={handleSessionSubmit} 
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-20 font-lato text-[20px] font-normal leading-normal text-primary-300 bg-white">
      {/* Add a button to test the modal */}
      <button 
        onClick={() => setShowCreateSession(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Create Session
      </button>
      
      {/* Welcome Section */}
      <div className="mb-[100px]">
        <h1 className="text-[65px] lg:text-[80px] font-semibold font-newSpirit">Welcome, {auth.user?.displayName}!</h1>
      </div>

      {/* Content Section */}
      <div className="flex flex-wrap justify-center items-center gap-[84px]">
        {/* Albums */}
        <GalleryCardOne title="ALBUMS" href="/albums" description="Manage photos from past and ongoing programs"/>
        {/* Programs */}
        <GalleryCardOne title="PROGRAMS" href="/programs" description="Use the activity scheduler to organize campers and staff"/>
        { /* Campers */}
        <GalleryCardOne title="CAMPERS" href="/campers" description="Access the cohort list and each camper's details"/>
      </div>
    </div>
  )
}