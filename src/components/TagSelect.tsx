"use client";

import { Loader, MultiSelect } from "@mantine/core";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { MdError } from "react-icons/md";
import { getFullName } from "@/types/users/userUtils";

export default function TagSelect() {
  const userDirectoryQuery = useUserDirectory();

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

  const userDirectory = userDirectoryQuery.data;
  return (
    <MultiSelect
      placeholder="Search tags"
      data={Object.keys(userDirectory)}
      renderOption={(optionInput) => getFullName(userDirectory[Number(optionInput.option.value)].name)}
      filter={(filterObj) => filterObj.options.filter((option) => 'value' in option && getFullName(userDirectory[Number(option.value)].name).toLowerCase().includes(filterObj.search.toLowerCase())).slice(0, filterObj.limit)}
      searchable
      maxValues={5}
    />
  );
}
