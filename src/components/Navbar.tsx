"use client";

import React from "react";
import Link from "next/link";
import darkBgLogo from "../assets/logos/darkBgLogo.png";
import { MdPerson } from "react-icons/md";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/users/userTypes";
import Image from "next/image";

const navbarLinks: { name: string; href: string; roles: Role[] }[] = [
  {
    name: "Home",
    href: "/",
    roles: ["CAMPER", "PARENT", "STAFF", "PHOTOGRAPHER", "ADMIN"],
  },
  {
    name: "Albums",
    href: "/albums",
    roles: ["STAFF", "ADMIN", "PHOTOGRAPHER", "PARENT"],
  },
  { name: "Sessions", href: "/sessions", roles: ["STAFF", "ADMIN"] },
  {
    name: "Campers",
    href: "/campers",
    roles: ["STAFF", "ADMIN", "PARENT"],
  },
];

const Navbar: React.FC = () => {
  const auth = useAuth();
  const role = auth.token?.claims.role as Role | undefined;

  return (
    <nav className="w-full bg-navy-9 px-16 py-3 flex items-center justify-between gap-8">
      {/* Left: logo + navigation links */}
      <div className="flex items-center gap-12">
        <Link href="/" className="flex-none min-h-[50px]">
          <Image
            className="cursor-pointer"
            src={darkBgLogo.src}
            alt="Camp Starfish Logo"
            width={100.94}
            height={72}
          />
        </Link>

        {auth.token && (
          <div className="flex gap-10 text-white text-[20px] font-bold">
            {navbarLinks
              .filter((item) => role !== undefined && item.roles.includes(role))
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="cursor-pointer hover:text-neutral-3"
                >
                  {item.name}
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* Right: profile avatar */}
      {auth.token && (
        <Link href="/profile" className="flex-none">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-4">
            <MdPerson className="text-neutral-0" size={30} />
          </span>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
