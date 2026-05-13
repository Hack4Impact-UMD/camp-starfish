"use client";

import useAlbumItemSrc from "@/hooks/albumItems/useAlbumItemSrc";
import { BackgroundImage, Card, Checkbox } from "@mantine/core";
import LoadingAnimation from "./LoadingAnimation";
import { MdError } from "react-icons/md";
import classNames from "classnames";
import { JSX } from "react";

interface AlbumItemCardProps {
  albumId: string;
  albumItemId: string;
  isSelected: boolean;
}

export default function AlbumItemCard(props: AlbumItemCardProps) {
  const { albumId, albumItemId, isSelected } = props;

  const albumItemSrcQuery = useAlbumItemSrc(albumId, albumItemId);

  let cardContent: JSX.Element;
  switch (albumItemSrcQuery.status) {
    case "pending":
      cardContent = <div><LoadingAnimation /></div>;
      break;
    case "error":
      cardContent = <div className="flex justify-center items-center w-full h-full"><MdError className="text-error" size={60}/></div>;
      break;
    case "success":
      cardContent = (
      <BackgroundImage className="bg-contain bg-no-repeat w-full h-full p-2" src={albumItemSrcQuery.data}>
        <div className={classNames("flex justify-center items-center rounded-sm bg-[#ffffffc0] w-8 h-8", {
          'opacity-0 group-hover:opacity-100 transition duration-300': !isSelected,
        })}>
          <Checkbox color="neutral.8" classNames={{
            'input': 'rounded-sm'
          }} checked={isSelected} />
        </div>
      </BackgroundImage>
      )
  }
  
  return (
    <Card classNames={{ root: classNames('rounded-none p-0 aspect-3/2 cursor-pointer group', {
      'border-neutral-8': isSelected,
      'border-transparent': !isSelected,
      'border-4': albumItemSrcQuery.isSuccess
    }) }}>
      {cardContent}
    </Card>
  )
}