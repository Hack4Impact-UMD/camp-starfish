"use client";

import { useAuth } from "@/auth/useAuth";
import GalleryCardOne from "../components/GalleryCardOne";
import CreateSession from "@/components/SessionModal";
import { useState } from "react";
import { useCreateSession } from "@/hooks/useSessions";
import moment from "moment";

export default function EmployeeHomePage() {
  const auth = useAuth();
  const [showCreateSession, setShowCreateSession] = useState(false);
  
  // Use React Query mutation hook
  const createSessionMutation = useCreateSession();

  // Handler for session submission
  const handleSessionSubmit = async (
    sessionName: string, 
    startDate: moment.Moment | null, 
    endDate: moment.Moment | null
  ) => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    // Use the mutation
    createSessionMutation.mutate(
      { sessionName, startDate, endDate },
      {
        onSuccess: (data) => {
          alert(`Session "${data.sessionName}" created successfully!`);
          setShowCreateSession(false);
        },
        onError: (error) => {
          alert("Failed to create session. Check console for details.");
        },
      }
    );
  };

  // Handler for cancel button
  const handleCancel = () => {
    setShowCreateSession(false);
  };

  // Show CreateSession component if state is true
  if (showCreateSession) {
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px' }}>
        {/* Show loading state */}
        {createSessionMutation.isPending && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px 40px', 
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 600
            }}>
              Creating session...
            </div>
          </div>
        )}
        
        <CreateSession 
          onSubmit={handleSessionSubmit} 
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-20 font-lato text-[20px] font-normal leading-normal text-primary-300 bg-white">
      {/* Test button with loading state */}
      <button 
        onClick={() => setShowCreateSession(true)}
        disabled={createSessionMutation.isPending}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {createSessionMutation.isPending ? 'Creating...' : 'Test Create Session'}
      </button>

      {/* Show error message if mutation failed */}
      {createSessionMutation.isError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong> {createSessionMutation.error?.message || 'Failed to create session'}
          <details className="mt-2">
            <summary className="cursor-pointer text-sm">View details</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(createSessionMutation.error, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Show success message if mutation succeeded */}
      {createSessionMutation.isSuccess && !showCreateSession && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded border border-green-300">
          <strong>Success:</strong> Session created successfully!
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="mb-[100px]">
        <h1 className="text-[65px] lg:text-[80px] font-semibold font-newSpirit">
          Welcome, {auth.user?.displayName}!
        </h1>
      </div>

      {/* Content Section */}
      <div className="flex flex-wrap justify-center items-center gap-[84px]">
        {/* Albums */}
        <GalleryCardOne 
          title="ALBUMS" 
          href="/albums" 
          description="Manage photos from past and ongoing programs"
        />
        {/* Programs */}
        <GalleryCardOne 
          title="PROGRAMS" 
          href="/programs" 
          description="Use the activity scheduler to organize campers and staff"
        />
        {/* Campers */}
        <GalleryCardOne 
          title="CAMPERS" 
          href="/campers" 
          description="Access the cohort list and each camper's details"
        />
      </div>
    </div>
  );
}