"use client";
import { useState } from "react";
import {
  TextInput,
  Radio,
  Button,
  ActionIcon,
  RadioGroup,
} from "@mantine/core";
import {
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconArrowsVertical,
} from "@tabler/icons-react";
import { useAttendees } from "@/hooks/attendees/useAttendees";
import Profile from "@/assets/icons/Profile.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SmallDirectoryBlockProps = {
  sessionId: string;
};

const INITIAL_VISIBILE_COUNT = 3;
const LOAD_MORE_COUNT = 3;

export function SmallDirectoryBlock({ sessionId }: SmallDirectoryBlockProps) {
  const router = useRouter();
  const { data: people, isLoading, error } = useAttendees(sessionId);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"CAMPER" | "STAFF" | "ADMIN">("CAMPER");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBILE_COUNT);
  const [showAll, setShowAll] = useState(false);

  // loading state
  if (isLoading) {
    return (
      <div className="max-w-[400px] m-[50px] border-[1.3px] border-black p-4 bg-neutral-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">DIRECTORY</h2>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-neutral-5 text-sm">Loading directory...</p>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="max-w-[400px] m-[50px] border-[1.3px] border-black p-4 bg-neutral-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">DIRECTORY</h2>
        </div>
        <div className="flex items-start gap-3 p-3 bg-error-0 border border-error-5 rounded-md">
          <IconAlertCircle size={16} className="text-error-5 mt-0.5" />
          <div>
            <p className="font-semibold text-error-5 mb-1">Error</p>
            <p className="text-sm text-error-5">
              {error instanceof Error
                ? error.message
                : "Failed to load directory data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // filtering the people based on role in search
  const filteredPeople = (people || [])
    .filter(
      (person) =>
        person.role === roleFilter &&
        person.name.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, showAll ? people?.length : visibleCount);

  // view more button that displays (all) people when clicked
  const handleViewMore = () => {
    if (showAll) {
      setShowAll(false);
      setVisibleCount(INITIAL_VISIBILE_COUNT);
    } else {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT , people?.length || 0));
      if (visibleCount + LOAD_MORE_COUNT >= (people?.length || 0)) {
        setShowAll(true);
      }
    }
  };

  return (
    <div className="max-w-[344px] m-[50px] border-[1.3px] border-black p-4 bg-neutral-2">
      {/* header with directory and expand button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black">DIRECTORY</h2>
        <ActionIcon
          variant="transparent"
          size="md"
          onClick={() => console.log("Redirect to expanded directory view")}
          aria-label="Expand directory view"
        >
          <IconArrowsVertical size={25} className="rotate-45" />
        </ActionIcon>
      </div>

      {/* search bar */}
      <TextInput
        placeholder="Search directory..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        radius={7}
      />

      <RadioGroup
        value={roleFilter}
        onChange={(value) => setRoleFilter(value as "CAMPER" | "STAFF" | "ADMIN")}
      >
        {/* radio options to choose */}
        <div className="flex gap-4 mt-4">
          <Radio value="CAMPER" label="Campers" />
          <Radio value="STAFF" label="Staff" />
          <Radio value="ADMIN" label="Admin" />
        </div>
      </RadioGroup>

      <div className="flex flex-col gap-4 mt-7">
        {filteredPeople.map((person) => (
          <div key={person.id}>
            <div className="flex items-center gap-[32px]">
              <Image className="flex-shrink-0 w-[32px] h-[32px]" src={Profile} alt="Profile" />
              <div>
                <p className="text-sm font-bold text-primary-5">
                  {person.name.firstName} {person.name.lastName}
                  {'bunk' in person && person.bunk !== undefined && ` (${person.bunk})`}
                </p>
              </div>
            </div>
            <hr className="mt-2 border-neutral-3" />
          </div>
        ))}
      </div>

      {filteredPeople.length === 0 && (
        <p className="text-neutral-5 text-center my-4">No people found</p>
      )}

      {/* bottom button */}
      {(people?.length || 0) > INITIAL_VISIBILE_COUNT && (
        <Button
          variant="subtle"
          size="sm"
          fullWidth
          mt="md"
          rightSection={
            showAll ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )
          }
          onClick={handleViewMore}
        >
          {showAll ? "Show less" : "View more"}
        </Button>
      )}
    </div>
  );
}