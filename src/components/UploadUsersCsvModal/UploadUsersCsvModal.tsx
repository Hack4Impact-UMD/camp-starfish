import {
  isParsedEmployeeCsvData,
  isParsedFamilyCsvData,
  ParsedUsersCsvData,
  UsersCsvType,
  usersCsvTypes,
} from "@/features/userManagement/types";
import useParseFamilyCsv from "@/features/userManagement/useParseFamilyCsv";
import useParseEmployeeCsv from "@/features/userManagement/useParseEmployeeCsv";
import useProcessEmployeeCsv from "@/features/userManagement/useProcessEmployeeCsvtemp";
import useProcessFamilyCsv from "@/features/userManagement/useProcessFamilyCSVbruh";
import { MBToBytes } from "@/utils/fileUtils";
import { Button, Loader, Radio, ScrollArea, Text, Title } from "@mantine/core";
import { Dropzone, DropzoneProps } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { EmployeeRole, Gender } from "@/types/users/userTypes";
import EmployeeUsersInputTable from "./EmployeeUsersInputTable";
import { Moment } from "moment";
import FamilyUsersInputTables from "./FamilyUsersInputTables";

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
  const [genderSelects, setGenderSelects] = useState<{
    [employeeId: number]: Gender | null;
  }>({});
  const [dateOfBirthSelects, setDateOfBirthSelects] = useState<{
    [employeeId: number]: Moment | null;
  }>({});

  const parseFamilyCsvMutation = useParseFamilyCsv();
  const parseEmployeeCsvMutation = useParseEmployeeCsv();
  const parsedData: ParsedUsersCsvData | undefined =
    csvType === "FAMILY"
      ? parseFamilyCsvMutation.data
      : parseEmployeeCsvMutation.data;

  const processFamilyCsvMutation = useProcessFamilyCsv();
  const processEmployeeCsvMutation = useProcessEmployeeCsv();

  const parseCsvFile = (usersCsvType: UsersCsvType, csvFile: File) => {
    processFamilyCsvMutation.reset();
    processEmployeeCsvMutation.reset();
    if (usersCsvType === "FAMILY") {
      parseEmployeeCsvMutation.reset();
      parseFamilyCsvMutation.mutate(
        { csvFile },
        {
          onSuccess: (data) => {
            const genderSelects: { [employeeId: number]: Gender | null } = {};
            const dateOfBirthSelects: { [employeeId: number]: Moment | null } =
              {};
            [...data.campers, ...data.parents].forEach((familyMember) => {
              genderSelects[familyMember.id] = null;
              dateOfBirthSelects[familyMember.id] = null;
            });
            setGenderSelects(genderSelects);
            setDateOfBirthSelects(dateOfBirthSelects);
            setRoleSelects(null);
          },
        },
      );
    } else {
      parseFamilyCsvMutation.reset();
      parseEmployeeCsvMutation.mutate(
        { csvFile },
        {
          onSuccess: (data) => {
            const roleSelects: { [employeeId: number]: EmployeeRole | null } =
              {};
            const genderSelects: { [employeeId: number]: Gender | null } = {};
            const dateOfBirthSelects: { [employeeId: number]: Moment | null } =
              {};
            data.forEach((employee) => {
              roleSelects[employee.id] = null;
              genderSelects[employee.id] = null;
              dateOfBirthSelects[employee.id] = null;
            });
            setRoleSelects(roleSelects);
            setGenderSelects(genderSelects);
            setDateOfBirthSelects(dateOfBirthSelects);
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

  const areAllFieldsFilled = () => {
    if (!parsedData) {
      return true;
    } else if (csvType === "FAMILY" && isParsedFamilyCsvData(parsedData)) {
      for (const familyMember of [
        ...parsedData.campers,
        ...parsedData.parents,
      ]) {
        if (
          !genderSelects[familyMember.id] ||
          !dateOfBirthSelects[familyMember.id]
        ) {
          return false;
        }
      }
      return true;
    } else if (
      csvType === "EMPLOYEE" &&
      isParsedEmployeeCsvData(parsedData) &&
      roleSelects
    ) {
      for (const employee of parsedData) {
        if (
          !roleSelects[employee.id] ||
          !genderSelects[employee.id] ||
          !dateOfBirthSelects[employee.id]
        ) {
          return false;
        }
      }
      return true;
    }
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
        {
          // @ts-expect-error - Submit button is disabled if any field is missing
          campers: parsedData.campers.map((camper) => ({
            ...camper,
            gender: genderSelects[camper.id],
            dateOfBirth: dateOfBirthSelects[camper.id],
          })),
          // @ts-expect-error - Submit button is disabled if any field is missing
          parents: parsedData.parents.map((parent) => ({
            ...parent,
            gender: genderSelects[parent.id],
            dateOfBirth: dateOfBirthSelects[parent.id],
          })),
        },
        { onSuccess: () => modals.closeAll() },
      );
      processEmployeeCsvMutation.reset();
    } else if (
      csvType === "EMPLOYEE" &&
      isParsedEmployeeCsvData(parsedData) &&
      roleSelects
    ) {
      processEmployeeCsvMutation.mutate(
        {
          // @ts-expect-error - Submit button is disabled if any field is missing
          employees: parsedData.map((employee) => ({
            ...employee,
            role: roleSelects[employee.id],
            gender: genderSelects[employee.id],
            dateOfBirth: dateOfBirthSelects[employee.id],
          })),
        },
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
        <>
          <Title order={6}>
            The following users were found. Please provide the missing fields
            before uploading.
          </Title>
          <ScrollArea.Autosize className="max-h-[40vh] w-full">
            {isParsedFamilyCsvData(parsedData) ? (
              <FamilyUsersInputTables
                familyMembers={parsedData}
                genderSelects={genderSelects}
                setGenderSelects={setGenderSelects}
                dateOfBirthSelects={dateOfBirthSelects}
                setDateOfBirthSelects={setDateOfBirthSelects}
              />
            ) : (
              <EmployeeUsersInputTable
                employees={parsedData}
                roleSelects={roleSelects!}
                setRoleSelects={setRoleSelects}
                genderSelects={genderSelects}
                setGenderSelects={setGenderSelects}
                dateOfBirthSelects={dateOfBirthSelects}
                setDateOfBirthSelects={setDateOfBirthSelects}
              />
            )}
          </ScrollArea.Autosize>
        </>
      )}
      <Button
        classNames={{ root: "self-center" }}
        onClick={handleSubmit}
        disabled={parsedData === undefined || !areAllFieldsFilled()}
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
    size: "auto",
  });
}
