"use client";

import React, { useState } from "react";
import { Card, TextInput, Radio, Group, Text, UnstyledButton, Avatar } from "@mantine/core";
import { IconSearch, IconArrowsMaximize } from "@tabler/icons-react";

interface DirectoryPerson {
  name: string;
  role: "CAMPER" | "STAFF" | "ADMIN";
}

interface DirectoryProps {
  people: DirectoryPerson[];
}

const VISIBLE_COUNT = 4;

export default function Directory({ people }: DirectoryProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("STAFF");
  const [expanded, setExpanded] = useState(false);

  const filtered = people
    .filter((p) => p.role === roleFilter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const visible = expanded ? filtered : filtered.slice(0, VISIBLE_COUNT);
  const hasMore = filtered.length > VISIBLE_COUNT;

  return (
    <Card withBorder className="w-[280px] shrink-0">
      <div className="flex items-center justify-between mb-3">
        <Text className="font-bold text-lg">DIRECTORY</Text>
        <UnstyledButton>
          <IconArrowsMaximize size={16} />
        </UnstyledButton>
      </div>

      <TextInput
        placeholder="Search directory..."
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="mb-3"
      />

      <Radio.Group value={roleFilter} onChange={setRoleFilter}>
        <Group className="mb-4">
          <Radio value="CAMPER" label="Campers" />
          <Radio value="STAFF" label="Staff" />
          <Radio value="ADMIN" label="Admin" />
        </Group>
      </Radio.Group>

      <div className="flex flex-col gap-2">
        {visible.map((person, idx) => (
          <div key={idx} className="flex items-center gap-3 py-1">
            <Avatar size="sm" radius="xl" color="gray" />
            <Text className="text-sm">{person.name}</Text>
          </div>
        ))}

        {filtered.length === 0 && (
          <Text className="text-sm text-gray-500">No results found</Text>
        )}
      </div>

      {hasMore && !expanded && (
        <UnstyledButton
          onClick={() => setExpanded(true)}
          className="mt-3 flex items-center justify-center gap-1 w-full"
        >
          <Text className="text-sm font-medium">View more</Text>
          <Text className="text-xs">&#9660;</Text>
        </UnstyledButton>
      )}
    </Card>
  );
}
