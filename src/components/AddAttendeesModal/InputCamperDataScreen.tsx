import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  useAddAttendeesModalStoreActions,
  useAdditionalCamperData,
} from "./AddAttendeesModalStore";
import { AGE_GROUPS, CamperAttendee } from "@/types/sessions/sessionTypes";
import useUserDirectory from "@/hooks/users/useUserDirectory";
import { getFullName } from "@/types/users/userUtils";
import { NumberInput, Select, Table } from "@mantine/core";
import { getObjectKeysAsNumbers } from "@/utils/stringUtils";

export default function InputCamperDataScreen() {
  const additionalCamperData = useAdditionalCamperData();
  const { setAgeGroup, setBunk } = useAddAttendeesModalStoreActions();

  const userDirectoryQuery = useUserDirectory();

  if (!userDirectoryQuery.data) return null;

  const columnHelper = createColumnHelper<number>();
  const columns = [
    columnHelper.accessor((camperId) => camperId, { header: "ID" }),
    columnHelper.accessor(
      (camperId) => getFullName(userDirectoryQuery.data?.[camperId].name),
      { header: "Name" },
    ),
    columnHelper.accessor(
      (camperId) => additionalCamperData[camperId]?.ageGroup,
      {
        header: "Age Group",
        cell: ({ cell, row }) => (
          <Select value={cell.getValue()} data={AGE_GROUPS} />
        ),
      },
    ),
    columnHelper.accessor((camperId) => additionalCamperData[camperId]?.bunk, {
      header: "Bunk",
      cell: ({ cell, row }) => <NumberInput value={cell.getValue()} />,
    }),
  ];

  const table = useReactTable({
    data: getObjectKeysAsNumbers(additionalCamperData),
    columns,
    getCoreRowModel: getCoreRowModel()
  });
}
