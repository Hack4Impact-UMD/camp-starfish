'use client';

import React, { useEffect, useState } from 'react';
import { BundleScheduler } from '@/features/scheduling/BundleScheduler';
import {
  CamperAttendeeID,
  StaffAttendeeID,
  SectionSchedule,
  ProgramAreaID,
} from '@/types/sessionTypes';

// ---------- MOCK DATA ----------

// Program areas (match ProgramAreaID structure)
const mockProgramAreas: Record<string, ProgramAreaID> = {
  WF: { id: 'WF', name: 'Waterfront', isDeleted: false },
  TC: { id: 'TC', name: 'Teen Chat', isDeleted: false },
  ART: { id: 'ART', name: 'Arts & Crafts', isDeleted: false },
};

// Schedule structure
const mockSchedule: SectionSchedule<'BUNDLE'> = {
  blocks: {
    A: {
      activities: [
        {
          name: 'Waterfront',
          description: 'Swimming session at the lake.',
          programArea: mockProgramAreas.WF,
          ageGroup: 'NAV',
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
      ],
      periodsOff: [],
    },
    B: {
      activities: [
        {
          name: 'Teen Chat',
          description: 'Group discussion for OCP campers.',
          programArea: mockProgramAreas.TC,
          ageGroup: 'OCP',
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
        {
          name: 'Arts & Crafts',
          description: 'Creative workshop for NAV campers.',
          programArea: mockProgramAreas.ART,
          ageGroup: 'NAV',
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
      ],
      periodsOff: [],
    },
    C: {
      activities: [
        {
          name: 'Teen Chat',
          description: 'Additional Teen Chat block for OCP.',
          programArea: mockProgramAreas.TC,
          ageGroup: 'OCP',
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
      ],
      periodsOff: [],
    },
  },
  alternatePeriodsOff: {},
};

// Camper data (matching CamperAttendeeID)
const mockCampers: CamperAttendeeID[] = [
  {
    id: 1,
    name: { firstName: 'Alex', lastName: 'NAV' },
    gender: 'Male',
    dateOfBirth: '2010-06-15',
    role: 'CAMPER',
    ageGroup: 'NAV',
    level: 2,
    bunk: 1,
    swimOptOut: false,
    nonoList: [],
    sessionId: 'sess1',
  },
  {
    id: 2,
    name: { firstName: 'Jordan', lastName: 'OCP' },
    gender: 'Female',
    dateOfBirth: '2008-05-21',
    role: 'CAMPER',
    ageGroup: 'OCP',
    level: 4,
    bunk: 2,
    swimOptOut: false,
    nonoList: [],
    sessionId: 'sess1',
  },
];

// Staff data (matching StaffAttendeeID)
const mockStaff: StaffAttendeeID[] = [
  {
    id: 100,
    name: { firstName: 'Taylor', lastName: 'Staff' },
    gender: 'Female',
    role: 'STAFF',
    bunk: 1,
    leadBunkCounselor: true,
    yesyesList: [],
    nonoList: [],
    daysOff: [],
    programCounselor: undefined,
    sessionId: 'sess1',
  },
];

// ---------- PAGE COMPONENT ----------
export default function TestPage() {
  const [result, setResult] = useState<SectionSchedule<'BUNDLE'>>(mockSchedule);
  const [staff, setStaff] = useState<StaffAttendeeID[]>(mockStaff);

  useEffect(() => {
    // Clone data deeply (React dev mode double renders)
    const scheduleClone: SectionSchedule<'BUNDLE'> = JSON.parse(JSON.stringify(mockSchedule));
    const staffClone: StaffAttendeeID[] = JSON.parse(JSON.stringify(mockStaff));

    // Instantiate scheduler
    const scheduler = new BundleScheduler()
      .withBundleNum(1)
      .withSchedule(scheduleClone)
      .withCampers(mockCampers)
      .withStaff(staffClone)
      .forBlocks(['A', 'B', 'C']);

    // Run test methods
    scheduler.assignProgramAreaCounselor(mockProgramAreas.WF, staffClone[0]);
    scheduler.assignOCPChats();
    scheduler.assignSwimmingBlock();

    // Store updated results
    setResult(scheduler.schedule);
    setStaff(staffClone);

    console.log('✅ Final schedule:', scheduler.schedule);
    console.log('✅ Staff after counselor assignment:', staffClone);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>🧩 BundleScheduler Test</h1>

      <section style={{ marginTop: 20 }}>
        <h2>👩‍🏫 Staff Program Assignments</h2>
        {staff.map(s => (
          <div
            key={s.id}
            style={{
              border: '1px solid #ccc',
              padding: '8px 12px',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <b>{`${s.name.firstName} ${s.name.lastName}`}</b> →{' '}
            {s.programCounselor
              ? `${s.programCounselor.name} (${s.programCounselor.id})`
              : 'No program area assigned'}
          </div>
        ))}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>📋 Final Schedule Assignments</h2>
        {Object.entries(result.blocks).map(([blockId, block]) => (
          <div key={blockId} style={{ marginBottom: 16 }}>
            <h3>Block {blockId}</h3>
            {block.activities.map((activity, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: '8px 12px',
                  marginBottom: 6,
                }}
              >
                <p>
                  <b>Activity:</b> {activity.name}
                </p>
                <p>
                  <b>Program Area:</b> {activity.programArea.name} ({activity.programArea.id})
                </p>
                <p>
                  <b>Age Group:</b> {activity.ageGroup}
                </p>
                <p>
                  <b>Camper IDs:</b>{' '}
                  {activity.assignments.camperIds.length > 0
                    ? activity.assignments.camperIds.join(', ')
                    : 'None'}
                </p>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
