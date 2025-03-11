"use client";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Home() {
  return (
    <ConfirmationModal
      text="Are you sure you want to proceed with this action?"
      onConfirm={() => console.log("Confirmed!")}
      cannotUndo = {true}
      callingObject = {<button className="bg-camp-tert-green px-24 py-3 font-lato font-bold rounded-full text-white hover:bg-camp-tert-blue transition duration-300">
            OPEN CONFIRMATION MODAL
        </button>
      }
    />
  )
}
