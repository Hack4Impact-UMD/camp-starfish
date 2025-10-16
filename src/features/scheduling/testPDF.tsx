import React from "react";
import ReactPDF from "@react-pdf/renderer";
import BlockRatiosGrid from "./BlockRatiosGrid";

async function generatePDF() {
  try {
    await ReactPDF.render(<BlockRatiosGrid />, "./output.pdf");
    console.log("PDF generated successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

generatePDF();