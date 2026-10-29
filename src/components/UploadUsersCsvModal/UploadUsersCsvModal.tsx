import {
  isParsedCounselorCsvData,
  isParsedFamilyCsvData,
  ParsedUsersCsvData,
  UsersCsvType,
  usersCsvTypes,
} from "@/features/userManagement/types";
import useParseFamilyCsv from "@/features/userManagement/useParseFamilyCsv";
import useParseCounselorCsv from "@/features/userManagement/useParseCounselorCsv";
import useProcessCounselorCsv from "@/features/userManagement/useProcessCounselorCsv";
import useProcessFamilyCsv from "@/features/userManagement/useProcessFamilyCsv";
import { MBToBytes } from "@/utils/fileUtils";
import { Button, Loader, Radio, ScrollArea, Text, Title } from "@mantine/core";
import { Dropzone, DropzoneProps } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { CounselorRole, Gender } from "@/types/users/userTypes";
import CounselorUsersInputTable from "./CounselorUsersInputTable";
import { Moment } from "moment";
import FamilyUsersInputTables from "./FamilyUsersInputTables";

const usersCsvTypeToLabel: Record<UsersCsvType, string> = {
  FAMILY: "Families (Campers + Parents)",
  COUNSELOR: "Counselors (Admins + Staff)",
};

export function UploadUsersCsvModal() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<UsersCsvType>("FAMILY");
  const [roleSelects, setRoleSelects] = useState<{
    [counselorId: number]: CounselorRole | null;
  } | null>(null);
  const [genderSelects, setGenderSelects] = useState<{
    [counselorId: number]: Gender | null;
  }>({});
  const [dateOfBirthSelects, setDateOfBirthSelects] = useState<{
    [counselorId: number]: Moment | null;
  }>({});

  const parseFamilyCsvMutation = useParseFamilyCsv();
  const parseCounselorCsvMutation = useParseCounselorCsv();
  const parsedData: ParsedUsersCsvData | undefined =
    csvType === "FAMILY"
      ? parseFamilyCsvMutation.data
      : parseCounselorCsvMutation.data;

  const processFamilyCsvMutation = useProcessFamilyCsv();
  const processCounselorCsvMutation = useProcessCounselorCsv();

  const parseCsvFile = (usersCsvType: UsersCsvType, csvFile: File) => {
    processFamilyCsvMutation.reset();
    processCounselorCsvMutation.reset();
    if (usersCsvType === "FAMILY") {
      parseCounselorCsvMutation.reset();
      parseFamilyCsvMutation.mutate(
        { csvFile },
        {
          onSuccess: (data) => {
            const genderSelects: { [counselorId: number]: Gender | null } = {};
            const dateOfBirthSelects: { [counselorId: number]: Moment | null } =
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
      parseCounselorCsvMutation.mutate(
        { csvFile },
        {
          onSuccess: (data) => {
            const roleSelects: { [counselorId: number]: CounselorRole | null } =
              {};
            const genderSelects: { [counselorId: number]: Gender | null } = {};
            const dateOfBirthSelects: { [counselorId: number]: Moment | null } =
              {};
            data.forEach((counselor) => {
              roleSelects[counselor.id] = null;
              genderSelects[counselor.id] = null;
              dateOfBirthSelects[counselor.id] = null;
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
      csvType === "COUNSELOR" &&
      isParsedCounselorCsvData(parsedData) &&
      roleSelects
    ) {
      for (const counselor of parsedData) {
        if (
          !roleSelects[counselor.id] ||
          !genderSelects[counselor.id] ||
          !dateOfBirthSelects[counselor.id]
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
      processCounselorCsvMutation.reset();
    } else if (
      csvType === "COUNSELOR" &&
      isParsedCounselorCsvData(parsedData) &&
      roleSelects
    ) {
      processCounselorCsvMutation.mutate(
        {
          // @ts-expect-error - Submit button is disabled if any field is missing
          counselors: parsedData.map((counselor) => ({
            ...counselor,
            role: roleSelects[counselor.id],
            gender: genderSelects[counselor.id],
            dateOfBirth: dateOfBirthSelects[counselor.id],
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
        parseCounselorCsvMutation.isPending) && (
        <Loader className="self-center" size="xs" />
      )}
      {parseFamilyCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {parseFamilyCsvMutation.error.message}
        </Text>
      )}
      {parseCounselorCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {parseCounselorCsvMutation.error.message}
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
              <CounselorUsersInputTable
                counselors={parsedData}
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
          processCounselorCsvMutation.isPending
        }
      >
        Create Users
      </Button>
      {processFamilyCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {processFamilyCsvMutation.error.message}
        </Text>
      )}
      {processCounselorCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {processCounselorCsvMutation.error.message}
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
