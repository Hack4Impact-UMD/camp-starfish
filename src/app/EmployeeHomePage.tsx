"use client";

import { useAuth } from "@/auth/useAuth";
import GalleryCardOne from "../components/GalleryCardOne";


export default function EmployeeHomePage() {
  const auth = useAuth();
  return (
    <div className="p-10 lg:p-20 font-lato text-[20px] font-normal leading-normal text-primary-300 bg-white">

      {/* Welcome Section */}
      <div className="mb-[100px]">
        <h1 className="text-[65px] lg:text-[80px] font-semibold font-newSpirit">
          Welcome, {auth.user?.displayName}!
        </h1>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-[84px]">
        <GalleryCardOne 
          title="ALBUMS" 
          href="/albums" 
          description="Manage photos from past and ongoing programs"
        />
        <GalleryCardOne 
          title="SESSIONS" 
          href="/sessions" 
          description="Use the activity scheduler to organize campers and staff"
        />
        <GalleryCardOne 
          title="CAMPERS" 
          href="/campers" 
          description="Access the cohort list and each camper's details"
        />
      </div>
    </div>
  );
}