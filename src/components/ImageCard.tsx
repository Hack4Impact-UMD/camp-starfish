"use client";

import { Card, Checkbox, Image } from "@mantine/core";
import { AlbumItem } from "@/types/albums/albumTypes";
import useAlbumItemSrc from "@/hooks/albumItems/useAlbumItemSrc";

interface ImageCardProps {
  image: AlbumItem;
  isSelected: boolean;
}

export default function ImageCard(props: ImageCardProps) {
  const { image, isSelected } = props;
  const srcQuery = useAlbumItemSrc(image);
  return (
    <Card
      key={image.id}
      shadow="md"
      radius="md"
      padding={0}
      withBorder
      classNames={{
        root: `relative group cursor-pointer transition duration-300 border-4 ${
          isSelected ? "border-blue-5" : "border-transparent"
        }`,
      }}
    >
      <Image
        src={srcQuery.data ?? null}
        alt={image.name}
        h={200}
        fit="cover"
        fallbackSrc="https://placehold.co/200x200?text=Photo"
      />
      <Checkbox
        checked={isSelected}
        readOnly
        size="sm"
        classNames={{
          root: `absolute top-2 left-2 transition-opacity duration-200 ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`,
        }}
        aria-label={`Select ${image.name}`}
      />
    </Card>
  );
}
