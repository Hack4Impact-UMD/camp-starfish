"use client";

import { useAuth } from "@/auth/useAuth";
import GalleryCardOne from "../components/GalleryCardOne";
import React from "react";
import { MdImage, MdAssignment, MdGroups } from "react-icons/md";

export default function EmployeeHomePage() {
  const auth = useAuth();
  return (
    <div className="flex flex-col grow px-10 lg:px-20 py-12 bg-neutral-1">
      {/* Welcome Section */}
      <h1 className="mb-12 font-NewSpirit text-[56px] lg:text-[80px] font-bold text-blue-8">
        Welcome, {auth.user?.displayName}!
      </h1>

      <div className="flex flex-wrap justify-center items-stretch gap-10">
        <GalleryCardOne
          title="ALBUMS"
          href="/albums"
          description="Manage photos from past and ongoing programs"
          icon={<MdImage size={30} />}
          buttonLabel="VIEW ALBUMS"
        />
        <GalleryCardOne
          title="SESSIONS"
          href="/sessions"
          description="Use the activity scheduler to organize campers and staff"
          icon={<MdAssignment size={28} />}
          buttonLabel="VIEW SESSIONS"
        />
        <GalleryCardOne
          title="CAMPERS"
          href="/campers"
          description="Access the cohort list and each camper's details"
          icon={<MdGroups size={32} />}
          buttonLabel="VIEW CAMPERS"
        />
      </div>
    </div>
  );
}
