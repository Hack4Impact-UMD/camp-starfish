import React from "react";
import TestPicture from "@/assets/images/TestPicture.png";
import filterIcon from "@/assets/icons/filterIcon.svg";
import uploadIcon from "@/assets/icons/uploadIcon.svg";
import SelectablePhoto from "@/components/SelectablePhoto";
import ConfirmationModal from "@/components/ConfirmationModal";
import backIcon from "@/assets/icons/backIcon.svg";
import { useRouter } from "next/navigation";

const PendingPage: React.FC = () => {
    const dates: string[] = ["Mon, June 17"];
    const router = useRouter();

    return (
        <div className="w-full min-h-full bg-gray-100">
            <div className="container mx-auto px-4 py-6">

                {/* Top Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={backIcon.src}
                            alt="Back"
                            className="w-8 h-8 cursor-pointer"
                            onClick={() => router.back()}
                        />
                        <h1 className="text-4xl font-lato font-bold text-camp-primary">Pending</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* WRAP ConfirmationModal in a span to fix layout */}
                        <div className="inline-flex">
                            <ConfirmationModal
                                text="Are you sure you want to approve all the selected photos?"
                                onConfirm={() => console.log("Upload confirmed")}
                                cannotUndo={true}
                                trigger={
                                    <button className="border-2 border-camp-primary text-lg py-2 px-4 rounded-3xl w-[180px] h-[48px] font-lato font-bold text-camp-text-modalTitle">
                                        APPROVE ALL
                                    </button>
                                }
                            />
                        </div>

                        <img
                            className="w-[72px] h-[72px] flex-none cursor-pointer"
                            src={filterIcon.src}
                            alt="Filter"
                        />

                        <div className="w-[72px] h-[72px] flex items-center justify-center rounded-full bg-[#00B6CE]">
                            <img
                                className="w-[40px] h-[40px] flex-none cursor-pointer"
                                src={uploadIcon.src}
                                alt="Upload"
                            />
                        </div>
                    </div>
                </div>

                {/* Photo Grid */}
                {dates.length > 0 ? (
                    <div className="mt-6 space-y-8">
                        {dates.map((date) => (
                            <div key={date}>
                                <div className="flex items-center gap-8 mb-4">
                                    <h2 className="text-xl font-lato text-camp-primary">{date}</h2>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {Array(8).fill(TestPicture.src).map((src, index) => (
                                        <SelectablePhoto key={index} src={src} alt={`Thumbnail ${index + 1}`} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-6 space-y-8">
                        <div className="bg-white shadow-md p-4 rounded-lg">
                            <p className="text-center text-gray-500">No pending photos available.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingPage;
