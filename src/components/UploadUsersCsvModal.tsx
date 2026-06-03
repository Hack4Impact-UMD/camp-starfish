import { toNormalCase } from "@/utils/stringUtils";
import { Radio, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";

type UsersCsvType = "FAMILY" | "EMPLOYEE";

const usersCsvTypes: UsersCsvType[] = ["FAMILY", "EMPLOYEE"];

export function UploadUsersCsvModal() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<UsersCsvType | null>(null);

  return (
    <>
      <Dropzone
        onDrop={(files) => setCsvFile(files[0])}
        maxFiles={1}
        accept={["text/csv"]}
      >
        <MdOutlineFileUpload size={60} />
        <Text>Upload a users CSV file exported from Campminder here</Text>
      </Dropzone>
      <Radio.Group>
        {usersCsvTypes.map((type) => (
          <Radio
            key={type}
            value={type}
            label={toNormalCase(type)}
            onChange={() => setCsvType(type)}
          />
        ))}
      </Radio.Group>
    </>
  );
}

export default function openUploadUsersCsvModal() {
  modals.open({
    title: "Upload Users CSV",
    children: <UploadUsersCsvModal />,
  });
}
