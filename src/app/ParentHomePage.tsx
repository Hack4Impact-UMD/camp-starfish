"use client";

import { useAuth } from "@/auth/useAuth";
import StaticImageCard from "../assets/StaticImageCard.png";
import pattern from "../assets/patterns/trailPattern3.svg";
import { redirect } from "next/navigation";

export default function ParentHomePage() {
    const auth = useAuth();

    return (
        <div className="relative flex flex-col lg:flex-row text-[20px] items-center justify-center flex-1 min-h-screen text-black bg-white px-6 lg:gap-x-8 overflow-hidden w-full">
            {/* Left Half */}
            <div className="flex flex-col items-center lg:items-start justify-center w-full lg:w-1/2 h-full p-6 lg:p-12 lg:ml-[20px] gap-8 text-center lg:text-left mt-[-40px] z-10">
                <h1 className="text-[40px] lg:text-[80px] font-semibold font-newSpirit text-camp-primary">Welcome, {auth.user?.displayName}!</h1>
                <p>You can view and download your camper’s photos now</p>
                <button
                    className="bg-camp-tert-green px-12 lg:px-24 py-3 font-lato font-bold rounded-full text-white whitespace-nowrap"
                    onClick={() => redirect("/albums")}
                >
                    VIEW ALBUMS
                </button>
            </div>

            {/* Trail Pattern on Background */}
            <div
                className="absolute top-[0px] left-[350px] w-[1280px] h-[296px] flex items-center justify-center transform rotate-[1.86deg] z-0 overflow-hidden"
            >
                <img src={pattern.src} alt="Pattern Image" className='w-[90%] object-cover'/>
            </div>

            {/* Right Half */}
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2 h-full lg:mr-[20px] mt-[-40px] z-10">
                <div className="text-center p-4 w-full">
                    <img src={StaticImageCard.src} alt="Album Photos Component" />
                </div>
            </div>
        </div>
    )
}