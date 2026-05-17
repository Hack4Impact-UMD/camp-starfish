import { Button, Text } from "@mantine/core";
import { MdFlag } from "react-icons/md";
import openPhotoReportingModal from "../ReportAlbumItemModal";

interface AlbumItemViewModalReportSectionProps {
  albumId: string;
  albumItemId: string;
}

export default function AlbumItemViewModalReportSection(
  props: AlbumItemViewModalReportSectionProps,
) {
  const { albumId, albumItemId } = props;
  return (
    <div className="w-full bg-white rounded-t-2xl flex justify-center items-center px-lg py-md gap-4" onClick={(e) => e.stopPropagation()}>
      <Text>
        Something wrong with this image? Report your issue to the Camp Starfish
        team!
      </Text>
      <Button
        aria-label="Report"
        rightSection={<MdFlag size={20} />}
        onClick={() => openPhotoReportingModal(albumId, albumItemId)}
      >
        Report
      </Button>
    </div>
  );
}
