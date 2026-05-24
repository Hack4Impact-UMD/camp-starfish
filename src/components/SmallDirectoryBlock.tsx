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
      <div className="flex items-center gap-3 p-3 bg-error-0 border border-error-5 rounded-md">
        <MdErrorOutline size={16} className="text-error" />
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
        <ScrollArea.Autosize mah={400}>
          <div className="flex flex-col gap-4 mt-7">
            {attendeesToDisplay.map((attendee) => (
              <div key={attendee.id}>
                <div className="flex items-center gap-8">
                  <MdAccountCircle />
                  <div>
                    <p className="text-sm font-bold text-primary-5">
                      {getFullName(attendee.name)}
                      {usersToBunk[attendee.id] &&
                        ` (${usersToBunk[attendee.id]})`}
                    </p>
                  </div>
                </div>
                <hr className="mt-2 border-neutral-3" />
              </div>
            ))}
          </div>
        </ScrollArea.Autosize>
        {attendeesToDisplay.length === 0 && (
          <p className="text-neutral-5 text-center my-4">No users found</p>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full border border-black p-4 bg-neutral-2">
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
      {smallDirectoryBlockContent}
    </div>
  );
}
