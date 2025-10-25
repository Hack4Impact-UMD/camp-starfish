"use client";
import moment from "moment";
import { CalanderView } from "@/components/CalanderView";

export default function Page() {
  return (
      <div>
        Test Page
        <CalanderView 
        sessionStartDate={moment("12-11-2025")}
        sessionEndDate={moment("12-15-2025")}
        />
        </div>
  );
}