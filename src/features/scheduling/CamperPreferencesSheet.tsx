import React, { JSX } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  SectionSchedule,
  BundleActivity,
  SchedulingSectionType,
  AgeGroup,
} from "@/types/sessionTypes";
import { isBundleActivity } from "./schedulingUtils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: "Helvetica" },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  block: { marginTop: 12 },
  blockTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  activity: {
    marginLeft: 10,
    marginBottom: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityInfo: {},
  activityName: { fontWeight: "bold" },
  activityDesc: { fontSize: 11 },
});

type CamperPreferencesSheetProps<T extends SchedulingSectionType> = {
  schedule: SectionSchedule<T>;
  sectionType: T;
  sectionName: string;
  ageGroup?: T extends "BUNDLE" ? AgeGroup : never;
}

export function CamperPreferencesSheet<T extends SchedulingSectionType = SchedulingSectionType>({
  schedule,
  sectionType,
  sectionName,
  ageGroup
}: CamperPreferencesSheetProps<T>) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.nameRow}>
          {sectionType !== "NON-BUNK-JAMBO" && <Text>Name: ____________________________</Text>}
          <Text>Bunk: ___________</Text>
        </View>

        <Text style={styles.title}>
          {`${sectionName} Preference Sheet${ageGroup ? ` - ${ageGroup}` : ""}`}
        </Text>

        {Object.entries(schedule.blocks).map(([blockId, block]) => {
          const activities = sectionType === "BUNDLE"
            ? (block.activities as BundleActivity[]).filter(
                (act) => !ageGroup || act.ageGroup === ageGroup
              )
            : block.activities;
          if (activities.length === 0) return null;
          return (
            <View key={blockId} style={styles.block}>
              <Text style={styles.blockTitle}>Block {blockId}</Text>
              {activities.map((activity, idx) => (
                <View key={`${blockId}-${idx}`} style={styles.activity}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>
                      {`${isBundleActivity(activity) ? `${activity.programArea.name}: ` : ""}${activity.name}`}
                    </Text>
                    {activity.description && (
                      <Text style={styles.activityDesc}>
                        {activity.description}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text>__________</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
