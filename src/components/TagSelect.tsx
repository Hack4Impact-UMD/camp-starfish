"use client";

import { Loader, MultiSelect, Pill, Text } from "@mantine/core";
import usePersonDirectory from "@/hooks/people/usePersonDirectory";
import { MdError } from "react-icons/md";
import { getFullName } from "@/types/people/personUtils";

export default function TagSelect() {
  const personDirectoryQuery = usePersonDirectory();

  if (personDirectoryQuery.isPending) {
    return (
      <MultiSelect
        placeholder="Loading data..."
        rightSection={<Loader size={20} />}
      />
    );
  } else if (personDirectoryQuery.isError) {
    return (
      <MultiSelect
        placeholder="Failed to load tags"
        rightSection={<MdError className="text-error" size={20} />}
        disabled
      />
    );
  }

  const personDirectory = personDirectoryQuery.data;
  return (
    <MultiSelect
      placeholder="Search tags"
      data={Object.keys(personDirectory)}
      renderOption={(optionInput) => <div className="flex flex-col">
        <Text className="text-sm">{getFullName(personDirectory[Number(optionInput.option.value)].name)}</Text>
        <Text className="text-xs">ID: {optionInput.option.value}</Text>
      </div>}
      renderPill={(optionInput) => <Pill>{getFullName(personDirectory[Number(optionInput.option.value)].name)}</Pill>}
      filter={(filterObj) => filterObj.options.filter((option) => 'value' in option && getFullName(personDirectory[Number(option.value)].name).toLowerCase().includes(filterObj.search.toLowerCase())).slice(0, filterObj.limit)}
      searchable
      hidePickedOptions
      maxValues={5}
    />
  );
}
