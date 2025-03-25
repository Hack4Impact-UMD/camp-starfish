import Image from "next/image";
import ReportIcon from "@/assets/icons/reportIcon.svg"

interface ImageViewBottomSectionProps {
    userRole: "parent" | "staff" | "photographer" | "admin";
}

export default function ImageViewBottomSection({ userRole }: ImageViewBottomSectionProps) {
  return (
    <div  className="w-full">
        {userRole === "parent" ? (
            <div className="w-full bg-[#D9D9D9] rounded-t-2xl flex flex-row items-center justify-center space-x-10 p-4">
                <p className="font-lato text-lg text-camp-primary"> Something wrong with this image? Report your issue to the Camp Starfish team </p>
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
            <div className="w-full bg-camp-background-modal rounded-t-2xl">
                {/* Approved Tags */}
                <div className="flex flex-row items-center justify-center space-x-10 p-2">
                    <p className="text-black text-lg font-lato font-semibold m-2">APPROVED TAGS:</p>

                </div>

                {/* In-Review Tags */}
                {userRole !== "staff" && (
                    <div>
                        <hr className="border-gray-400" />
                        <div className="flex flex-row items-center justify-center space-x-10 p-2">
                            <p className="text-black text-lg font-lato font-semibold m-1">IN-REVIEW TAGS:</p>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
