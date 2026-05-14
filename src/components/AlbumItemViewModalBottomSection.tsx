import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { MdAdd, MdCheck, MdClose, MdFlag } from "react-icons/md";
import { ActionIcon, Badge, Button, Select, Text } from "@mantine/core";
import { Role } from "@/types/users/userTypes";
import { AlbumItemTagStatus } from "@/types/albums/albumTypes";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useTagDirectory from "@/hooks/tags/useTagDirectory";

interface ImageViewBottomSectionProps {
  albumId: string;
  albumItemId: string;
}

export default function AlbumItemViewModalBottomSection(props: ImageViewBottomSectionProps) {
  const { albumId, albumItemId } = props;

  const [activeTab, setActiveTab] = useState<AlbumItemTagStatus>(
    "APPROVED",
  );

  const albumItemQuery = useAlbumItem({ albumId, albumItemId });
  const tagDirectoryQuery = useTagDirectory();

  const auth = useAuth();
  const userRole: Role = auth.token?.claims.role as Role;

  if (!albumItemQuery.isSuccess || !tagDirectoryQuery.isSuccess) return <></>;

  const albumItem = albumItemQuery.data;
  const tagDirectory = tagDirectoryQuery.data;

  const canModerateTags = userRole === "ADMIN" || userRole === "PHOTOGRAPHER";
  const canViewTags = canModerateTags || userRole === "STAFF";

  // --- Parent-only view: show report button ---
  if (userRole === "ADMIN") {
    return (
      <div
        className="w-full bg-white rounded-t-2xl flex justify-center items-center py-md gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Text>
          Something wrong with this image? Report your issue to the Camp
          Starfish team!
        </Text>
        <Button aria-label="Report" rightSection={<MdFlag size={20} />}>
          Report
        </Button>
      </div>
    );
  }

  // --- Guard clause for users without tag access ---
  if (!canViewTags) return null;

  const renderTag = (tagId: number, isApproved: boolean) => (
    <Badge
      key={tagId}
      variant="light"
      rightSection={
        <>
          {!isApproved && (
            <ActionIcon variant="transparent" size="sm">
              <MdCheck size={20} />
            </ActionIcon>
          )}
          <ActionIcon variant="transparent" size="sm">
            <MdClose size={20} />
          </ActionIcon>
        </>
      }
    >
      {tagDirectory[tagId]}
    </Badge>
  );

  return (
    <div
      className="w-full bg-white rounded-t-2xl flex justify-center items-center py-md gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      {canModerateTags && (
        <Select
          className="min-w-fit"
          label="Tag Status"
          data={["APPROVED", "PENDING"]}
          value={activeTab}
          onChange={(value) => setActiveTab(value as AlbumItemTagStatus)}
        />
      )}

      <div>
        {(activeTab === "APPROVED"
          ? albumItem.tagIds.approved
          : albumItem.tagIds.inReview
        ).map((tag) => renderTag(tag, activeTab === "APPROVED"))}
      </div>

      {canModerateTags && (
        <Button
          className="min-w-fit"
          aria-label="Add Tags"
          rightSection={<MdAdd size={20} />}
        >
          Add Tag
        </Button>
      )}
    </div>
  );
}
