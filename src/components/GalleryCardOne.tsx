"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Button } from "@mantine/core";
import { ReactNode } from "react";
import PolaroidPhotos1 from "../assets/images/PolaroidPhotos1.png";

type GalleryCardProps = {
  title: string;
  href: string;
  description: string;
  icon: ReactNode;
  buttonLabel: string;
  image?: StaticImageData;
};

export default function GalleryCardOne({
  title,
  href,
  description,
  icon,
  buttonLabel,
  image = PolaroidPhotos1,
}: GalleryCardProps) {
  return (
    <div className="flex flex-col items-center w-[370px] px-9 py-10 gap-2 rounded-lg bg-neutral-0 shadow-[0px_0px_16px_-2px_rgba(0,0,0,0.30)]">
      <span className="flex flex-row items-center gap-2 text-blue-8">
        <h3 className="font-NewSpirit text-[32px] font-bold">{title}</h3>
        {icon}
      </span>
      <p className="text-center text-[18px] text-neutral-6">{description}</p>
      <div className="flex grow items-center justify-center my-5">
        <Image
          src={image}
          alt={`${title} preview`}
          className="h-[150px] w-auto object-contain"
        />
      </div>
      <Button
        component={Link}
        href={href}
        color="green.6"
        radius="xl"
        size="md"
        fullWidth
        className="font-bold"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
