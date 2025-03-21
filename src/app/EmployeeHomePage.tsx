"use client";

import GalleryCardOne from "../components/GalleryCardOne";
export default function EmployeeHomePage() {
  return (
    <div className="p-10 lg:p-20 font-lato text-[20px] font-normal leading-normal text-camp-primary bg-white">
      {/* Welcome Section */}
      <div className="mb-[100px]">
        <h1 className="text-[65px] lg:text-[80px] font-semibold font-newSpirit">Welcome, staffName!</h1>
      </div>

      {/* Content Section */}
      <div className="flex flex-wrap justify-center items-center gap-[84px]">
        {/* Albums */}
        <GalleryCardOne title="ALBUMS" description="Manage photos from past and ongoing programs"/>
        {/* Programs */}
        <GalleryCardOne title="PROGRAMS" description="Use the activity scheduler to organize campers and staff"/>
        { /* Campers */}
        <GalleryCardOne title="CAMPERS" description="Access the cohort list and each camper’s details"/>
      </div>
    </div>
  )
}