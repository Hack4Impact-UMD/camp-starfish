"use client";

import { redirect } from "next/navigation";

export default function ParentHome() {
    return (
        <div className="flex flex-col lg:flex-row text-[20px] items-center justify-center min-h-screen text-black bg-white px-6">
            {/* Left Half */}
            <div className="flex flex-col items-center lg:items-start justify-center w-full lg:w-1/2 h-full p-6 lg:p-12 lg:ml-[120px] gap-8 text-center lg:text-left">
                <h1 className="text-[40px] lg:text-[80px] font-semibold font-newSpirit">Welcome, parentName!</h1>
                <p>You can view and download your camper’s photos now</p>
                <button
                    className="bg-camp-tert-green px-12 lg:px-24 py-3 font-lato font-bold rounded-full text-white whitespace-nowrap"
                    onClick={() => redirect("/albums")}
                >
                    VIEW ALBUMS
                </button>
            </div>

            {/* Right Half */}
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2 h-full mt-8 lg:mt-0">
                <div className="text-center border-2 border-gray-300 p-4 w-full max-w-[300px]">Pictures Placeholder</div>
            </div>
        </div>
    )
}