import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { SectionSchedule, BundleActivity } from '@/types/sessionTypes';

// ---------- Styles ----------
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flexGrow: 1,
    flexBasis: 0,
    borderStyle: 'solid',
    borderColor: '#000',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  headerCell: {
    backgroundColor: '#eee',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  blockLabel: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 9,
  },
});

// ---------- Props ----------
interface ProgramAreaGridProps {
  schedule: SectionSchedule<'BUNDLE'>;
  sectionName: string;
}

// ---------- Component ----------
export function ProgramAreaGrid({ schedule, sectionName }: ProgramAreaGridProps) {
  // Identify program areas from bundle activities
  const allAreas = Array.from(
    new Set(
      Object.values(schedule.blocks).flatMap((block) =>
        (block.activities as BundleActivity[]).map((a) => a.programArea.name)
      )
    )
  ).sort((a, b) => a.localeCompare(b));

  // Sort blocks alphabetically
  const blockIds = Object.keys(schedule.blocks).sort();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{sectionName} Program Area Grid</Text>

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.cell, styles.headerCell, { width: 60 }]}>
              <Text>Block</Text>
            </View>
            {allAreas.map((area) => (
              <View key={area} style={[styles.cell, styles.headerCell]}>
                <Text>{area}</Text>
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
                <View style={[styles.cell, styles.blockLabel, { width: 60 }]}>
                  <Text>{`BLOCK ${blockId}`}</Text>
                </View>

                {/* Area Cells */}
                {allAreas.map((area) => {
                  const areaActivities = activities.filter(
                    (a) => a.programArea.name === area
                  );

                  const text = areaActivities
                    .map((a) => `${a.name} ${'ageGroup' in a ? `(${a.ageGroup})` : ''}`)
                    .join('\n');

                  return (
                    <View key={`${blockId}-${area}`} style={styles.cell}>
                      <Text style={styles.smallText}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
// commit