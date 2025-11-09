"use client";

import ActivityModal from '@/components/ActivityModal';

export default function ActivityModalExample() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Activity Modal Test</h1>
        <p className="text-gray-600 mb-6">Replace the IDs below with real Firestore data</p>
        
        <ActivityModal
          trigger={
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition">
              Open Modal
            </button>
          }
          sessionId="YOUR_SESSION_ID"
          sectionId="YOUR_SECTION_ID"
          blockId="A"
          activityIndex={0}
        />
      </div>
    </div>
  );
}
