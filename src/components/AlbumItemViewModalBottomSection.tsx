import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import Image from "next/image";
import { MdAdd, MdCheck, MdClose, MdFlag } from "react-icons/md";
import { ActionIcon, Badge, Switch } from "@mantine/core";
import { Role } from "@/types/users/userTypes";
import { AlbumItem } from "@/types/albums/albumTypes";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useTagDirectory from "@/hooks/tags/useTagDirectory";

interface ImageViewBottomSectionProps {
  albumId: string;
  albumItemId: string;
}

export default function AlbumItemViewModalBottomSection(
  props: ImageViewBottomSectionProps,
) {
  const { albumId, albumItemId } = props;

  const [activeTab, setActiveTab] = useState<"APPROVED" | "PENDING">(
    "APPROVED",
  );

  const albumItemQuery = useAlbumItem({ albumId, albumItemId });
  const tagDirectoryQuery = useTagDirectory();

  const auth = useAuth();
  const userRole: Role = auth.token?.claims.role as Role;

  if (!albumItemQuery.isSuccess || !tagDirectoryQuery.isSuccess) return <></>;

  const localTags = albumItemQuery.data.tagIds;
  console.log(localTags);

  const canModerateTags = userRole === "ADMIN" || userRole === "PHOTOGRAPHER";
  const canViewTags = canModerateTags || userRole === "STAFF";

  // --- Parent-only view: show report button ---
  if (userRole === "PARENT") {
    return (
      <div className="w-full bg-camp-white rounded-t-2xl flex flex-row items-center justify-center gap-4 sm:gap-10 p-4 sm:px-10">
        <p className="font-lato text-base sm:text-lg text-center sm:text-left text-camp-primary">
          Something wrong with this image? Report your issue to the Camp
          Starfish team
        </p>
        <button className="bg-camp-primary flex flex-row justify-center space-x-4 p-2 rounded-3xl w-52">
          <p className="text-base sm:text-lg font-lato">REPORT</p>
          <MdFlag size={20} />
        </button>
      </div>
    );
  }

  // --- Guard clause for users without tag access ---
  if (!canViewTags) return null;

  const renderTag = (tagId: number, isApproved: boolean) => (
    <Badge key={tagId} variant="light" rightSection={<>
      {!isApproved && <ActionIcon variant="transparent" size="sm"><MdCheck size={20} /></ActionIcon>}
      <ActionIcon variant="transparent" size="sm"><MdClose size={20} /></ActionIcon>
    </>}>
      {tagDirectoryQuery.data[tagId]}
    </Badge>
  );

  return (
    <div
      className="w-full bg-white rounded-t-2xl flex sm:flex-row sm:items-center items-start p-4 gap-4 sm:pl-10 sm:pr-10"
      onClick={(e) => e.stopPropagation()}
    >
      {canModerateTags && (
        <Select label="Tag Status" data={["APPROVED", "PENDING"]} value={activeTab} onChange={(value) => setActiveTab(value as "APPROVED" | "PENDING")} />
      )}

      {/* Tags List */}
      <div className="overflow-x-auto whitespace-nowrap flex gap-2 w-full">
        {/* Staff View: Only approved tags without moderation ability */}
        {!canModerateTags && canViewTags ? (
          <>
            {albumItemQuery.data.tagIds.approved.map((tag) =>
              renderTag(tag, false),
            )}
          </>
        ) : (
          // Photographer and Admin View: Can toggle between Approved and Pending tags with ability to moderate
          <>
            {albumItemQuery.data.tagIds.inReview.map((tag) =>
              renderTag(tag, activeTab === "PENDING"),
            )}
          </>
        )}
      </div>

      {/* Add Tag button: Only visible for pending tags and moderators */}
      {activeTab === "PENDING" && canModerateTags && (
        <div className="bg-white flex justify-end">
          <button
            aria-label="Add Tag"
            className="bg-camp-primary flex flex-row justify-center space-x-2 p-2 px-4 sm:px-6 rounded-3xl shrink-0"
          >
            <p className="text-base sm:text-lg font-lato">ADD TAG</p>
            <MdAdd size={30} />
          </button>
        </div>
      )}
    </div>
  );
}
