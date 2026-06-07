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
import {
  Button,
  Loader,
  Radio,
  ScrollArea,
  Select,
  Text,
  Title,
} from "@mantine/core";
import { Dropzone, DropzoneProps } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { EmployeeRole, Gender } from "@/types/users/userTypes";
import { getFullName } from "@/types/users/userUtils";
import EmployeeUsersInputTable from "./EmployeeUsersInputTable";
import { Moment } from "moment";

const usersCsvTypeToLabel: Record<UsersCsvType, string> = {
  FAMILY: "Families (Campers + Parents)",
  EMPLOYEE: "Employees (Admins + Staff + Photographers)",
};

export function UploadUsersCsvModal() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<UsersCsvType>("FAMILY");
  const [roleSelects, setRoleSelects] = useState<{
    [employeeId: number]: EmployeeRole | null;
  } | null>(null);
  const [genderSelects, setGenderSelects] = useState<{ [employeeId: number]: Gender | null; }>({});
  const [dateOfBirthSelects, setDateOfBirthSelects] = useState<{ [employeeId: number]: Moment | null; }>({});

  const parseFamilyCsvMutation = useParseFamilyCsv();
  const parseEmployeeCsvMutation = useParseEmployeeCsv();
  const parsedData: ParsedUsersCsvData | undefined =
    csvType === "FAMILY"
      ? parseFamilyCsvMutation.data
      : parseEmployeeCsvMutation.data;

  const processFamilyCsvMutation = useProcessFamilyCSV();
  const processEmployeeCsvMutation = useProcessEmployeeCSV();

  const parseCsvFile = (usersCsvType: UsersCsvType, csvFile: File) => {
    processFamilyCsvMutation.reset();
    processEmployeeCsvMutation.reset();
    if (usersCsvType === "FAMILY") {
      parseEmployeeCsvMutation.reset();
      parseFamilyCsvMutation.mutate({ csvFile });
      setRoleSelects(null);
    } else {
      parseFamilyCsvMutation.reset();
      parseEmployeeCsvMutation.mutate(
        { csvFile },
        {
          onSuccess: (data) => {
            const roleSelects: { [employeeId: number]: EmployeeRole } = {};
            data.forEach((employee) => (roleSelects[employee.id] = "STAFF"));
            setRoleSelects(roleSelects);
          },
        },
      );
    }
  };

  const handleUsersCsvTypeChange = (type: UsersCsvType) => {
    setCsvType(type);
    if (csvFile) {
      parseCsvFile(type, csvFile);
    }
  };

  const handleFileSelect: DropzoneProps["onDrop"] = (files) => {
    const csvFile = files[0];
    setCsvFile(csvFile);
    parseCsvFile(csvType, csvFile);
  };

  const handleSubmit = () => {
    if (!parsedData) {
      return;
    } else if (
      csvType === "FAMILY" &&
      isParsedFamilyCsvData(parsedData) &&
      !roleSelects
    ) {
      processFamilyCsvMutation.mutate(
        { parsedFamilyCsvData: parsedData },
        { onSuccess: () => modals.closeAll() },
      );
      processEmployeeCsvMutation.reset();
    } else if (
      csvType === "EMPLOYEE" &&
      isParsedEmployeeCsvData(parsedData) &&
      roleSelects
    ) {
      const employeeData = parsedData.map((employee) => ({
        ...employee,
        role: roleSelects[employee.id],
      }));
      processEmployeeCsvMutation.mutate(
        { parsedEmployeeCsvData: employeeData },
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
              onChange={() => handleUsersCsvTypeChange(type)}
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
      {parsedData && (
        <ScrollArea.Autosize className="max-h-[40vh] w-full">
          <Title order={6}>
            The following users were found. Please ensure they are correct
            before uploading.
          </Title>
          {isParsedFamilyCsvData(parsedData) ? (
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <Text>Campers</Text>
                {Object.keys(parsedData.campers).map((camperIdStr) => {
                  const camperId = parseInt(camperIdStr);
                  const camper = parsedData.campers[camperId];
                  return (
                    <div key={camperId} className="flex flex-row items-center w-full bg-neutral-3 rounded-sm p-xs">
                      <Text>{getFullName(camper.name)}</Text>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-xs">
                <Text>Parents</Text>
                {Object.keys(parsedData.parents).map((parentIdStr) => {
                  const parentId = parseInt(parentIdStr);
                  const parent = parsedData.parents[parentId];
                  return (
                    <div key={parentId} className="flex flex-row items-center w-full bg-neutral-3 rounded-sm p-xs">
                      <Text>
                        {getFullName(parent.name)} ({parent.email})
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <EmployeeUsersInputTable employees={parsedData} roleSelects={roleSelects!} setRoleSelects={setRoleSelects} genderSelects={genderSelects} setGenderSelects={setGenderSelects} dateOfBirthSelects={dateOfBirthSelects} setDateOfBirthSelects={setDateOfBirthSelects} />}
        </ScrollArea.Autosize>
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
    size: 'auto'
  });
}
