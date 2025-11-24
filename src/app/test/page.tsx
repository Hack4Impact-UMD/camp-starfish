"use client"

import CreateSession from "@/components/CreateSessionModal";
import { useState } from "react";
import { useCreateSession } from "@/hooks/sessions/useCreateSessions";
import { Session } from "@/types/sessionTypes";

export default function Page() {
  const [showCreateSession, setShowCreateSession] = useState(false);
  
  // Use React Query mutation hook
  const createSessionMutation = useCreateSession();
  
    // Handler for session submission
  const handleSessionSubmit = async (newSession: Session) => {
    createSessionMutation.mutate(newSession);
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
    <>
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
      
    </>
  )
}