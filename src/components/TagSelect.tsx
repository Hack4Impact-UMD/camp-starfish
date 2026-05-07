"use client";

import { Loader, MultiSelect } from '@mantine/core';
import useTagDirectory from '@/hooks/tags/useTagDirectory';
import { MdError } from 'react-icons/md';

export default function TagSelect() {
  const tagDirectoryQuery = useTagDirectory();
  const tagOptions = Object.entries(tagDirectoryQuery.data || {});

  if (tagDirectoryQuery.isPending) {
    return <MultiSelect
      placeholder="Loading data..."
      rightSection={<Loader size={20} />}
    />
  } else if (tagDirectoryQuery.isError) {
    return <MultiSelect
      placeholder="Failed to load tags"
      rightSection={<MdError className="text-error" size={20} />}
      disabled
    />
  }

  return <MultiSelect
    placeholder="Search tags"
    data={tagOptions.map(([_userId, fullName]) => fullName)}
    searchable
    maxValues={5}
  />
}