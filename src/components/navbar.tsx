import React from "react";
import Link from "next/link"; // Use Next.js Link instead of react-router-dom
import darkBgLogo from "../assets/logos/darkBgLogo.png";
import profile from "../assets/logos/Profile.png";

const Navbar: React.FC = () => {

  const navLinks = [
    { name: "Programs", href: "/programs", roles: ["Counselor", "Admin"] },
    { name: "Campers", href: "/campers", roles: ["Counselor", "Admin", "Parent"] },
    { name: "Albums", href: "/albums", roles: ["Counselor", "Admin", "Photographer", "Parent "] }, 

  ];

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

      {/*uncomment below once auth is set up*/}

      {/* Navigation Links (Conditional Rendering Based on Role)
      {user?.isAuthenticated && (
        <div className="flex gap-20 text-white text-[20px] font-bold leading-6 font-lato">
          {navLinks
            .filter((link) => link.roles.includes(user.role))
            .map((link) => (
              <Link key={link.href} href={link.href} className="cursor-pointer">
                {link.name}
              </Link>
            ))}
        </div>
      )}
      */}

        <Link href="/profile">
          <img className="w-[48px] h-[48px] cursor-pointer" src={profile.src} alt="Profile" />
        </Link>
      {/* Profile Picture on the right
      {user?.isAuthenticated && (
        <Link href="/profile">
          <img className="w-[48px] h-[48px] cursor-pointer" src={profile.src} alt="Profile" />
        </Link>
      )} */}
      </nav>
  );
};

export default Navbar;