"use client";

import React from "react";
import darkBgLogo from "../assets/logos/darkBgLogo.png";
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/users/userTypes";
import { Anchor, Image, Text } from "@mantine/core";

const navbarLinks: { name: string; href: string; roles: Role[] }[] = [
  { name: "Sessions", href: "/sessions", roles: ["STAFF", "ADMIN"] },
  {
    name: "Albums",
    href: "/albums",
    roles: ["STAFF", "ADMIN", "PHOTOGRAPHER", "PARENT"],
  },
  {
    name: "Users",
    href: "/users",
    roles: ["ADMIN"],
  },
];

const Navbar: React.FC = () => {
  const auth = useAuth();
  const role = auth.role;

  return (
    <nav className="w-full h-full bg-blue-8 px-32 flex items-center justify-between gap-20">
      {/* Logo on the left */}
      <div className="flex-none">
        <Anchor href="/" className="min-h-[50px]">
          <Image
            className="flex-none cursor-pointer"
            src={darkBgLogo.src}
            alt="Camp Starfish Logo"
            width={100.94}
            height={72}
          />
        </Anchor>
      </div>

      {/* Centered Text Container */}
      {auth.token && (
        <div className="flex gap-20 text-white text-[20px] font-bold leading-6 font-lato shrink">
          {navbarLinks
            .filter((item) => role && item.roles.includes(role))
            .map((item, index) => (
              <Anchor key={index} href={item.href} className="cursor-pointer decoration-white">
                <Text className="cursor-pointer font-Lato font-bold text-white">
                  {item.name}
                </Text>
              </Anchor>
            ))}
        </div>
      )}

      {/* Profile Icon on the right */}
      {auth.token && (
        <div className="flex-none">
          <Anchor href="/profile">
            <MdAccountCircle size={50} color="gray" />
          </Anchor>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
