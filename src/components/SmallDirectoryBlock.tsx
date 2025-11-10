"use client";
import { useState } from "react";
import {
  TextInput,
  Radio,
  Group,
  Text,
  Box,
  Stack,
  Button,
  ActionIcon,
  Divider,
  RadioGroup,
} from "@mantine/core";
import {
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconUserCircle,
  IconArrowsVertical,
} from "@tabler/icons-react";
import { UserRole, CamperID, StaffID, AdminID } from "../types/personTypes";
import {CamperAttendee} from "../types/sessionTypes";

// types displayed in directory
type CamperWithBunk = CamperID & { bunk?: number };
type DirectoryPersonType = CamperWithBunk | StaffID | AdminID;

type SmallDirectoryBlockProps = {
  people: DirectoryPersonType[];
  onExpand?: () => void;
  initialVisibleCount?: number;
  loadMoreCount?: number;
};

export function SmallDirectoryBlock({
  people,
  onExpand,
  initialVisibleCount = 4,
  loadMoreCount = 3,
}: SmallDirectoryBlockProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "CAMPER">("CAMPER");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [showAll, setShowAll] = useState(false);

  //filtering the people based on role in search
  //calulate filtered people before slicing
  const filteredBeforeSlice = people.filter((person) => {
    const fullName =
      `${person.name.firstName} ${person.name.lastName}`.toLowerCase();
    return (
      person.role === roleFilter && fullName.includes(searchQuery.toLowerCase())
    );
  });
  const filteredCount = filteredBeforeSlice.length;
  const filteredPeople = filteredBeforeSlice.slice(
    0,
    showAll ? undefined : visibleCount
  );
  // view more button that displays (all) people when clicked
  const handleViewMore = () => {
    if (showAll) {
      setShowAll(false);
      setVisibleCount(initialVisibleCount);
    } else {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, filteredCount));
      if (visibleCount + loadMoreCount >= filteredCount) {
        setShowAll(true);
      }
    }
  };

  return (
    <Box className="max-w-[400px] m-[50px] border border-black p-4 bg-[#FAFAFB]">
      {/* header with directory and expand button */}
      <Group justify="space-between" mb="md">
        <Text size="xlg" fw={900}>
          DIRECTORY
        </Text>
        <ActionIcon
          variant="transparent"
          size="md"
          onClick={onExpand}
          aria-label="Expand directory view"
        >
          <IconArrowsVertical size={25} className="rotate-45" />
        </ActionIcon>
      </Group>

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
        onChange={(value) => setRoleFilter(value as UserRole | "CAMPER")}
      >
        {/* radio options to choose */}
        <Group mt="lg">
          <Radio value="CAMPER" label="Campers" />
          <Radio value="STAFF" label="Staff" />
          <Radio value="ADMIN" label="Admin" />
        </Group>
      </RadioGroup>

      <Stack gap="lg" mt="lg">
        {filteredPeople.map((person) => (
          <Box key={person.id}>
            <Group wrap="nowrap" gap="sm">
              <IconUserCircle size={32} />
              <div>
                <Text size="sm" fw={700}>
                  {/* display bunk number for campers if available */}
                  {`${person.name.firstName} ${person.name.lastName}`}
                  {person.role === 'CAMPER' && 'bunk' in person && person.bunk !== undefined && (
                    <Text span ml={8}>
                      ({person.bunk})
                    </Text>
                  )}
                </Text>
              </div>
            </Group>
            <Divider mt="sm" />
          </Box>
        ))}
      </Stack>

      {filteredPeople.length === 0 && (
        <Text c="dimmed" ta="center" my="md">
          No people found
        </Text>
      )}

      {/* bottom button */}
      {filteredCount > initialVisibleCount && (
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
    </Box>
  );
}
