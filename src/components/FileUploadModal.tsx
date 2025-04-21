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

type FileUploadModalProps = {
  children: React.ReactNode;
  onUpload: (files: File[]) => void;
  acceptedFileExtensions: string[];
  maxFileSize: number; // MB
};

type UploadState = "success" | "fail" | "none";
type FileStatus = "success" | "failure" | "pending";

export default function FileUploadModal({
  children,
  onUpload,
  acceptedFileExtensions,
  maxFileSize,
}: FileUploadModalProps) {
  let [files, setFiles] = useState<{ file: File; state: FileStatus }[]>([]);
  let [uploadState, setUploadState] = useState<UploadState>("none");

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

  let { acceptedFiles, getRootProps, getInputProps } = useDropzone({
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

  function FileComponent({
    file,
    accepted,
  }: {
    file: File;
    accepted: boolean;
  }) {
    return (
      <div
        className="w-[35rem] my-1 py-3 px-3 bg-camp-background-formField text-camp-text-headingBody rounded-md flex flex-row items-center justify-between"
        key={file.name}
      >
        <span className="text-camp-text-headingBody text-sm">{file.name}</span>
        <div className="mr-1">
          <img
            src={accepted ? fileLoadIcon.src : alertIcon.src}
            className="w-6 h-6 inline-block"
          ></img>
          <img
            src={crossIcon.src}
            onClickCapture={() =>
              setFiles((last) => last.filter((e) => e.file != file))
            }
            className="w-5 h-5 inline-block cursor-pointer p-1 ml-4"
          ></img>
        </div>
      </div>
    );
  }

  function InitialUploadView() {
    return (
      <div className="border-4 border-dashed border-camp-tert-orange rounded-lg text-center px-32 py-12">
        <span className="block font-lato text-camp-text-subheading font-bold text-lg">
          Supported file formats:{" "}
          {acceptedFileExtensions.map((type: string) => type).join(", ")} (Max{" "}
          {maxFileSize}MB)
        </span>
        <img
          src={submitIcon.src}
          className="w-12 h-12 text-center block mx-auto m-4"
        ></img>
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

  function FinishedUploadView() {
    return (
      <div className="mx-6 my-4">
        <img
          src={uploadState == "success" ? uploadGreenIcon.src : alertIcon.src}
          className="w-6 h-6 text-center block mx-auto m-4"
        ></img>
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

  function UploadedFilesView() {
    return (
      <div className="h-[20rem] overflow-scroll">
        {files
          .filter((e) => e.state == "success")
          .map((fileState) => (
            <FileComponent
              key={fileState.file.name}
              file={fileState.file}
              accepted={true}
            />
          ))}
      </div>
    );
  }

  function BottomButtonsComponent() {
    return (
      <>
        <DialogClose asChild>
          <button className="bg-camp-buttons-neutral text-bold font-lato text-camp-buttons-buttonTextLight mt-4 px-8 py-2 rounded-full">
            Cancel
          </button>
        </DialogClose>

        <button
          hidden={files.filter((e) => e.state == "success").length == 0}
          onClick={async () => {
            try {
              onUpload(
                files.filter((e) => e.state == "success").map((x) => x.file)
              );
              setUploadState("success");
            } catch (err: unknown) {
              setUploadState("fail");
              console.error(err);
              return;
            }
          }}
          className="bg-camp-tert-green text-bold font-lato text-camp-buttons-buttonTextDark ml-2 mt-4 px-8 py-2 rounded-full"
        >
          Upload {files.filter((e) => e.state == "success").length} File
          {files.filter((e) => e.state == "success").length > 1 ? "s" : ""}
        </button>
      </>
    );
  }

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
              uploadState == "none" ? "" : "hidden"
            }`}
          >
            <DialogTitle className="text-2xl font-semibold text-camp-white font-lato">
              Upload Files
            </DialogTitle>
          </div>

          <div className="bg-white p-5">
            {uploadState != "none" ? (
              <FinishedUploadView />
            ) : (
              <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                {files.filter((e) => e.state == "success").length > 0 ? (
                  <>
                    <UploadedFilesView />
                    <BottomButtonsComponent />
                  </>
                ) : (
                  <>
                    <InitialUploadView />
                    <BottomButtonsComponent />
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
