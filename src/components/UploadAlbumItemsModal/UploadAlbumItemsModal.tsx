import { cloneElement, JSX, useRef, useState } from "react";
import { extension } from "mime-types";
import { modals } from "@mantine/modals";
import {
  MdCheckCircle,
  MdClose,
  MdError,
  MdOutlineFileUpload,
} from "react-icons/md";
import { Dropzone, FileRejection, FileWithPath } from "@mantine/dropzone";
import { Button, Loader, ScrollArea, Text } from "@mantine/core";
import useCreateAlbumItem, {
  CreateAlbumItemRequest,
} from "@/hooks/albumItems/useCreateAlbumItem";
import { useIsMutating, useMutationState } from "@tanstack/react-query";
import useNotifications from "@/features/notifications/useNotifications";
import { MBToBytes } from "@/utils/fileUtils";
import classNames from "classnames";

interface UploadAlbumItemsModalProps {
  albumId: string;
}

export function UploadAlbumItemsModal(props: UploadAlbumItemsModalProps) {
  const { albumId } = props;

  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const requestsRef = useRef<CreateAlbumItemRequest[]>([]);
  const acceptedMimeTypes = ["image/jpeg", "image/png", "image/heic", "image/gif", "video/mp4", "video/quicktime"];
  const maxFileSizeMB = 5;

  const createAlbumItemMutation = useCreateAlbumItem();
  const numMutating = useIsMutating({
    mutationKey: ['albumItems', 'create'],
    predicate: (mutation) => acceptedFiles.includes(mutation.state.variables.albumItem) && mutation.state.status === 'pending'
  });
  const isMutating = numMutating !== 0;

  const notifications = useNotifications();

  const onDrop = (files: FileWithPath[]) => {
    setAcceptedFiles((prev) => [...prev, ...files]);
    files.forEach(file => requestsRef.current.push({
      albumId: "000f726f-2023-46c8-bd0b-4518751b494b",
      albumItem: file,
      inReview: true
    }))
  };

  const onReject = (fileRejections: FileRejection[]) => {
    const rejectionMessage = fileRejections.length === 1 ? '1 file was rejected because it does not meet the specified requirements.' : `${fileRejections.length} files were rejected because they do not meet the specified requirements.`
    notifications.error(rejectionMessage);
  }

  const onUpload = async () => {
    const responses = await Promise.allSettled(requestsRef.current.map((req) => createAlbumItemMutation.mutateAsync(req)));
    const errors = responses.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      notifications.error(`Failed to upload ${errors.length} files. Please try again.`);
    } else {
      notifications.success(`${responses.length} files uploaded successfully!`);
      modals.closeAll();
    }
  };

  return (
    <>
      <Dropzone        
        classNames={{
          inner:
            "flex flex-col justify-center items-center border-4 border-dashed border-orange-5 rounded-lg my-2 p-2",
        }}
        accept={acceptedMimeTypes}
        maxSize={MBToBytes(maxFileSizeMB)}
        onDrop={onDrop}
        onReject={onReject}
      >
        <Text className="text-center">{`Supported file types: ${acceptedMimeTypes.map(mimeType => extension(mimeType)).join(", ")} (Max ${maxFileSizeMB}MB)`}</Text>
        <MdOutlineFileUpload className="text-neutral-4" size={50} />
        <Text className="text-center">{"Drag and drop files"}</Text>
        <Text className="text-center">{"OR"}</Text>
        <Text className="text-center">{"Select from device"}</Text>
      </Dropzone>
      <ScrollArea.Autosize
        classNames={{
          root: "max-h-80 my-2",
          content:
            "flex flex-col justify-center self-center items-center gap-2",
        }}
      >
        {acceptedFiles.map((file) => (
          <FileItem key={file.name} file={file} />
        ))}
      </ScrollArea.Autosize>
      <div className="flex justify-between w-full my-2 gap-2">
        <Button color="gray" className="text-black" onClick={() => modals.closeAll()}>
          CANCEL
        </Button>
        <Button color="green" onClick={onUpload} loading={isMutating} disabled={isMutating || acceptedFiles.length === 0}>
          UPLOAD
        </Button>
      </div>
    </>
  );
}

interface FileItemProps {
  file: File;
}

function FileItem(props: FileItemProps) {
  const { file } = props;
  const status = useMutationState({
    filters: {
      mutationKey: ['albumItems', 'create'],
      predicate: (mutation) => mutation.state.variables?.albumItem === file,
    },
    select: (mutation) => mutation.state.status,
  });

  let icon: JSX.Element;
  switch (status[status.length - 1]) {
    case "success":
      icon = <MdCheckCircle className="text-success" size={25} />;
      break;
    case "error":
      icon = <MdError className="text-error" size={25} />;
      break;
    case "pending":
      icon = <Loader size={25} />;
      break;
    case "idle":
    default:
      icon = <MdClose className="text-blue hover:bg-blue-1 rounded-lg cursor-pointer" size={25} />;
  }

  return (
    <div
      className="flex bg-blue-0 rounded-sm p-2 justify-between gap-4 w-full"
      key={file.name}
    >
      <Text>{file.name}</Text>
      {cloneElement(icon, { className: classNames('min-w-6 self-center', icon.props.className) })}
    </div>
  );
}

export default function openUploadAlbumItemsModal(albumId: string) {
  modals.open({
    title: "Upload Album Items",
    children: <UploadAlbumItemsModal albumId={albumId} />,
  });
}
