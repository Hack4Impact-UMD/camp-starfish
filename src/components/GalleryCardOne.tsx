"use client";
import StaticImageCard from "../assets/StaticImageCard.png";
import albumIcon from "@/assets/solar_album-bold.svg";


type GalleryCardProps = {
  title: string;
  description: string;
};

export default function GalleryCardOne({ title, description }: GalleryCardProps) {
    return (
      <div className = "flex flex-col justify-center items-center px-[36px] py-[40px] w-[370px] gap-[8px] rounded-[8px] shadow-[0px_0px_16px_-2px_rgba(0,0,0,0.30)]">
        <span className ="flex flex-row gap-[8px]">
          <h3 className = "font-lato text-[32px] font-[900] text-camp-primary">{title}</h3>
          <img src = {albumIcon.src}></img>
        </span>
        <p className = "text-center text-[20px] font-[400] text-[#4A4A4A]">{description}</p>
        <img className="mt-[20px] mb-[20px]" src = {StaticImageCard.src}></img>
        <button className="rounded-[40px] w-full py-[16px] text-[20px] text-white font-[700] bg-camp-tert-green">VIEW {title}</button>      
      </div>
    )
}