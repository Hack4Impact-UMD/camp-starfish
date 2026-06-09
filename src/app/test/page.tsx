"use client";

import openUploadUsersCsvModal from "@/components/UploadUsersCsvModal/UploadUsersCsvModal";

export default function TestPage() {
  return (
    <div>
      <button
        onClick={async () => {
          openUploadUsersCsvModal();
        }}
      >
        Open
      </button>
    </div>
  );
}
