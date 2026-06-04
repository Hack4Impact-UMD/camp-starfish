import useProcessUsersCsv, {
  UsersCsvType,
  usersCsvTypes,
} from "@/features/userManagement/useProcessUsersCsv";
import { MBToBytes } from "@/utils/fileUtils";
import { Button, Radio, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
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

  const processUsersCsvMutation = useProcessUsersCsv(csvType);

  const handleSubmit = async () => {
    if (!csvFile) {
      return;
    }
    processUsersCsvMutation.mutate(
      { csvFile },
      { onSuccess: () => modals.closeAll() },
    );
  };

  return (
    <div className="flex flex-col gap-md">
      <div>
        <Dropzone
          onDrop={(files) => setCsvFile(files[0])}
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
        {processUsersCsvMutation.error && (
          <Text className="text-error text-sm text-center">
            {processUsersCsvMutation.error.message}
          </Text>
        )}
      </div>
      <Radio.Group value={csvType} label={"Type of Users"}>
        <div className="flex flex-col gap-xs">
          {usersCsvTypes.map((type) => (
            <Radio
              key={type}
              value={type}
              label={usersCsvTypeToLabel[type]}
              onChange={() => setCsvType(type)}
              required
            />
          ))}
        </div>
      </Radio.Group>
      <Button
        classNames={{ root: "self-center" }}
        onClick={handleSubmit}
        disabled={!csvFile || !csvType}
        loading={processUsersCsvMutation.isPending}
      >
        Create Users
      </Button>
    </div>
  );
}

export default function openUploadUsersCsvModal() {
  modals.open({
    title: "Upload Users CSV",
    children: <UploadUsersCsvModal />,
  });
}
