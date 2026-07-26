"use client";

import { useState } from "react";
import {
  Button,
  Loader,
  Modal,
  MultiSelect,
  Pill,
  Text,
  Title,
} from "@mantine/core";
import { MdError, MdGroups } from "react-icons/md";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import useCreateAlbumItemTag from "@/features/albums/albumItemTagging/useCreateAlbumItemTag";
import useNotifications from "@/features/notifications/useNotifications";
import { getFullName } from "@/types/users/userUtils";
import { AlbumItemTagStatus } from "@/types/albums/albumTypes";

interface AddTagModalProps {
  albumId: string;
  albumItemId: string;
  status: AlbumItemTagStatus;
  opened: boolean;
  onClose: () => void;
}

export default function AddTagModal(props: AddTagModalProps) {
  const { albumId, albumItemId, status, opened, onClose } = props;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [succeeded, setSucceeded] = useState<boolean>(false);

  const userDirectoryQuery = useUserDirectory();
  const createTagMutation = useCreateAlbumItemTag();
  const notifications = useNotifications();

  const userDirectory = userDirectoryQuery.data;

  const handleClose = () => {
    onClose();
    setSelectedIds([]);
    setSucceeded(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      centered
      zIndex={1000}
    >
      {succeeded ? (
        <div className="flex flex-col items-center gap-3 pb-2">
          <MdGroups className="text-success" size={48} />
          <Title order={4} className="text-success">
            Successful!
          </Title>
          <Text className="text-center text-neutral-6">
            {status === "PENDING"
              ? "Camper tag was added and is pending approval"
              : "Camper tag was added to the photo"}
          </Text>
          <Button color="neutral" onClick={handleClose}>
            CLOSE
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 pb-2">
          <Title order={4} className="text-center">
            Add a tag
          </Title>
          <Text className="text-center text-neutral-6">
            Search for and add a camper to this photo
          </Text>

          <MultiSelect
            className="w-full"
            placeholder={selectedIds.length === 0 ? "Search campers..." : ""}
            comboboxProps={{ zIndex: 1100 }}
            rightSection={
              userDirectoryQuery.isPending ? (
                <Loader size={16} />
              ) : userDirectoryQuery.isError ? (
                <MdError className="text-error" size={18} />
              ) : null
            }
            data={userDirectory ? Object.keys(userDirectory) : []}
            value={selectedIds}
            onChange={setSelectedIds}
            renderOption={(optionInput) =>
              userDirectory ? (
                <Text className="text-sm">
                  {getFullName(
                    userDirectory[Number(optionInput.option.value)].name,
                  )}
                </Text>
              ) : null
            }
            renderPill={(optionInput) => (
              <Pill
                withRemoveButton
                onRemove={optionInput.onRemove}
                disabled={optionInput.disabled}
              >
                {userDirectory
                  ? getFullName(
                      userDirectory[Number(optionInput.option.value)].name,
                    )
                  : optionInput.option.value}
              </Pill>
            )}
            filter={(filterObj) =>
              userDirectory
                ? filterObj.options
                    .filter(
                      (option) =>
                        "value" in option &&
                        getFullName(userDirectory[Number(option.value)].name)
                          .toLowerCase()
                          .includes(filterObj.search.toLowerCase()),
                    )
                    .slice(0, filterObj.limit)
                : []
            }
            searchable
            hidePickedOptions
            disabled={!userDirectory}
          />

          <div className="flex w-full justify-center gap-4 pt-2">
            <Button color="neutral" onClick={handleClose}>
              CLOSE
            </Button>
            <Button
              color="green"
              loading={createTagMutation.isPending}
              disabled={selectedIds.length === 0}
              onClick={() =>
                createTagMutation.mutate(
                  {
                    albumId,
                    albumItemId,
                    tagIds: selectedIds.map(Number),
                    status,
                  },
                  {
                    onSuccess: () => setSucceeded(true),
                    onError: () =>
                      notifications.error(
                        "Failed to add tag. Please try again.",
                      ),
                  },
                )
              }
            >
              ADD
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
