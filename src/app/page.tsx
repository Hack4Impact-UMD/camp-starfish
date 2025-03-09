"use client";
import ConfirmationModal from "../components/ConfirmationModal.tsx";

export default function Home() {
  return (
    <ConfirmationModal
      text="proceed with this action"
      onConfirm={() => console.log("Confirmed!")}
    />
  )
}
