"use client";

import { Loader, MultiSelect } from "@mantine/core";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { MdError } from "react-icons/md";

export default function TagSelect() {
  const userDirectoryQuery = useUserDirectory();
  const tagOptions = Object.entries(userDirectoryQuery.data || {});

  if (userDirectoryQuery.isPending) {
    return (
      <MultiSelect
        placeholder="Loading data..."
        rightSection={<Loader size={20} />}
      />
    );
  } else if (userDirectoryQuery.isError) {
    return (
      <MultiSelect
        placeholder="Failed to load tags"
        rightSection={<MdError className="text-error" size={20} />}
        disabled
      />
    );
  }

  return (
    <MultiSelect
      placeholder="Search tags"
      data={tagOptions.map(([_userId, fullName]) => fullName)}
      searchable
      maxValues={5}
    />
  );
}
