"use client";

import React from "react";
import Notification from "@/features/notifications/Notification";

export default function NotificationsDemoPage() {
  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Notification Component Demo</h1>

      <div style={{ display: "grid", gap: 16, maxWidth: 640 }}>
        <Notification
          variant="success"
          title="Success"
          message="Your changes have been saved successfully."
        />

        <Notification
          variant="error"
          title="Error"
          message="Something went wrong while saving your changes."
        />
      </div>
    </div>
  );
}
