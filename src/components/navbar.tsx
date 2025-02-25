import React from "react";
import Link from "next/link"; // Use Next.js Link instead of react-router-dom
import darkBgLogo from "../assets/logos/darkBgLogo.png";
import profile from "../assets/logos/Profile.png";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full h-[112px] bg-camp-primary px-32 flex items-center justify-between">
      {/* Logo on the left */}
      <Link href="/">
        <img className="w-[100.94px] h-[72px] cursor-pointer" src={darkBgLogo.src} alt="Camp Starfish Logo" />
      </Link>

      {/* Centered Text Container */}
      <div className="flex gap-20 text-white text-[20px] font-bold leading-6 font-lato">
        {["Example Item 1", "Example Item 2", "Example Item 3", "Example Item 4"].map((item, index) => (
          <span key={index} className="cursor-pointer">
            {item}
          </span>
        ))}
      </div>

      {/* Profile Picture on the right */}
      <Link href="/profile">
        <img className="w-[48px] h-[48px] cursor-pointer" src={profile.src} alt="Profile" />
      </Link>
    </nav>
  );
};

export default Navbar;