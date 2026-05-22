"use client";
import { useMemo, useState } from "react";
import {
  TextInput,
  Radio,
  Button,
  ActionIcon,
  RadioGroup,
  Title,
  Anchor,
  ScrollArea,
} from "@mantine/core";
import { MdSearch, MdErrorOutline, MdFullscreen } from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";
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
  }, [
    sessionQuery,
    userDirectoryQuery,
    sessionQuery.data,
    userDirectoryQuery.data,
    roleFilter,
    searchQuery,
  ]);

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

  if (
    userDirectoryQuery.isPending ||
    sessionQuery.isPending ||
    bunksQuery.isPending
  ) {
    return (
      <div className="max-w-100 m-12.5 border-[1.3px] border-black p-4 bg-neutral-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">DIRECTORY</h2>
        </div>
        <div className="flex flex-col items-center justify-center min-h-50">
          <p className="text-neutral-5 text-sm">Loading directory...</p>
        </div>
      </div>
    );
  }

  if (
    userDirectoryQuery.isError ||
    sessionQuery.isError ||
    bunksQuery.isError
  ) {
    return (
      <div className="max-w-100 m-12.5 border-[1.3px] border-black p-4 bg-neutral-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">DIRECTORY</h2>
        </div>
        <div className="flex items-start gap-3 p-3 bg-error-0 border border-error-5 rounded-md">
          <MdErrorOutline size={16} className="text-error-5 mt-0.5" />
          <div>
            <p className="font-semibold text-error-5 mb-1">Error</p>
            <p className="text-sm text-error-5">
              {userDirectoryQuery.error instanceof Error
                ? userDirectoryQuery.error.message
                : "Failed to load directory data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-black p-4 bg-neutral-2">
      <div className="flex justify-between items-center mb-4">
        <Title order={2}>Directory</Title>
        <Anchor href={`/sessions/${sessionId}/directory`}>
          <ActionIcon
            variant="transparent"
            size="md"
            aria-label="Expand directory view"
          >
            <MdFullscreen size={25} />
          </ActionIcon>
        </Anchor>
      </div>

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
        <div className="flex gap-4 mt-4">
          <Radio value="CAMPER" label="Campers" />
          <Radio value="STAFF" label="Staff" />
          <Radio value="ADMIN" label="Admin" />
        </div>
      </RadioGroup>

      <ScrollArea>
      <div className="flex flex-col gap-4 mt-7 border-2 border-red">
        {attendeesToDisplay.map((attendee) => (
          <div key={attendee.id}>
            <div className="flex items-center gap-8">
              <MdAccountCircle />
              <div>
                <p className="text-sm font-bold text-primary-5">
                  {getFullName(attendee.name)}
                  {usersToBunk[attendee.id] && ` (${usersToBunk[attendee.id]})`}
                </p>
              </div>
            </div>
            <hr className="mt-2 border-neutral-3" />
          </div>
        ))}
      </div>
      </ScrollArea>

      {attendeesToDisplay.length === 0 && (
        <p className="text-neutral-5 text-center my-4">No users found</p>
      )}
    </div>
  );
}
