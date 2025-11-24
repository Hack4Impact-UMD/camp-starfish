"use client";

import React, { useState, useMemo } from "react";
import { BundleHeader } from "../../components/schedule/BundleHeader";
import { TableControls } from "../../components/schedule/TableControls";
import { ScheduleTable } from "../../components/schedule/ScheduleTable";
import { Pagination } from "../../components/schedule/Pagination";
import { ViewMode, ScheduleEntry } from "../../components/schedule/utils/types";
import { SectionScheduleID } from "../../types/sessionTypes";

// Fake sample section to generate data from
const sampleBundleSection: SectionScheduleID<"BUNDLE"> = {
  id: "bundle-1",
  sessionId: "session-2025",
  sectionId: "section-bundle-1",
  blocks: {
    A: {
      activities: [
        {
          name: "STEM Lab",
          description: "Hands-on science experiments with rotating stations.",
          programArea: { id: "pa-stem", name: "STEM", isDeleted: false },
          ageGroup: "NAV",
          assignments: { camperIds: [120, 121], staffIds: [420], adminIds: [320] },
        },
        {
          name: "Outdoor Cooking",
          description: "Outdoor cooking across rotating groups.",
          programArea: { id: "pa-cook", name: "Cooking", isDeleted: false },
          ageGroup: "OCP",
          assignments: { camperIds: [122, 123], staffIds: [421], adminIds: [321] },
        },
      ],
      periodsOff: [4],
    },
  },
  alternatePeriodsOff: {},
};

const generateSampleData = (): ScheduleEntry[] => {
  const entries: ScheduleEntry[] = [];

  // For demo purposes, repeat 30 rows
  for (let i = 0; i < 30; i++) {
    // Pick activities from block A in a round-robin way
    const activity = sampleBundleSection.blocks.A.activities[i % sampleBundleSection.blocks.A.activities.length];

    entries.push({
      id: `entry-${i}`,
      name: `Camper ${i + 1}`,
      blockA: activity.name,
      blockB: "Arts & Crafts",
      blockC: "Small Animals",
      blockD: "Waterfront",
      blockE: "Learning Center",
      health: i === 0 ? "Inhaler" : i === 7 ? "Epipen" : i === 10 ? "Cortisol" : undefined,
      apo: "RH",
      amPmFreeplay: i % 3 === 0 ? "Explorer" : "Rachel P., Anna L.",
      freeplayAssignment: i % 3 === 0 ? "Fort Starfish" : "Anna L.",
    });
  }

  return entries;
};

export default function Page() {
  const [viewMode, setViewMode] = useState<ViewMode>("staff");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const data = useMemo(() => generateSampleData(), []);
  const itemsPerPage = 12;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">

        <BundleHeader
          bundleName="Bundle 1"
          date="Monday, August 11, 2025"
          onPrevious={() => console.log("Previous bundle")}
          onNext={() => console.log("Next bundle")}
        />

        <TableControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={handleReset}
        />

        <ScheduleTable data={paginatedData} viewMode={viewMode} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

      </div>
    </div>
  );
}
