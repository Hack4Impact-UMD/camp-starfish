import { Button, Text } from "@mantine/core";
import { MdFlag } from "react-icons/md";

export default function AlbumItemViewModalReportSection() {
  return (
    <div className="w-full bg-white rounded-t-2xl flex justify-center items-center px-lg py-md gap-4">
      <Text>
        Something wrong with this image? Report your issue to the Camp Starfish
        team!
      </Text>
      <Button aria-label="Report" rightSection={<MdFlag size={20} />}>
        Report
      </Button>
    </div>
  );
}