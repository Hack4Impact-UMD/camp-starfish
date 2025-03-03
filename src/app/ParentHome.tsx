"use client";
export default function ParentHome() {
    return (
        <div className="flex flex-row text-[20px] items-center justify-center h-screen text-black bg-white">
            {/* Left Half */}
            <div className="flex flex-col items-start justify-center w-1/2 h-full p-12 ml-[120px] gap-[32px]">
                <h1 className="text-[80px] font-semibold font-newSpirit">Welcome, parentName!</h1>
                <p>You can view and download your camper’s photos now</p>
                <button
                    className="bg-camp-tert-green px-24 py-3 font-lato font-bold rounded-full text-white gap-[56px]"
                    onClick={() => console.log("View Albums button clicked.")}
                >
                    VIEW ALBUMS
                </button>
            </div>

            {/* Right Half */}
            <div className="flex flex-col items-center justify-center w-1/2 h-full">
                <div className="text-center border-2 border-gray-300 p-4">Pictures Placeholder</div>
            </div>
        </div>
    )
}