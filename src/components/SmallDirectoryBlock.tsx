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
  Tooltip,
} from "@mantine/core";
import {
  MdSearch,
  MdErrorOutline,
  MdFullscreen,
  MdWarningAmber,
  MdClose,
} from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";
import usePersonDirectory from "@/hooks/people/usePersonDirectory";
import {
  ATTENDEE_ROLES,
  getFullName,
  getPluralRole,
} from "@/types/people/personUtils";
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
  const personDirectoryQuery = usePersonDirectory();
  const bunksQuery = useBunkList(sessionId);

  const attendeesToDisplay = useMemo(() => {
    if (!personDirectoryQuery.data || !sessionQuery.data) return [];
    return Object.keys(personDirectoryQuery.data)
      .filter((personId) =>
        sessionQuery.data.attendeeIds.includes(Number(personId)),
      )
      .map((personId) => ({
        id: Number(personId),
        ...personDirectoryQuery.data[Number(personId)],
      }))
      .filter(
        (person) =>
          person.role === roleFilter &&
          getFullName(person.name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
  }, [sessionQuery.data, personDirectoryQuery.data, roleFilter, searchQuery]);

  const peopleToBunk = useMemo(() => {
    if (!bunksQuery.data) return [];
    const peopleToBunk: { [personId: number]: number } = {};
    bunksQuery.data
      .forEach((bunk) => {
        [...bunk.camperIds, ...bunk.counselorIds].forEach(
          (personId) => (peopleToBunk[personId] = bunk.bunkNum),
        );
      });
    return peopleToBunk;
  }, [bunksQuery.data]);

  let smallDirectoryBlockContent = <></>;
  if (personDirectoryQuery.isError || sessionQuery.isError) {
    smallDirectoryBlockContent = (
      <div className="flex items-center gap-sm p-sm bg-error-0 border border-error rounded-md">
        <MdErrorOutline size={32} className="text-error" />
        <Text className="text-error">Unable to load directory</Text>
      </div>
    );
  } else if (personDirectoryQuery.isPending || sessionQuery.isPending) {
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
            <ActionIcon
              variant="transparent"
              size="md"
              aria-label="Close"
              onClick={() => setIsBunkErrorOpen(false)}
            >
              <Tooltip label="Close">
                <MdClose size={20} />
              </Tooltip>
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
            {ATTENDEE_ROLES.map((attendeeRole) => (
              <Radio
                key={attendeeRole}
                value={attendeeRole}
                label={getPluralRole(attendeeRole)}
              />
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
                  {peopleToBunk[attendee.id] && ` (${peopleToBunk[attendee.id]})`}
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
            <Tooltip label="Expand directory view">
              <MdFullscreen size={30} />
            </Tooltip>
          </ActionIcon>
        </Anchor>
      </div>
      {smallDirectoryBlockContent}
    </div>
  );
}
