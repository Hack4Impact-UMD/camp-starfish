import {
  isParsedEmployeeCsvData,
  isParsedFamilyCsvData,
  ParsedUsersCsvData,
  UsersCsvType,
  usersCsvTypes,
} from "@/features/userManagement/types";
import useParseFamilyCsv from "@/features/userManagement/useParseFamilyCsv";
import useParseEmployeeCsv from "@/features/userManagement/useParseEmployeeCsv";
import useProcessEmployeeCSV from "@/features/userManagement/useProcessEmployeeCSV";
import useProcessFamilyCSV from "@/features/userManagement/useProcessFamilyCSV";
import { MBToBytes } from "@/utils/fileUtils";
import { Button, Loader, Radio, Text } from "@mantine/core";
import { Dropzone, DropzoneProps } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";

const usersCsvTypeToLabel: Record<UsersCsvType, string> = {
  FAMILY: "Families (Campers + Parents)",
  EMPLOYEE: "Employees (Admins + Staff + Photographers)",
};

export function UploadUsersCsvModal() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<UsersCsvType>("FAMILY");

  const parseFamilyCsvMutation = useParseFamilyCsv();
  const parseEmployeeCsvMutation = useParseEmployeeCsv();
  const parsedData: ParsedUsersCsvData | undefined = csvType === "FAMILY" ? parseFamilyCsvMutation.data : parseEmployeeCsvMutation.data;

  const processFamilyCsvMutation = useProcessFamilyCSV();
  const processEmployeeCsvMutation = useProcessEmployeeCSV();

  const parseCsvFile = (usersCsvType: UsersCsvType, csvFile: File) => {
    (usersCsvType === "FAMILY"
      ? parseFamilyCsvMutation
      : parseEmployeeCsvMutation
    ).mutate({ csvFile });
    (usersCsvType === "FAMILY"
      ? parseEmployeeCsvMutation
      : parseFamilyCsvMutation
    ).reset();
    processFamilyCsvMutation.reset();
    processEmployeeCsvMutation.reset();
  };

  const handleFileSelect: DropzoneProps["onDrop"] = (files) => {
    const csvFile = files[0];
    setCsvFile(csvFile);
    parseCsvFile(csvType, csvFile);
  };

  const handleSubmit = () => {
    if (!parsedData) {
      return;
    } else if (csvType === "FAMILY" && isParsedFamilyCsvData(parsedData)) {
      processFamilyCsvMutation.mutate(
        { parsedFamilyCsvData: parsedData },
        { onSuccess: () => modals.closeAll() },
      );
      processEmployeeCsvMutation.reset();
    } else if (csvType === "EMPLOYEE" && isParsedEmployeeCsvData(parsedData)) {
      processEmployeeCsvMutation.mutate(
        { parsedEmployeeCsvData: parsedData },
        { onSuccess: () => modals.closeAll() },
      );
      processFamilyCsvMutation.reset();
    }
  };

  return (
    <div className="flex flex-col gap-md items-center">
      <Radio.Group
        classNames={{ root: "w-full" }}
        value={csvType}
        label={"Type of Users"}
      >
        <div className="flex flex-col gap-xs">
          {usersCsvTypes.map((type) => (
            <Radio
              key={type}
              value={type}
              label={usersCsvTypeToLabel[type]}
              onChange={() => {
                setCsvType(type);
                if (csvFile) {
                  parseCsvFile(type, csvFile);
                }
              }}
              required
            />
          ))}
        </div>
      </Radio.Group>
      <Dropzone
        onDrop={handleFileSelect}
        maxFiles={1}
        accept={["text/csv"]}
        maxSize={MBToBytes(5)}
      >
        <MdOutlineFileUpload size={60} />
        <Text>
          {csvFile
            ? `Selected File: "${csvFile.name}"`
            : "Upload a users CSV file exported from Campminder here (Max: 5MB)"}
        </Text>
      </Dropzone>
      {(parseFamilyCsvMutation.isPending ||
        parseEmployeeCsvMutation.isPending) && (
        <Loader className="self-center" size="xs" />
      )}
      {parseFamilyCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {parseFamilyCsvMutation.error.message}
        </Text>
      )}
      {parseEmployeeCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {parseEmployeeCsvMutation.error.message}
        </Text>
      )}
      <Button
        classNames={{ root: "self-center" }}
        onClick={handleSubmit}
        disabled={parsedData === undefined}
        loading={
          processFamilyCsvMutation.isPending ||
          processEmployeeCsvMutation.isPending
        }
      >
        Create Users
      </Button>
      {processFamilyCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {processFamilyCsvMutation.error.message}
        </Text>
      )}
      {processEmployeeCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {processEmployeeCsvMutation.error.message}
        </Text>
      )}
    </div>
  );
}

export default function openUploadUsersCsvModal() {
  modals.open({
    title: "Upload Users CSV",
    children: <UploadUsersCsvModal />,
  });
}
