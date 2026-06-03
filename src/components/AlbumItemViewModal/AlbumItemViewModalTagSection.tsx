import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { MdAdd, MdCheck, MdClose } from "react-icons/md";
import { ActionIcon, Badge, Button, Group, Switch, Text } from "@mantine/core";
import { Role } from "@/types/users/userTypes";
import { AlbumItemTagStatus } from "@/types/albums/albumTypes";
import useAlbumItem from "@/hooks/albumItems/useAlbumItem";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import useApprovePendingTag from "@/features/albums/albumItemTagging/useApprovePendingTag";
import useRejectPendingTag from "@/features/albums/albumItemTagging/useRejectPendingTag";
import useDeleteApprovedTag from "@/features/albums/albumItemTagging/useDeleteApprovedTag";
import { getFullName } from "@/types/users/userUtils";
import AddTagModal from "@/components/AlbumItemViewModal/AddTagModal";

interface TagSectionProps {
  albumId: string;
  albumItemId: string;
}

export default function AlbumItemViewModalTagSection(props: TagSectionProps) {
  const { albumId, albumItemId } = props;

  const [activeTab, setActiveTab] = useState<AlbumItemTagStatus>("APPROVED");
  const [addTagOpened, setAddTagOpened] = useState<boolean>(false);

  const albumItemQuery = useAlbumItem({ albumId, albumItemId });
  const userDirectoryQuery = useUserDirectory();

  const approvePendingTagMutation = useApprovePendingTag();
  const rejectPendingTagMutation = useRejectPendingTag();
  const deleteApprovedTagMutation = useDeleteApprovedTag();

  const auth = useAuth();
  const userRole: Role = auth.token?.claims.role as Role;

  if (!albumItemQuery.isSuccess || !userDirectoryQuery.isSuccess) return <></>;

  const albumItem = albumItemQuery.data;
  const userDirectory = userDirectoryQuery.data;

  const canModerateTags = userRole === "ADMIN" || userRole === "PHOTOGRAPHER";

  const currentTags =
    activeTab === "APPROVED"
      ? albumItem.tagIds.approved
      : albumItem.tagIds.inReview;

  const renderTag = (tagId: number, tagStatus: AlbumItemTagStatus) => (
    <Badge
      key={tagId}
      variant="light"
      size="xl"
      rightSection={
        <>
          {tagStatus === "PENDING" && (
            <ActionIcon
              variant="transparent"
              size="sm"
              onClick={() =>
                approvePendingTagMutation.mutate({
                  albumId,
                  albumItemId,
                  tagId,
                })
              }
            >
              <MdCheck size={20} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="transparent"
            size="sm"
            onClick={() =>
              (tagStatus === "APPROVED"
                ? deleteApprovedTagMutation
                : rejectPendingTagMutation
              ).mutate({ albumId, albumItemId, tagId })
            }
          >
            <MdClose size={20} />
          </ActionIcon>
        </>
      }
    >
      {getFullName(userDirectory[tagId].name)}
    </Badge>
  );

  return (
    <div
      className="w-full bg-white rounded-t-2xl flex justify-start items-center px-lg py-md gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      {canModerateTags && (
        <Group gap="xs" className="min-w-fit" wrap="nowrap">
          <Text
            className="cursor-pointer"
            fw={activeTab === "PENDING" ? 700 : 400}
            onClick={() => setActiveTab("PENDING")}
          >
            PENDING
          </Text>
          <Switch
            color="navy.9"
            checked={activeTab === "APPROVED"}
            onChange={(event) =>
              setActiveTab(event.currentTarget.checked ? "APPROVED" : "PENDING")
            }
            aria-label="Toggle between approved and pending tags"
          />
          <Text
            className="cursor-pointer"
            fw={activeTab === "APPROVED" ? 700 : 400}
            onClick={() => setActiveTab("APPROVED")}
          >
            APPROVED
          </Text>
        </Group>
      )}

      <div className="flex gap-2 items-center">
        {currentTags.length === 0 ? (
          <Text c="dimmed" size="sm">
            {activeTab === "APPROVED" ? "No approved tags yet" : "No pending tags"}
          </Text>
        ) : (
          currentTags.map((tag) => renderTag(tag, activeTab))
        )}
      </div>

      {canModerateTags && (
        <Button
          className="min-w-fit"
          aria-label="Add Tags"
          rightSection={<MdAdd size={20} />}
          onClick={(e) => {
            e.stopPropagation();
            setAddTagOpened(true);
          }}
        >
          Add Tag
        </Button>
      )}

      <AddTagModal
        albumId={albumId}
        albumItemId={albumItemId}
        status={activeTab}
        opened={addTagOpened}
        onClose={() => setAddTagOpened(false)}
      />
    </div>
  );
}
