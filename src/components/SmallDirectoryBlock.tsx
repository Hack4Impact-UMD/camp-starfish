"use client";
import { useMemo, useState } from "react";
import {
  TextInput,
  Radio,
  Button,
  ActionIcon,
  RadioGroup,
} from "@mantine/core";
import { MdSearch, MdErrorOutline, MdFullscreen } from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";

type SmallDirectoryBlockProps = {
  sessionId: string;
};

export function SmallDirectoryBlock({ sessionId }: SmallDirectoryBlockProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"CAMPER" | "STAFF" | "ADMIN">(
    "CAMPER",
  );

  const userDirectoryQuery = useUserDirectory();

  const usersToDisplay = useMemo(() => {
    if (!userDirectoryQuery.data) return [];
    return Object.keys(userDirectoryQuery.data)
      .map((userId) => ({
        id: Number(userId),
        ...userDirectoryQuery.data[Number(userId)],
      }))
      .filter((user) => user.role === roleFilter)
      .filter((user) =>
        getFullName(user.name)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
  }, [userDirectoryQuery.data]);

  if (userDirectoryQuery.isPending) {
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

  if (userDirectoryQuery.isError) {
    return (
      <div className="max-w-[400px] m-[50px] border-[1.3px] border-black p-4 bg-neutral-2">
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
    <div className="max-w-[344px] border-[1.3px] border-black p-4 bg-neutral-2">
      {/* header with directory and expand button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black">DIRECTORY</h2>
        <ActionIcon
          variant="transparent"
          size="md"
          onClick={() => console.log("Redirect to expanded directory view")}
          aria-label="Expand directory view"
        >
          <MdFullscreen size={25} />
        </ActionIcon>
      </div>

      {/* search bar */}
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
        {/* radio options to choose */}
        <div className="flex gap-4 mt-4">
          <Radio value="CAMPER" label="Campers" />
          <Radio value="STAFF" label="Staff" />
          <Radio value="ADMIN" label="Admin" />
        </div>
      </RadioGroup>

      <div className="flex flex-col gap-4 mt-7">
        {usersToDisplay.map((user) => (
          <div key={user.id}>
            <div className="flex items-center gap-[32px]">
              <MdAccountCircle />
              <div>
                <p className="text-sm font-bold text-primary-5">
                  {getFullName(user.name)}
                  {/* {"bunk" in person &&
                    person.bunk !== undefined &&
                    ` (${person.bunk})`} */}
                </p>
              </div>
            </div>
            <hr className="mt-2 border-neutral-3" />
          </div>
        ))}
      </div>

      {usersToDisplay.length === 0 && (
        <p className="text-neutral-5 text-center my-4">No users found</p>
      )}
    </div>
  );
}
