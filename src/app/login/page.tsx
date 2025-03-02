"use client";

import React from "react";
import GoogleIcon from "@/assets/icons/Google.svg";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bgPatternDark.svg')" }}
    >
      <div className="bg-[#F1F1F1] py-8 px-5 rounded-2xl w-5/6 max-w-[424px] min-h-[300px] flex flex-col items-center text-center shadow-lg">
        <h1 className="text-black text-[32px] font-lato font-bold pb-4">
          WELCOME
        </h1>
        <p className="text-gray-600 text-xl pb-10 font-lato">
          Sign in with your CampMinder email
        </p>

        {/* Google Sign-in Button */}
        <button
          className="flex flex-row justify-around items-center w-5/6 max-w-[344px] bg-white 
                     py-4 px-12 rounded-full shadow-[0_4px_4px_-1px_rgba(0,0,0,0.2)] font-lato text-xl text-gray-600"
        >
          <img src={GoogleIcon.src} alt="Google" />
          Sign in with Google
        </button>

        {/* Signup Link */}
        <p className="text-gray-500 text-sm mt-[43px] font-lato ">
          Haven’t registered yet? Go to{" "}
          <a href="https://starfish.campintouch.com/ui/forms/application/camper/App" target="_blank" className="text-blue-500 font-medium underline">
            CampMinder
          </a>
        </p>
      </div>
    </div>
  );
}