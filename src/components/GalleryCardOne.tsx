"use client";

import { redirect } from "next/navigation";
import PolaroidPhotos1 from "../assets/images/PolaroidPhotos1.png";
import albumIcon from "@/assets/icons/albumIcon.svg";
import Image from "next/image";

type GalleryCardProps = {
  title: string;
  href: string;
  description: string;
};

export default function GalleryCardOne({
  title,
  href,
  description,
}: GalleryCardProps) {
  return (
    <div
      className="flex flex-col justify-center items-center px-[36px] py-[40px] w-[370px] gap-[8px] rounded-[8px] shadow-[0px_0px_16px_-2px_rgba(0,0,0,0.30)]"
      onClick={() => redirect(href)}
    >
      <span className="flex flex-row gap-[8px]">
        <h3 className="font-lato text-[32px] font-black text-camp-primary">
          {title}
        </h3>
        <Image src={albumIcon.src} alt="Album Icon" width={28} height={28} />
      </span>
      <p className="text-center text-[20px] font-[400] text-modalSecondaryTitle">
        {description}
      </p>
      <Image className="mt-[20px] mb-[20px]" src={PolaroidPhotos1.src} alt="Campers Stock Image" width={463.17} height={328.52}/>
      <button className="rounded-[40px] w-full py-[16px] text-[20px] text-white font-[700] bg-camp-tert-green">
        VIEW {title}
      </button>
    </div>
  );
}
