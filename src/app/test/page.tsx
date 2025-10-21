'use client';
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { PrefSheet } from '@/features/scheduling/prefSheets';
import { SectionSchedule } from '@/types/sessionTypes';

// --- Mock Data ---
const mockSchedule: SectionSchedule<'BUNDLE'> = {
  blocks: {
    A: {
      activities: [
        {
          name: 'Canoeing',
          description: 'Learn paddling techniques on the lake.',
          programArea: { id: 'WF', name: 'Waterfront', isDeleted: false },
          ageGroup: 'NAV',
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
        {
          name: 'Archery',
          description: 'Target practice and safety fundamentals.',
          programArea: { id: 'ARCH', name: 'Archery', isDeleted: false },
          ageGroup: 'OCP',
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
      ],
      periodsOff: [],
    },
  },
  alternatePeriodsOff: {},
};

// ✅ Default export = React component
export default function TestPage() {
  const doc = (
    <PrefSheet
      schedule={mockSchedule}
      sectionType="BUNDLE"
      sectionName="Bundle 1"
    />
  );

  return (
    <div style={{ height: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginTop: 12 }}>Bundle 1 Preference Sheet</h2>
      <PDFViewer width="100%" height="90%">
        {doc}
      </PDFViewer>
    </div>
  );
}
