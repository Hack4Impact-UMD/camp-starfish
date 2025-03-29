import { useState } from "react";
import Image from "next/image";
import ReportIcon from "@/assets/icons/reportIcon.svg";
import DropdownIcon from "@/assets/icons/dropdownIcon.svg";
import AddIcon from "@/assets/icons/addIcon.svg";
import XIcon from "@/assets/icons/xIcon.svg";
import CheckIcon from "@/assets/icons/checkIcon.svg";

interface ImageViewBottomSectionProps {
  userRole: "ADMIN" | "PARENT" | "PHOTOGRAPHER" | "STAFF";
}

// sample list of approved and in-review tags for testing
const approvedTags = Array.from(
  { length: 20 },
  (_, i) => `studentName${i + 1}`
);
const pendingTags = Array.from({ length: 20 }, (_, i) => `studentName${i + 1}`);

export default function ImageViewBottomSection({
  userRole,
}: ImageViewBottomSectionProps) {
  const [activeTab, setActiveTab] = useState<"APPROVED" | "PENDING">("PENDING");

  const showTagView =
    userRole === "STAFF" || userRole === "PHOTOGRAPHER" || userRole === "ADMIN";
  const showReportSection = userRole === "PARENT";
  // const showApprovedTags =
  //   userRole === "STAFF" || userRole === "PHOTOGRAPHER" || userRole === "ADMIN";
  // const showInReviewTags = userRole === "PHOTOGRAPHER" || userRole === "ADMIN";
  // const showReportSection = userRole === "PARENT" || !showApprovedTags;

  return (
    <div className="w-full">
      {showReportSection ? (
        <div className="w-full bg-camp-white rounded-t-2xl flex flex-row items-center justify-center space-x-10 p-4">
          <p className="font-lato text-lg text-camp-primary">
            {" "}
            Something wrong with this image? Report your issue to the Camp
            Starfish team{" "}
          </p>
          <button className="bg-camp-primary flex flex-row justify-center space-x-4 p-2 rounded-3xl w-52">
            <p className="text-lg font-lato">REPORT</p>
            <Image
              src={ReportIcon.src}
              alt="Report Icon"
              width={18}
              height={18}
            />
          </button>
        </div>
      ) : (
        <div className="w-full bg-camp-white rounded-t-2xl">
          <div className="flex flex-row items-center justify-start p-2 pl-10 pr-10">
            <div className="flex items-center space-x-2 p-2 m-2 mb-4 whitespace-nowrap">
              <p className="text-black text-lg font-lato font-semibold">
                {activeTab === "APPROVED" ? "APPROVED TAGS" : "PENDING TAGS"}
              </p>
              <button
                className="inline-flex items-center justify-center min-w-[22px] min-h-[22px]"
                onClick={() =>
                  setActiveTab(
                    activeTab === "APPROVED" ? "PENDING" : "APPROVED"
                  )
                }
              >
                <Image
                  src={DropdownIcon.src}
                  alt="Dropdown Icon"
                  width={15}
                  height={15}
                />
              </button>
            </div>

            {/* Tags List */}
            <div className="overflow-x-auto whitespace-nowrap flex gap-2 p-2">
              {(activeTab === "APPROVED" ? approvedTags : pendingTags).map(
                (tag, index) => (
                  <div
                    key={index}
                    className="bg-[#E6EAEC] px-4 py-2 rounded-3xl flex items-center gap-2"
                  >
                    <p className="text-black">{tag}</p>
                    <button className="inline-flex items-center justify-center min-w-[22px] min-h-[22px]">
                      <Image
                        src={XIcon.src}
                        alt="Remove Icon"
                        width={18}
                        height={18}
                      />
                    </button>
                    {activeTab === "PENDING" && (
                      <button className="inline-flex items-center justify-center min-w-[22px] min-h-[22px]">
                        <Image
                          src={CheckIcon.src}
                          alt="Approve Icon"
                          width={19}
                          height={19}
                        />
                      </button>
                    )}
                  </div>
                )
              )}
            </div>

            {activeTab === "PENDING" && (
              <div className="bg-white flex justify-end pl-20">
                <button className="bg-camp-primary flex flex-row justify-center space-x-2 p-2 px-6 rounded-3xl shrink-0">
                  <p className="text-lg font-lato">ADD TAG</p>
                  <Image
                    src={AddIcon.src}
                    alt="Add Icon"
                    width={28}
                    height={28}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
