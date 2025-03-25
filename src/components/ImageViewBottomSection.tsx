import Image from "next/image";
import ReportIcon from "@/assets/icons/reportIcon.svg";
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
const inReviewTags = Array.from(
  { length: 20 },
  (_, i) => `studentName${i + 1}`
);

export default function ImageViewBottomSection({
  userRole,
}: ImageViewBottomSectionProps) {
  const showApprovedTags =
    userRole === "STAFF" || userRole === "PHOTOGRAPHER" || userRole === "ADMIN";
  const showInReviewTags = userRole === "PHOTOGRAPHER" || userRole === "ADMIN";
  const showReportSection = userRole === "PARENT" || !showApprovedTags;

  return (
    <div className="w-full">
      {showReportSection ? (
        <div className="w-full bg-[#D9D9D9] rounded-t-2xl flex flex-row items-center justify-center space-x-10 p-4">
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
        <div className="w-full bg-camp-background-modal rounded-t-2xl p-2">
          {/* Approved Tags */}
          {showApprovedTags && (
            <div className="flex flex-row items-center justify-start p-2 pl-10">
              <p className="text-black text-lg font-lato font-semibold m-2 whitespace-nowrap">
                APPROVED TAGS:
              </p>
              <div className="overflow-x-auto whitespace-nowrap flex gap-2 p-2">
                {approvedTags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-white px-4 py-2 rounded-3xl flex items-center justify-center gap-2"
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In-Review Tags */}
          {showInReviewTags && (
            <div>
              <hr className="border-gray-400" />
              <div className="flex flex-row items-center justify-start p-2 pl-10">
                <p className="text-black text-lg font-lato font-semibold m-2 mb-4 whitespace-nowrap">
                  IN-REVIEW TAGS:
                </p>
                <div className="flex-grow min-w-0">
                  <div className="overflow-x-auto whitespace-nowrap flex gap-2 p-2 max-w-full">
                    {inReviewTags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-white px-4 py-2 rounded-3xl flex flex-row items-center justify-center gap-2"
                      >
                        <p className="text-black ">{tag}</p>
                        <button className="inline-flex items-center justify-center min-w-[22px] min-h-[22px]">
                          <Image
                            src={XIcon.src}
                            alt="Remove Icon"
                            width={18}
                            height={18}
                          />
                        </button>
                        <button className="inline-flex items-center justify-center min-w-[22px] min-h-[22px]">
                          <Image
                            src={CheckIcon.src}
                            alt="Remove Icon"
                            width={19}
                            height={19}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
