import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import Image from "next/image";
import ReportIcon from "@/assets/icons/reportIcon.svg";
import AddIcon from "@/assets/icons/addIcon.svg";
import XIcon from "@/assets/icons/xIcon.svg";
import CheckIcon from "@/assets/icons/checkIcon.svg";
import { Switch } from "./Switch";
import { Role } from "@/types/personTypes";
import { ImageTags } from "@/types/albumTypes";

interface ImageViewBottomSectionProps {
  tags: ImageTags;
  userRole: "ADMIN" | "PARENT" | "PHOTOGRAPHER" | "STAFF";
}

export default function ImageViewBottomSection({
  tags,
  userRole,
}: ImageViewBottomSectionProps) {
  const [activeTab, setActiveTab] = useState<"APPROVED" | "PENDING">(
    "APPROVED"
  );

  const auth = useAuth();
  // const userRole: Role = auth.token?.claims.role as Role;

  const canModerateTags = userRole === "ADMIN" || userRole === "PHOTOGRAPHER";
  const canViewTags = canModerateTags || userRole === "STAFF";

  if (userRole === "PARENT") {
    return (
      <div className="w-full bg-camp-white rounded-t-2xl flex flex-row items-center justify-center gap-4 sm:gap-10 p-4 sm:px-10">
        <p className="font-lato text-base sm:text-lg text-center sm:text-left text-camp-primary">
          Something wrong with this image? Report your issue to the Camp
          Starfish team
        </p>
        <button className="bg-camp-primary flex flex-row justify-center space-x-4 p-2 rounded-3xl w-52">
          <p className="text-base sm:text-lg font-lato">REPORT</p>
          <Image
            src={ReportIcon.src}
            alt="Report Icon"
            width={18}
            height={18}
          />
        </button>
      </div>
    );
  }

  if (!canViewTags || tags === "ALL") return null;

  const tagsToShow = activeTab === "APPROVED" ? tags.approved : tags.inReview;

  return (
    <div className="w-full">
      <div className="w-full bg-camp-white rounded-t-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center items-start p-4 gap-4 sm:pl-10 sm:pr-10">
          {canModerateTags ? (
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <p className="text-black text-base sm:text-lg font-lato font-semibold">
                APPROVED
              </p>
              <Switch
                checked={activeTab === "PENDING"}
                onCheckedChange={(checked) =>
                  setActiveTab(checked ? "PENDING" : "APPROVED")
                }
              />
              <p className="text-black text-base sm:text-lgfont-lato font-semibold">
                PENDING
              </p>
            </div>
          ) : (
            <div className="p-2 m-2 mb-2 whitespace-nowrap">
              <p className="text-black text-base sm:text-lg font-lato font-semibold">
                APPROVED TAGS
              </p>
            </div>
          )}

          {/* Tags List */}
          <div className="overflow-x-auto whitespace-nowrap flex gap-2 w-full">
            {tagsToShow.map((tag, index) => (
              <div
                key={index}
                className="bg-[#E6EAEC] px-4 py-2 rounded-3xl flex items-center gap-2"
              >
                <p className="text-black text-sm sm:text-base">
                  {tag.name.firstName}{" "}
                  {tag.name.middleName ? `${tag.name.middleName} ` : ""}
                  {tag.name.lastName}
                </p>

                {canModerateTags && activeTab === "PENDING" && (
                  <>
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
                        alt="Approve Icon"
                        width={19}
                        height={19}
                      />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {activeTab === "PENDING" && (
            <div className="bg-white flex justify-end">
              <button className="bg-camp-primary flex flex-row justify-center space-x-2 p-2 px-4 sm:px-6 rounded-3xl shrink-0">
                <p className="text-base sm:text-lg font-lato">ADD TAG</p>
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
    </div>
  );
}
