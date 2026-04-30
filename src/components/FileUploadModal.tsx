import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import { useRef, useState } from "react";

import { lookup,  } from "mime-types";
import Image from "next/image";
import { modals } from "@mantine/modals";
import { MdCheckCircle, MdClose, MdError, MdOutlineFileUpload } from "react-icons/md";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { Button, List, Loader, ScrollArea, Text } from "@mantine/core";
import useCreateAlbumItem, { CreateAlbumItemRequest } from "@/hooks/albumItems/useCreateAlbumItem";
import { useMutationState } from "@tanstack/react-query";
import { request } from "http";

type FileUploadModalProps = {
  children: React.ReactNode;
  onUpload: (files: File[]) => void;
  acceptedFileExtensions: string[];
  maxFileSize: number; // MB
};

type UploadState = "success" | "fail" | "none";
type FileStatus = "success" | "failure" | "pending";

function FileComponent({
  file,
  accepted,
  setFiles,
}: {
  file: File;
  accepted: boolean;
  setFiles: React.Dispatch<
    React.SetStateAction<
      {
        file: File;
        state: FileStatus;
      }[]
    >
  >;
}) {
  return (<></>
  );
}

function FinishedUploadView({
  uploadState,
  files,
}: {
  uploadState: UploadState;
  files: { file: File; state: FileStatus }[];
}) {
  return (
    <div className="mx-6 my-4">
      {uploadState === "success" ? <MdOutlineFileUpload /> : <MdError />}
      <span className="block text-center text-camp-primary font-bold font-lato text-xl">
        Upload {uploadState == "success" ? "successful" : "failed"}!
      </span>
      <span className="text-center text-camp-text-modalSecondaryTitle block m-4 text-sm">
        {files.filter((e) => e.state == "success").length} files{" "}
        {uploadState == "success" ? "uploaded." : "failed to upload."}
      </span>
      <div className="text-center">
        <DialogClose asChild>
          <button className="bg-camp-buttons-neutral text-bold font-lato text-camp-buttons-buttonTextLight px-12 py-2 rounded-full">
            Close
          </button>
        </DialogClose>

        <button className="bg-camp-primary text-bold font-lato text-camp-buttons-buttonTextDark ml-4 px-12 py-2 rounded-full">
          View
        </button>
      </div>
    </div>
  );
}

function UploadedFilesView({
  files,
  setFiles,
}: {
  files: { file: File; state: FileStatus }[];
  setFiles: React.Dispatch<
    React.SetStateAction<
      {
        file: File;
        state: FileStatus;
      }[]
    >
  >;
}) {
  return (
    <>
      <div className="h-80 overflow-y-scroll">
        {files
          .filter((e) => e.state == "success")
          .map((fileState) => (
            <FileComponent
              key={fileState.file.name}
              file={fileState.file}
              accepted={true}
              setFiles={setFiles}
            />
          ))}
      </div>
    </>
  );
}

interface UploadAlbumItemsModalProps {
  albumId: string;
}

export function UploadAlbumItemsModal(props: UploadAlbumItemsModalProps) {
  const { albumId } = props;

  const [files, setFiles] = useState<File[]>([]);
  const requestsRef = useRef<CreateAlbumItemRequest[]>([]);
  const acceptedFileExtensions = ["jpg", "png"];
  const maxFileSizeMB = 5;

  const createAlbumItemMutation = useCreateAlbumItem();

  const onDrop = (files: FileWithPath[]) => {
    console.log(files);
  }

  const onUpload = () => {
    const requests: CreateAlbumItemRequest[] = files.map(file => ({ albumId: "000f726f-2023-46c8-bd0b-4518751b494b", albumItem: file, inReview: true }));
    requestsRef.current = requests;
    requests.forEach(req => createAlbumItemMutation.mutate(req));
  }

  return (
    <>
    <Dropzone classNames={{ inner: 'flex flex-col justify-center items-center border-4 border-dashed border-orange-5 rounded-lg my-2 py-2' }} onDrop={onDrop} >
      <Text className="text-center">{`Supported file formats: ${acceptedFileExtensions.join(", ")} (Max ${maxFileSizeMB}MB)`}</Text>
      <MdOutlineFileUpload className="text-neutral-4" size={50} />
      <Text className="text-center">{"Drag and drop files"}</Text>
      <Text className="text-center">{"OR"}</Text>
      <Text className="text-center">{"Select from device"}</Text>
    </Dropzone>
    <ScrollArea.Autosize classNames={{
      root: 'max-h-80 my-2',
      content: 'flex flex-col justify-center self-center items-center gap-2'
    }}>
      {requestsRef.current.map(req => (<FileItem key={req.albumItem.name} req={req} />))}
    </ScrollArea.Autosize>
    <div className="flex justify-between w-full my-2 gap-2">
      <Button color="gray" className="text-black">CANCEL</Button>
      <Button color="green" onClick={onUpload}>UPLOAD</Button>
    </div>
    </>
  )
}

interface FileItemProps {
  req: CreateAlbumItemRequest;
}

function FileItem(props: FileItemProps) {
  const { req } = props;
  const mutation = useMutationState({
    filters: {
      predicate: (mutation) => {console.log('mut', mutation); return mutation.state.variables === req}
    },
    select: (mutation) => mutation
  })
  console.log('bruh', mutation)

  
  return <div className="flex bg-blue-0 rounded-sm p-2 justify-between gap-4 w-full" key={file.name}>
        <Text>{file.name}</Text>
        {/* <div className="flex gap-2"> */}
          {/* {state.length > 0 && state[state.length - 1].status === "success" ? <MdCheckCircle className="text-success" size={25} /> : state.length > 0 && state[state.length - 1].status === "error" ? <MdError className="text-error" size={25} /> : <Loader />} */}
          {/* <MdClose className="text-blue hover:bg-blue-1 rounded-lg cursor-pointer" size={25} /> */}
        {/* </div> */}
      </div>
}

export function FileUploadModal({
  children,
  onUpload,
  acceptedFileExtensions,
  maxFileSize,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<{ file: File; state: FileStatus }[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>("none");

  const mimeTypes: string[] = [
    ...new Set(
      acceptedFileExtensions
        .map((fileType: string) => lookup(fileType))
        .filter((mimeType: string | false) => mimeType)
    ),
  ] as string[];

  const inputAccept: Accept = {};
  mimeTypes.forEach((mimeType: string) => {
    inputAccept[mimeType] = [];
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: inputAccept,
    maxSize: maxFileSize * 1024 * 1024,
    onDrop: async (accepted: File[], rejected: FileRejection[]) => {
      setFiles((last) =>
        last
          .concat(accepted.map((f) => ({ file: f, state: "success" })))
          .concat(rejected.map((f) => ({ file: f.file, state: "failure" })))
      );
    },
  });

  return (
    <Dialog
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          setFiles([]);
          setUploadState("none");
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="bg-camp-primary fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg overflow-hidden">
          <div
            className={`flex justify-between items-center px-3 py-4 ${
              uploadState != "success" ? "" : "hidden"
            }`}
          >
            <DialogTitle className="text-2xl font-semibold text-camp-white font-lato">
              Upload Files
            </DialogTitle>
          </div>

          <div className="bg-white p-5">
            {uploadState == "success" ? (
              <FinishedUploadView uploadState={uploadState} files={files} />
            ) : (
              <>
                <div {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} />
                  {files.filter((e) => e.state == "success").length > 0 ? (
                    <UploadedFilesView files={files} setFiles={setFiles} />
                  ) : (
                    <InitialUploadView
                      acceptedFileExtensions={acceptedFileExtensions}
                      maxFileSize={maxFileSize}
                    />
                  )}
                </div>
              </>
            )}

            <div hidden={uploadState == "success"}>
              <DialogClose asChild>
                <button className="bg-camp-buttons-neutral text-bold font-lato text-camp-buttons-buttonTextLight mt-4 px-8 py-2 rounded-full">
                  Cancel
                </button>
              </DialogClose>

              <button
                hidden={files.filter((e) => e.state == "success").length == 0}
                onClick={async () => {
                  try {
                    await onUpload(
                      files
                        .filter((e) => e.state == "success")
                        .map((x) => x.file)
                    );
                    setUploadState("success");
                  } catch {
                    setUploadState("fail");
                    return;
                  }
                }}
                className="bg-camp-tert-green text-bold font-lato text-camp-buttons-buttonTextDark ml-2 mt-4 px-8 py-2 rounded-full"
              >
                Upload {files.filter((e) => e.state == "success").length} File
                {files.filter((e) => e.state == "success").length > 1
                  ? "s"
                  : ""}
              </button>
              <span
                className="ml-4 text-camp-text-error"
                hidden={
                  uploadState != "fail" ||
                  files.filter((e) => e.state == "success").length < 1
                }
              >
                {"Couldn't upload "}
                {files.filter((e) => e.state == "success").length} file
                {files.filter((e) => e.state == "success").length > 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export default function openFileUploadModal(props: FileUploadModalProps & { title: string; }) {
  const { title, ...rest } = props;
  modals.open({
    title: title ?? "Upload Files",
    children: <FileUploadModal {...rest} />,
  }); 
}