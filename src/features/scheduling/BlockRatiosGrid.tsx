import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
  },
  headerCell: {
    flex: 1,
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    borderRightStyle: "solid",
  },
  subHeaderCell: {
    flex: 1,
    padding: 6,
    textAlign: "center",
    backgroundColor: "#d3d3d3",
    borderRightWidth: 1,
    borderRightColor: "#000000",
    borderRightStyle: "solid",
  },
  contentCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    borderRightStyle: "solid",
    fontSize: 9,
  },
  participantText: {
    marginBottom: 2,
  },
});

// Participant data for each block
const blockData = {
  A: {
    subHeader: "Activate!",
    participants: [
      "Katelyn K. (3)",
      "Heidi H. (2)", 
      "Julia J. (2)",
      "Charlie C. (5)",
      "Landon L. (7)",
      "Phillip P. (8)"
    ]
  },
  B: {
    subHeader: "Activate!",
    participants: [
      "Jeff N.",
      "Lara S.",
      "Jordan C.", 
      "Troy N.",
      "BooBoo B."
    ]
  },
  C: {
    subHeader: "Activate!",
    participants: [
      "Lydia L. (3)",
      "Madeleine M. (3)",
      "Natalie N. (3)",
      "Elijah E. (6)",
      "Nathan N. (8)",
      "Jeff N.",
      "Athena G.",
      "Minerva R.",
      "Bill A.", 
      "Duck R."
    ]
  },
  D: {
    subHeader: "Arts & Crafts",
    participants: [
      "Charlie C. (5)",
      "Dexter D. (5)",
      "George G. (6)",
      "Landon L. (7)",
      "Nathan N. (8)",
      "Oscar O. (8)",
      "Jimmy A.",
      "Venus R.",
      "Jordan C.",
      "Joe F."
    ]
  },
  E: {
    subHeader: "Activate!",
    participants: [
      "Quentin Q. (9)",
      "Tim T. (9)",
      "Victor V. (10)",
      "Zeke Z. (10)",
      "Bethany B. (1)",
      "Emma E. (1)",
      "Geraldine G. (2)",
      "Jeff N.",
      "Demeter G.",
      "Sol R.",
      "Bill A.",
      "Gabby R.",
      "Pirate B."
    ]
  }
};

const blocks = ["A", "B", "C", "D", "E"];

export default function BlockRatiosGrid() {
  // Calculate the maximum number of rows needed across all blocks
  const maxParticipants = Math.max(...blocks.map(block => blockData[block].participants.length));
  const totalRows = Math.max(6, maxParticipants); // At least 6 rows as specified

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            {blocks.map((block) => (
              <View key={block} style={styles.headerCell}>
                <Text>BLOCK {block}</Text>
              </View>
            ))}
          </View>

          {/* Sub-header Row */}
          <View style={styles.tableRow}>
            {blocks.map((block) => (
              <View key={block} style={styles.subHeaderCell}>
                <Text>{blockData[block].subHeader}</Text>
              </View>
            ))}
          </View>

          {/* Content Rows */}
          {Array.from({ length: totalRows }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {blocks.map((block) => {
                const participants = blockData[block].participants;
                const participant = participants[rowIndex];
                
                return (
                  <View key={block} style={styles.contentCell}>
                    {participant && (
                      <Text style={styles.participantText}>
                        {participant}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}