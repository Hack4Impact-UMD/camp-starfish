import React from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { PrefSheet } from "@/features/scheduling/prefSheets";
import { SectionSchedule } from "@/types/sessionTypes";

// --- Mock Data (simplified) ---
const mockSchedule: SectionSchedule<'BUNDLE'> = {
  blocks: {
    A: {
      activities: [
        {
          name: "Canoeing",
          description: "Learn paddling techniques on the lake",
          programArea: { id: "WF", name: "Waterfront", isDeleted: false },
          ageGroup: "NAV",
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
        {
          name: "Arts & Crafts",
          description: "Painting, friendship bracelets, and more!",
          programArea: { id: "ART", name: "Arts & Crafts", isDeleted: false },
          ageGroup: "OCP",
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
      ],
      periodsOff: [],
    },
    B: {
      activities: [
        {
          name: "Archery",
          description: "Target practice with bow and arrow",
          programArea: { id: "ARCH", name: "Archery", isDeleted: false },
          ageGroup: "NAV",
          assignments: { camperIds: [], staffIds: [], adminIds: [] },
        },
      ],
      periodsOff: [],
    },
  },
  alternatePeriodsOff: {},
};

// --- Test Page ---
export default function PrefSheetTest() {
  const document = (
    <PrefSheet
      schedule={mockSchedule}
      sectionType="BUNDLE"
      sectionName="Bundle 1"
    />
  );

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Preview: Bundle 1 Preference Sheet</h2>

      {/* Inline PDF Preview */}
      <div style={{ width: "90%", height: "80vh", margin: "auto", border: "1px solid #ccc" }}>
        <PDFViewer width="100%" height="100%">
          {document}
        </PDFViewer>
      </div>

      {/* Download Link */}
      <PDFDownloadLink
        document={document}
        fileName="Bundle_1_Preference_Sheet.pdf"
        style={{
          marginTop: 20,
          display: "inline-block",
          padding: "8px 16px",
          background: "#007bff",
          color: "white",
          borderRadius: 4,
          textDecoration: "none",
        }}
      >
        {({ loading }) => (loading ? "Preparing document..." : "Download PDF")}
      </PDFDownloadLink>
    </div>
  );
}
