"use client";
import React, { useState } from "react";
import GoogleIcon from "@/assets/icons/Google.svg";
import MicrosoftIcon from "@/assets/icons/Microsoft.svg";
import ErrorIcon from "@/assets/icons/errorIcon.svg";
import BackgroundPattern from "@/components/BackgroundPattern";
import { useAuth } from "@/auth/useAuth";
import { signInWithGooglePopup } from "@/auth/authN";
import Image from "next/image";
import { signInWithMicrosoftPopup } from "@/auth/authN";

export default function LoginPage() {
  const [error, setError] = useState<string>("");

  const auth = useAuth();

  const errorDisplay = error ? error : auth.error;

  const signInWithGoogle = async () => {
    try {
      await signInWithGooglePopup();
    } catch {
      setError("An error occurred while trying to sign in. Please try again.");
    }
  }

  const signInWithMicrosoft = async () => {
    try {
      await signInWithMicrosoftPopup();
    }
    catch {
      setError("An error occurred while trying to sign in. Please try again.");
    }
  }

  return (
    <div className="relative min-h-full w-full flex items-center justify-center bg-primary-300 overflow-hidden">
      <div className="absolute inset-0 h-full">
        <BackgroundPattern fill="#FFFFFF" opacity={0.07} />
      </div>

      <div className="bg-[#F1F1F1] m-5 py-8 px-5 rounded-2xl w-5/6 max-w-[424px] min-h-[300px] flex flex-col items-center text-center shadow-lg relative">
        <h1 className="text-[32px] font-lato font-bold pb-4 text-camp-text-modalTitle">
          WELCOME
        </h1>
        <p className="text-gray-600 text-xl pb-10 font-lato">
          Sign in with your CampMinder email
        </p>

        {/* Google Sign-in Button */}
        <button
          onClick={signInWithGoogle}
          className="flex flex-row justify-around items-center w-5/6 max-w-[344px] bg-white 
                    py-4 px-12 rounded-full shadow-[0_4px_4px_-1px_rgba(0,0,0,0.2)] font-lato text-xl text-gray-600"
        >
          <Image src={GoogleIcon.src} alt="Google" width={32} height={32} />
          Sign in with Google
        </button>

        {/* Microsoft Sign-in Button */}
        <button
          onClick={signInWithMicrosoft}
          className="flex flex-row justify-around items-center w-5/6 max-w-[344px] bg-white 
                    mt-5 py-4 px-12 rounded-full shadow-[0_4px_4px_-1px_rgba(0,0,0,0.2)] font-lato text-xl text-gray-600"
        >
          <Image src={MicrosoftIcon.src} alt="Microsoft" width={32} height={32} />
          Sign in with Microsoft
        </button>

        {/* Error Message */}
        {errorDisplay && (
          <div className="flex flex-row w-5/6 mt-[14px]">
            <Image src={ErrorIcon.src} alt="Error Icon" width={32} height={32} />
            <p className="text-[#D32F2F] text-sm font-lato text-left pl-2">
              {errorDisplay}
            </p>
          </div>
        )}

        {/* Signup Link */}
        <p className="text-gray-500 text-sm mt-[43px] font-lato ">
          Haven’t registered yet? Go to{" "}
          <a
            href="https://starfish.campintouch.com/ui/forms/application/camper/App"
            target="_blank"
            className="text-blue-500 font-medium underline"
          >
            CampMinder
          </a>
        </p>
      </div>
    </div>
  );
}