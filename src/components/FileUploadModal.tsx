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
import { useState } from "react";

// Icon Imports
import submitIcon from "@/assets/icons/submitIcon.svg";
import crossIcon from "@/assets/icons/xIconPrimary.svg";
import alertIcon from "@/assets/icons/alert.svg";
import fileLoadIcon from "@/assets/icons/fileLoadSuccessIcon.svg";
import uploadGreenIcon from "@/assets/icons/uploadGreen.svg";
import { lookup } from "mime-types";
import Image from "next/image";

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
  return (
    <div
      className="w-[35rem] my-1 py-3 px-3 bg-camp-background-formField text-camp-text-headingBody rounded-md flex flex-row items-center justify-between"
      key={file.name}
    >
      <span className="text-camp-text-headingBody text-sm">{file.name}</span>
      <div className="mr-1">
        <Image
          src={accepted ? fileLoadIcon.src : alertIcon.src}
          alt="File status icon"
          className="w-6 h-6 inline-block"
          width={24}
          height={24}
        />
        <Image
          src={crossIcon.src}
          alt="Delete file icon"
          onClickCapture={() =>
            setFiles((last) => last.filter((e) => e.file != file))
          }
          className="w-5 h-5 inline-block cursor-pointer p-1 ml-4"
          width={20}
          height={20}
        />
      </div>
    </div>
  );
}

function InitialUploadView({
  acceptedFileExtensions,
  maxFileSize,
}: {
  acceptedFileExtensions: string[];
  maxFileSize: number;
}) {
  return (
    <div className="border-4 border-dashed border-camp-tert-orange rounded-lg text-center px-32 py-12">
      <span className="block font-lato text-camp-text-subheading font-bold text-lg">
        Supported file formats:{" "}
        {acceptedFileExtensions.map((type: string) => type).join(", ")} (Max{" "}
        {maxFileSize}MB)
      </span>
      <Image
        src={submitIcon.src}
        alt="Submit"
        className="w-12 h-12 text-center block mx-auto m-4"
        width={48}
        height={48}
      />
      <span className="block font-lato text-camp-text-subheading font-bold text-lg m-2">
        Drag and drop files
      </span>
      <span className="block font-lato text-camp-text-subheading font-bold text-lg m-2">
        OR
      </span>
      <span className=" cursor-pointer block font-lato text-camp-text-link font-bold text-lg m-2">
        Select from device
      </span>
    </div>
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
      <Image
        src={uploadState == "success" ? uploadGreenIcon.src : alertIcon.src}
        alt={uploadState === "success" ? "Success" : "Error"}
        className="w-6 h-6 text-center block mx-auto m-4"
        width={24}
        height={24}
      />
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
      <div className="h-[20rem] overflow-y-scroll">
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

export default function FileUploadModal({
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
