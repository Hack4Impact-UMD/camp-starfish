import {
  isParsedCounselorCsvData,
  isParsedCamperCsvData,
  ParsedUsersCsvData,
  UsersCsvType,
  usersCsvTypes,
} from "@/features/userManagement/types";
import useParseCamperCsv from "@/features/userManagement/useParseCamperCsv";
import useParseCounselorCsv from "@/features/userManagement/useParseCounselorCsv";
import useProcessCounselorCsv from "@/features/userManagement/useProcessCounselorCsv";
import useProcessCamperCsv from "@/features/userManagement/useProcessCamperCsv";
import { MBToBytes } from "@/utils/fileUtils";
import { Button, Loader, Radio, ScrollArea, Text, Title } from "@mantine/core";
import { Dropzone, DropzoneProps } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { CounselorRole, Gender } from "@/types/users/userTypes";
import CounselorUsersInputTable from "./CounselorUsersInputTable";
import { Moment } from "moment";
import CamperUsersInputTables from "./CamperUsersInputTables";

const usersCsvTypeToLabel: Record<UsersCsvType, string> = {
  CAMPER: "Campers",
  COUNSELOR: "Counselors (Admins + Staff)",
};

export function UploadUsersCsvModal() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<UsersCsvType>("CAMPER");
  const [roleSelects, setRoleSelects] = useState<{
    [counselorId: number]: CounselorRole | null;
  } | null>(null);
  const [genderSelects, setGenderSelects] = useState<{
    [counselorId: number]: Gender | null;
  }>({});
  const [dateOfBirthSelects, setDateOfBirthSelects] = useState<{
    [counselorId: number]: Moment | null;
  }>({});

  const parseCamperCsvMutation = useParseCamperCsv();
  const parseCounselorCsvMutation = useParseCounselorCsv();
  const parsedData: ParsedUsersCsvData | undefined =
    csvType === "CAMPER"
      ? parseCamperCsvMutation.data
      : parseCounselorCsvMutation.data;

  const processCamperCsvMutation = useProcessCamperCsv();
  const processCounselorCsvMutation = useProcessCounselorCsv();

  const parseCsvFile = (usersCsvType: UsersCsvType, csvFile: File) => {
    processCamperCsvMutation.reset();
    processCounselorCsvMutation.reset();
    if (usersCsvType === "CAMPER") {
      parseCounselorCsvMutation.reset();
      parseCamperCsvMutation.mutate(
        { csvFile },
        {
          onSuccess: (data) => {
            const genderSelects: { [counselorId: number]: Gender | null } = {};
            const dateOfBirthSelects: { [counselorId: number]: Moment | null } =
              {};
            data.campers.forEach((camper) => {
              genderSelects[camper.id] = null;
              dateOfBirthSelects[camper.id] = null;
            });
            setGenderSelects(genderSelects);
            setDateOfBirthSelects(dateOfBirthSelects);
            setRoleSelects(null);
          },
        },
      );
    } else {
      parseCamperCsvMutation.reset();
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
    } else if (csvType === "CAMPER" && isParsedCamperCsvData(parsedData)) {
      for (const camper of parsedData.campers) {
        if (
          !genderSelects[camper.id] ||
          !dateOfBirthSelects[camper.id]
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
      csvType === "CAMPER" &&
      isParsedCamperCsvData(parsedData) &&
      !roleSelects
    ) {
      processCamperCsvMutation.mutate(
        {
          // @ts-expect-error - Submit button is disabled if any field is missing
          campers: parsedData.campers.map((camper) => ({
            ...camper,
            gender: genderSelects[camper.id],
            dateOfBirth: dateOfBirthSelects[camper.id],
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
      processCamperCsvMutation.reset();
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
      {(parseCamperCsvMutation.isPending ||
        parseCounselorCsvMutation.isPending) && (
        <Loader className="self-center" size="xs" />
      )}
      {parseCamperCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {parseCamperCsvMutation.error.message}
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
            {isParsedCamperCsvData(parsedData) ? (
              <CamperUsersInputTables
                campers={parsedData}
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
          processCamperCsvMutation.isPending ||
          processCounselorCsvMutation.isPending
        }
      >
        Create Users
      </Button>
      {processCamperCsvMutation.error && (
        <Text className="text-error text-sm text-center">
          {processCamperCsvMutation.error.message}
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
