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
  Alert,
} from "@mantine/core";
import {
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconUserCircle,
  IconArrowsVertical,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeRole, UserRole } from "../types/personTypes";

// fetch function type for getting people data to display in the directory
type FetchPeopleFunction = () => Promise<Person[]>;

export type Person = {
  id: string | number;
  name: string;
  avatar?: string;
  role: EmployeeRole | UserRole | "PARENT" | "CAMPER";
  bunk?: number;
};

type SmallDirectoryBlockProps = {
  people?: Person[];
  fetchPeople?: FetchPeopleFunction;
  queryKey?: string[];
  onExpand?: () => void;
  viewMoreLink?: string;
  initialVisibleCount?: number;
  loadMoreCount?: number;
};

export function SmallDirectoryBlock({
  people: propsPeople,
  fetchPeople,
  queryKey = ["directory-people"],
  onExpand,
  initialVisibleCount = 4,
  loadMoreCount = 3,
}: SmallDirectoryBlockProps) {
  // react query if fetchPeople is provided, otherwise use props data
  const {
    data: queryData,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: fetchPeople || (() => Promise.resolve([])),
    enabled: !!fetchPeople,
  });

  const people = fetchPeople ? queryData || [] : propsPeople || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    EmployeeRole | UserRole | "CAMPER"
  >("CAMPER");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [showAll, setShowAll] = useState(false);

  // loading state
  if (isLoading && fetchPeople) {
    return (
      <Box
        p="md"
        style={{
          maxWidth: 400,
          margin: "50px",
          border: "1.3px solid black",
          padding: "15px",
          backgroundColor: "#FAFAFB",
        }}
      >
        <Group justify="space-between" mb="md">
          <Text size="xlg" fw={900}>
            DIRECTORY
          </Text>
        </Group>
        <Stack align="center" justify="center" style={{ minHeight: 200 }}>
          \{" "}
          <Text c="dimmed" size="sm">
            Loading directory...
          </Text>
        </Stack>
      </Box>
    );
  }

  // error state
  if (error && fetchPeople) {
    return (
      <Box
        p="md"
        style={{
          maxWidth: 400,
          margin: "50px",
          border: "1.3px solid black",
          padding: "15px",
          backgroundColor: "#FAFAFB",
        }}
      >
        <Group justify="space-between" mb="md">
          <Text size="xlg" fw={900}>
            DIRECTORY
          </Text>
        </Group>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error instanceof Error
            ? error.message
            : "Failed to load directory data"}
        </Alert>
      </Box>
    );
  }

  //filtering the people based on role in search
  const filteredPeople = people
    .filter(
      (person) =>
        person.role === roleFilter &&
        person.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, showAll ? people.length : visibleCount);

  // view more button that displays (all) people when clicked
  const handleViewMore = () => {
    if (showAll) {
      setShowAll(false);
      setVisibleCount(initialVisibleCount);
    } else {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, people.length));
      if (visibleCount + loadMoreCount >= people.length) {
        setShowAll(true);
      }
    }
  };

  return (
    <Box
      p="md"
      style={{
        maxWidth: 400,
        margin: "50px",
        border: "1.3px solid black",
        padding: "15px",
        backgroundColor: "#FAFAFB",
      }}
    >
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
          <IconArrowsVertical
            size={25}
            style={{ transform: "rotate(45deg)" }}
          />
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
        onChange={(value) =>
          setRoleFilter(value as EmployeeRole | UserRole | "CAMPER")
        }
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
                  {person.name}
                  {person.bunk !== undefined && `  (${person.bunk})`}
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
      {people.length > initialVisibleCount && (
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
