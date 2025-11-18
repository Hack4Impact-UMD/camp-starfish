import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  SectionSchedule,
  BundleActivity,
  ProgramAreaID,
} from "@/types/sessionTypes";

// ---------- Styles ----------
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  table: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    minHeight: 40,
    flexWrap: "nowrap",
    alignSelf: "flex-start",
  },
  cell: {
    width: 60,
    flexGrow: 0,
    flexBasis: 60,
    borderStyle: "solid",
    borderColor: "#000",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    overflow: "hidden",
  },
  blockCell: {
    width: 80,
    flexGrow: 0,
    flexBasis: 80,
    borderStyle: "solid",
    borderColor: "#000",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  headerCell: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#b8b8b8",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 8,
    color: "#495057",
  },
  blockLabel: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 8,
    color: "#495057",
    backgroundColor: "#b8b8b8",
  },
  activityText: {
    fontSize: 5,
    textAlign: "center",
    lineHeight: 1.1,
    wordWrap: "normal",
    maxWidth: "100%",
    hyphens: "none",
    marginBottom: 1,
    whiteSpace: "pre-line",
    overflowWrap: "normal",
    wordBreak: "normal",
  },
  emptyCell: {
    backgroundColor: "#f8f9fa",
  },
  tableContainer: {
    marginBottom: 0,
  },
});

// ---------- Props ----------
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

  // Helper function to render activity text
  const renderActivityText = (activities: BundleActivity[]) => {
    if (activities.length === 0) {
      return null;
    }

    return activities.map((activity, index) => (
      <View
        key={index}
        style={{
          marginBottom: index < activities.length - 1 ? 2 : 0,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 1,
          paddingVertical: 0.5,
        }}
      >
        <Text style={styles.activityText}>
          {`${activity.name} (${activity.ageGroup})`}
        </Text>
      </View>
    ));
  };

  // Helper function to render a single table
  const renderTable = (areas: ProgramAreaID[], tableIndex: number) => (
    <View
      key={tableIndex}
      style={[
        styles.tableContainer,
        tableIndex < areaChunks.length - 1 ? { marginBottom: 20 } : {},
      ]}
    >
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.row}>
          <View style={[styles.blockCell, styles.headerCell]}>
            <Text>BLOCKS</Text>
          </View>
          {areas.map((area) => (
            <View key={area.id} style={[styles.cell, styles.headerCell]}>
              <Text>{`${area.name} (${area.id})`}</Text>
            </View>
          ))}
        </View>

        {/* Table Rows */}
        {blockIds.map((blockId) => {
          const block = schedule.blocks[blockId];
          const activities = block.activities as BundleActivity[];

          return (
            <View key={blockId} style={styles.row}>
              {/* Block Label */}
              <View style={[styles.blockCell, styles.blockLabel]}>
                <Text>{`BLOCK ${blockId}`}</Text>
              </View>

              {/* Area Cells */}
              {areas.map((area) => {
                const areaActivities = activities.filter(
                  (a) => a.programArea.id === area.id
                );

                const isEmpty = areaActivities.length === 0;

                return (
                  <View
                    key={`${blockId}-${area}`}
                    style={
                      isEmpty ? [styles.cell, styles.emptyCell] : styles.cell
                    }
                  >
                    {renderActivityText(areaActivities)}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{sectionName} Program Area Grid</Text>

        {/* Render multiple tables */}
        {areaChunks.map((areas, index) => renderTable(areas, index))}
      </Page>
    </Document>
  );
}
