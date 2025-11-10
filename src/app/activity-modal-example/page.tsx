"use client";

import ActivityModal from '@/components/ActivityModal';

export default function ActivityModalExample() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ActivityModal
        sessionId="session1"
        sectionId="Bundle-2"
        blockId="A"
        activityIndex={0}
        defaultOpen={true}
      />
    </div>
  );
}
