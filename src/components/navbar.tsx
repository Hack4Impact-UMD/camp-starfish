import React from 'react';
import Link from 'next/link'; // Use Next.js Link instead of react-router-dom
import darkBgLogo from '../assets/logos/darkBgLogo.png';
import profile from '../assets/logos/Profile.png';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full h-[112px] bg-[#002D45] px-32 flex justify-between items-center relative">
      {/* Logo on the left */}
      <div className="flex items-center">
        <Link href="/">
          <img className="w-[100.94px] h-[72px] cursor-pointer" src={darkBgLogo.src} alt="Camp Starfish Logo" />
        </Link>
      </div>

      {/* Centered Text Container */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-20 text-white text-[20px] font-bold leading-6 font-lato">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index}>Example Item</span>
        ))}
      </div>

      {/* Profile Picture on the right */}
      <div>
        <Link href="/profile">
          <img className="w-[72px] h-[72px]" src={profile.src} alt="Profile" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;