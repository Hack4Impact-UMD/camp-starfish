"use client";
import { useMemo, useState } from "react";
import {
  TextInput,
  Radio,
  ActionIcon,
  RadioGroup,
  Title,
  Anchor,
  ScrollArea,
  Text,
} from "@mantine/core";
import {
  MdSearch,
  MdErrorOutline,
  MdFullscreen,
  MdWarningAmber,
  MdClose,
} from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import {
  attendeeRoles,
  getFullName,
  getPluralRole,
} from "@/types/users/userUtils";
import useBunkList from "@/hooks/bunks/useBunkList";
import useSession from "@/hooks/sessions/useSession";

type SmallDirectoryBlockProps = {
  sessionId: string;
};

export function SmallDirectoryBlock({ sessionId }: SmallDirectoryBlockProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"CAMPER" | "STAFF" | "ADMIN">(
    "CAMPER",
  );
  const [isBunkErrorOpen, setIsBunkErrorOpen] = useState<boolean>(true);

  const sessionQuery = useSession(sessionId);
  const userDirectoryQuery = useUserDirectory();
  const bunksQuery = useBunkList(sessionId);

  const attendeesToDisplay = useMemo(() => {
    if (!userDirectoryQuery.data || !sessionQuery.data) return [];
    return Object.keys(userDirectoryQuery.data)
      .filter((userId) =>
        sessionQuery.data.attendeeIds.includes(Number(userId)),
      )
      .map((userId) => ({
        id: Number(userId),
        ...userDirectoryQuery.data[Number(userId)],
      }))
      .filter(
        (user) =>
          user.role === roleFilter &&
          getFullName(user.name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
  }, [sessionQuery.data, userDirectoryQuery.data, roleFilter, searchQuery]);

  const usersToBunk = useMemo(() => {
    if (!bunksQuery.data) return [];
    const usersToBunk: { [userId: number]: number } = {};
    bunksQuery.data.pages
      .flatMap((page) => page.docs)
      .forEach((bunk) => {
        [...bunk.camperIds, ...bunk.counselorIds].forEach(
          (userId) => (usersToBunk[userId] = bunk.bunkNum),
        );
      });
    return usersToBunk;
  }, [bunksQuery.data]);

  let smallDirectoryBlockContent = <></>;
  if (userDirectoryQuery.isError || sessionQuery.isError) {
    smallDirectoryBlockContent = (
      <div className="flex items-center gap-sm p-sm bg-error-0 border border-error rounded-md">
        <MdErrorOutline size={32} className="text-error" />
        <Text className="text-error">Unable to load directory</Text>
      </div>
    );
  } else if (userDirectoryQuery.isPending || sessionQuery.isPending) {
    smallDirectoryBlockContent = (
      <Text className="text-neutral">Loading directory...</Text>
    );
  } else {
    smallDirectoryBlockContent = (
      <>
        {bunksQuery.isError && isBunkErrorOpen && (
          <div className="flex items-center gap-sm p-sm bg-warning-0 border border-warning rounded-md">
            <MdWarningAmber size={20} className="text-warning" />
            <Text className="text-warning">Unable to load bunk data</Text>
            <ActionIcon variant="transparent" size="md" onClick={() => setIsBunkErrorOpen(false)}>
              <MdClose size={20} />
            </ActionIcon>
          </div>
        )}
        <TextInput
          placeholder="Search directory..."
          leftSection={<MdSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <RadioGroup
          value={roleFilter}
          onChange={(value) =>
            setRoleFilter(value as "CAMPER" | "STAFF" | "ADMIN")
          }
        >
          <div className="flex gap-md mt-md">
            {attendeeRoles.map((attendeeRole) => (
              <Radio value={attendeeRole} label={getPluralRole(attendeeRole)} />
            ))}
          </div>
        </RadioGroup>
        {attendeesToDisplay.length > 0 ? (
          <ScrollArea.Autosize mah={500}>
            {attendeesToDisplay.map((attendee) => (
              <div
                className="flex items-center gap-xs py-sm border-b last:border-b-0"
                key={attendee.id}
              >
                <MdAccountCircle />
                <Text className="font-bold">
                  {getFullName(attendee.name)}
                  {usersToBunk[attendee.id] && ` (${usersToBunk[attendee.id]})`}
                </Text>
              </div>
            ))}
          </ScrollArea.Autosize>
        ) : (
          <Text className="text-neutral text-center my-md">
            No attendees found
          </Text>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full border border-black p-4 bg-neutral-2 gap-xs">
      <div className="flex justify-between items-center mb-4">
        <Title order={2}>Directory</Title>
        <Anchor href={`/sessions/${sessionId}/directory`}>
          <ActionIcon
            variant="transparent"
            size="lg"
            aria-label="Expand directory view"
          >
            <MdFullscreen size={30} />
          </ActionIcon>
        </Anchor>
      </div>
      {smallDirectoryBlockContent}
    </div>
  );
}
