"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import darkBgLogo from "../assets/logos/darkBgLogo.png";
import { MdLogout, MdPerson } from "react-icons/md";
import { useAuth } from "@/auth/useAuth";
import { signOut } from "@/auth/authN";
import { Role } from "@/types/users/userTypes";
import { Menu, UnstyledButton } from "@mantine/core";
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
    roles: ["ADMIN"],
  },
  {
    name: "Users",
    href: "/users",
    roles: ["ADMIN"],
  },
];

const Navbar: React.FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const role = auth.token?.claims.role as Role | undefined;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

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

      {/* Right: profile avatar with account menu */}
      {auth.token && (
        <Menu position="bottom-end" shadow="md" width={180}>
          <Menu.Target>
            <UnstyledButton className="flex-none" aria-label="Account menu">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-4">
                <MdPerson className="text-neutral-0" size={30} />
              </span>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              color="red"
              leftSection={<MdLogout size={18} />}
              onClick={handleLogout}
            >
              Log out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </nav>
  );
};

export default Navbar;
