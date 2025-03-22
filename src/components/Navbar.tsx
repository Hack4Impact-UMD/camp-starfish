"use client";

import React from "react";
import Link from "next/link";
import darkBgLogo from "../assets/logos/darkBgLogo.png";
import profile from "../assets/logos/Profile.png";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/personTypes";

const navbarLinks: { name: string; href: string; roles: Role[] }[] = [
  { name: "Programs", href: "/programs", roles: ["STAFF", "ADMIN"] },
  {
    name: "Campers",
    href: "/campers",
    roles: ["STAFF", "ADMIN", "PARENT"],
  },
  {
    name: "Albums",
    href: "/albums",
    roles: ["STAFF", "ADMIN", "PHOTOGRAPHER", "PARENT"],
  },
];

const Navbar: React.FC = () => {
  const auth = useAuth();
  const role: Role = auth.token?.claims.role as Role;

  return (
    <nav className="w-full h-full bg-camp-primary px-32 flex items-center justify-between gap-20">
      {/* Logo on the left */}
      <div className="flex-none">
        <Link href="/">
          <img
            className="w-[100.94px] h-[72px] flex-none cursor-pointer"
            src={darkBgLogo.src}
            alt="Camp Starfish Logo"
          />
        </Link>
      </div>

      {/* Centered Text Container */}
      {auth.token && (
        <div className="flex gap-20 text-white text-[20px] font-bold leading-6 font-lato shrink">
          {navbarLinks
            .filter((item) => item.roles.includes(role))
            .map((item, index) => (
              <Link key={index} href={item.href} className="cursor-pointer">
                <span className="cursor-pointer shrink font-lato font-bold">
                  {item.name}
                </span>
              </Link>
            ))}
        </div>
      )}

      {/* Profile Icon on the right */}
      {auth.token && <div className="flex-none">
        <Link href="/profile">
          <img
            className="w-[62px] h-[62px] flex-none cursor-pointer"
            src={profile.src}
            alt="Profile"
          />
        </Link>
      </div>}
    </nav>
  );
};

export default Navbar;