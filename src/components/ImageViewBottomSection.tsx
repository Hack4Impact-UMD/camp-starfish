import Image from "next/image";
import ReportIcon from "@/assets/icons/reportIcon.svg";
import AddIcon from "@/assets/icons/addIcon.svg";
import XIcon from "@/assets/icons/xIcon.svg";
import CheckIcon from "@/assets/icons/checkIcon.svg";

interface ImageViewBottomSectionProps {
  userRole: "parent" | "staff" | "photographer" | "admin";
}

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
    userRole === "staff" || userRole === "photographer" || userRole === "admin";
  const showInReviewTags = userRole === "photographer" || userRole === "admin";
  const showReportSection = userRole === "parent" || !showApprovedTags;

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
              <div className="overflow-x-auto whitespace-nowrap flex gap-2 p-2 ">
                {approvedTags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-white px-4 py-2 rounded-3xl flex items-center"
                  >
                    <p className="text-black mr-2">{tag}</p>
                    <button className="p-2">
                      <Image
                        src={XIcon.src}
                        alt="Remove Icon"
                        width={10}
                        height={10}
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
                        className="bg-white px-4 py-2 rounded-3xl flex flex-row items-center"
                      >
                        <p className="text-black mr-2">{tag}</p>
                        <button className="p-2">
                          <Image
                            src={XIcon.src}
                            alt="Disapprove Icon"
                            width={10}
                            height={10}
                          />
                        </button>
                        <button className="p-2">
                          <Image
                            src={CheckIcon.src}
                            alt="Approve Icon"
                            width={18}
                            height={18}
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