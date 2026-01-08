import React from "react";
import { Document, Page, Text, View} from "@react-pdf/renderer";
import {
  SectionSchedule,
  BundleActivity,
  SchedulingSectionType,
  AgeGroup,
} from "@/types/sessionTypes";
import { isBundleActivity } from "../generation/schedulingUtils";
import { tw } from "@/utils/reactPdfTailwind";

/*const styles = StyleSheet.create({
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
}); */

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
      <Page size="A4" style={[tw("p-[40px] text-[12px]"), { fontFamily: "Helvetica" }]}>
        <View style={tw("flex-row justify-between mb-[10px]")}>
          {sectionType !== "NON-BUNK-JAMBO" && <Text>Name: ____________________________</Text>}
          <Text>Bunk: ___________</Text>
        </View>

        <Text style={tw("text-[18px] text-center mb-[16px] font-bold")}>
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
            <View key={blockId} style={ tw("mt-[12px]")}>
              <Text style={tw("text-[14px] font-bold mb-[4px]")}>Block {blockId}</Text>
              {activities.map((activity, idx) => (
                <View key={`${blockId}-${idx}`} style={tw("ml-[10px] mb-[6px] flex flex-row justify-between")}>
                  <View>
                    <Text style={tw("font-bold")}>
                      {`${isBundleActivity(activity) ? `${activity.programArea.name}: ` : ""}${activity.name}`}
                    </Text>
                    {activity.description && (
                      <Text style={tw("text-[11px]")}>
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
