import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  SectionSchedule,
  BundleActivity,
  ProgramAreaID,
} from "@/types/sessionTypes";
import { createTw } from 'react-pdf-tailwind';
import { Table, TR, TD } from '@ag-media/react-pdf-table';

const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Helvetica"],
      "ui-sans-serif": ["Helvetica"],
    },
    extend: {
      colors: {
        'gray-50': '#f8f9fa',
        'gray-400': '#b8b8b8',
        'gray-700': '#495057',
        'gray-900': '#333',
      },
    },
  },
});

interface ProgramAreaGridProps {
  schedule: SectionSchedule<"BUNDLE">;
  sectionName: string;
}

// ---------- Component ----------
export function ProgramAreaGrid({
  schedule,
  sectionName,
}: ProgramAreaGridProps) {
  // Identify program areas from bundle activities
  const programAreaMap: Record<string, ProgramAreaID> = {};
  Object.values(schedule.blocks).flatMap((block) =>
    block.activities.forEach(
      (a) => (programAreaMap[a.programArea.id] = a.programArea)
    )
  );
  const allAreas = Object.entries(programAreaMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((a) => a[1]);

  // Sort blocks alphabetically
  const blockIds = Object.keys(schedule.blocks).sort();

  // Split areas into chunks for multiple tables (max 8 areas per table to fit on page)
  const maxAreasPerTable = 8;
  const areaChunks = [];
  for (let i = 0; i < allAreas.length; i += maxAreasPerTable) {
    areaChunks.push(allAreas.slice(i, i + maxAreasPerTable));
  }

  // Helper function to render activity text (only first activity)
  const renderActivityText = (activities: BundleActivity[]) => {
    if (activities.length === 0) {
      return null;
    }

    // Only show the first activity
    const activity = activities[0];
    return (
      <Text style={tw("text-[6px] text-center leading-[1.1] max-w-full")}>
        {`${activity.name} (${activity.ageGroup})`}
      </Text>
    );
  };

  // Helper function to render a single table
  const renderTable = (areas: ProgramAreaID[], tableIndex: number) => {
    return (
      <View
        key={tableIndex}
        style={[
          tw("mb-0"),
          tableIndex < areaChunks.length - 1 ? tw("mb-[20px]") : {},
        ]}
      >
        <Table>
          {/* Table Header does not align, try using rows*/}
          <TR>
            <TD style={tw("bg-black p-[3px] text-center min-h-[13px] border border-black w-[50px]")}>
            </TD>
            {areas.map((area) => (
              <TD
                key={area.id}
                style={tw("bg-gray-400 font-bold text-center text-[7px] text-black p-[3px] min-h-[13px] border border-black w-[80px]")}
              >
                <Text style={tw("text-center")}>{area.name}</Text>
              </TD>
            ))}
          </TR>

          {/* Table Rows */}
          {blockIds.map((blockId) => {
            const block = schedule.blocks[blockId];
            const activities = block.activities as BundleActivity[];

            return (
              <TR key={blockId}>
                {/* Block Label */}
                <TD style={tw("bg-gray-400 font-bold text-center text-[7px] text-black p-[3px] min-h-[13px] border border-black w-[50px]")}>
                  <Text style={tw("text-center")}>BLOCK {blockId}</Text>
                </TD>

                {/* Area Cells */}
                {areas.map((area) => {
                  const areaActivities = activities.filter(
                    (a) => a.programArea.id === area.id
                  );

                  const isEmpty = areaActivities.length === 0;

                  return (
                    <TD
                      key={`${blockId}-${area.id}`}
                      style={
                        isEmpty 
                          ? tw("bg-white p-[2px] min-h-[13px] text-center border border-black w-[80px]")
                          : tw("bg-white p-[2px] min-h-[13px] text-center border border-black w-[80px]")
                      }
                    >
                      {renderActivityText(areaActivities)}
                    </TD>
                  );
                })}
              </TR>
            );
          })}
        </Table>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={[tw("p-[20px] text-[9px]"), { fontFamily: "Helvetica" }]}>
        <Text style={tw("text-[18px] mb-[20px] text-center font-bold text-gray-900")}>
          {sectionName} Program Area Grid
        </Text>

        {/* Render multiple tables */}
        {areaChunks.map((areas, index) => renderTable(areas, index))}
      </Page>
    </Document>
  );
}
