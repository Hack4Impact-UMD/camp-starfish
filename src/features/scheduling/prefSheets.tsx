import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  SectionSchedule,
  BundleActivity,
  SchedulingSectionType,
} from "@/types/sessionTypes";

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
  activity: { marginLeft: 10, marginBottom: 6 },
  activityName: { fontWeight: "bold" },
  activityDesc: { fontSize: 11 },
});

interface PrefSheetProps<T extends SchedulingSectionType> {
  schedule: SectionSchedule<T>;
  sectionType: T;
  sectionName: string;
}

export function PrefSheet<T extends SchedulingSectionType>({
  schedule,
  sectionType,
  sectionName,
}: PrefSheetProps<T>) {
  const ageGroups =
    sectionType === "BUNDLE"
      ? (["NAV", "OCP"] as const)
      : ([undefined] as const);

  return (
    <Document>
      {ageGroups.map((ageGroup) => (
        <Page key={ageGroup ?? "all"} size="A4" style={styles.page}>
          <View style={styles.nameRow}>
            <Text>Name: ____________________________</Text>
            <Text>Bunk: ___________</Text>
          </View>

          <Text style={styles.title}>
            {ageGroup
              ? `${
                  ageGroup === "NAV" ? "Navigator" : "OCP"
                } ${sectionName} Preference Sheet`
              : `${sectionName} Preference Sheet`}
          </Text>

          {Object.entries(schedule.blocks).map(([blockId, block]) => {
            const isBundle = sectionType === "BUNDLE";
            const activities = isBundle
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
                    <Text style={styles.activityName}>
                      {isBundle
                        ? `${(activity as BundleActivity).programArea.name}: ${
                            activity.name
                          }`
                        : activity.name}
                    </Text>
                    {activity.description && (
                      <Text style={styles.activityDesc}>
                        {activity.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            );
          })}
        </Page>
      ))}
    </Document>
  );
}
