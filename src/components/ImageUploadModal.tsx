import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import submitIconUrl from "@/assets/icons/submitIcon.svg";
import { useDropzone } from "react-dropzone";
import { useState } from "react";

const MAX_FILE_SIZE = 5*1024*1024; // 5 MB

type ImageUploadModalProps = {
  children: React.ReactNode;
  albumID: string;
};

export default function ImageUploadModal({ children }: ImageUploadModalProps) {

  // TODO: use onDrop which takes in accepted files on each new drop
  // TODO; also use onRejectedDrop or something that gets the new rejected files on each drop

  let { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpeg": [],
    },
    maxSize: MAX_FILE_SIZE,
    onDrop: (accepted, rejected) => {
      console.log(accepted);
      console.log(rejected);
      setStagedFiles(last => last.concat(accepted));
    }
  });

  let [stagedFiles, setStagedFiles] = useState<File[]>([]);
  let [failedFiles, setFailedFiles] = useState<File[]>([]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="bg-camp-primary fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-3 py-4">
            <DialogTitle className="text-2xl font-semibold text-camp-white font-lato">
              Upload Photos
            </DialogTitle>
            <DialogClose className="font-bold px-2">
              X {/* TODO: change to icon */}
            </DialogClose>
          </div>

          <div className="bg-white p-5">
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              {stagedFiles.length > 0 ? (
                <div className="h-[20rem] overflow-scroll">
                  {stagedFiles.map((file) => (
                    <div className="block w-[35rem] my-1 py-3 px-3 bg-camp-background-formField text-camp-text-headingBody rounded-md" key={file.name}>
                      <span className="text-camp-text-headingBody text-sm ">{file.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-4 border-dashed border-camp-tert-orange rounded-lg text-center px-32 py-12">
                  <span className="block font-lato text-camp-text-subheading font-bold text-lg">
                    Supported photo formats: JPG, PNG, (Max 5MB)
                  </span>
                  <img
                    src={submitIconUrl.src}
                    className="w-12 h-12 text-center block mx-auto m-4"
                  ></img>
                  <span className="block font-lato text-camp-text-subheading font-bold text-lg m-2">
                    Drag and drop photos
                  </span>
                  <span className="block font-lato text-camp-text-subheading font-bold text-lg m-2">
                    OR
                  </span>
                  <span className=" cursor-pointer block font-lato text-camp-text-link font-bold text-lg m-2">
                    Select from device
                  </span>
                </div>
              )}
              
            </div>
            <div>
                <button className="bg-camp-buttons-neutral text-bold font-lato text-camp-buttons-buttonTextLight mt-4 px-8 py-2 rounded-full">
                  Cancel
                </button>
                {stagedFiles.length > 0 ? (
                  <button className="bg-camp-tert-green text-bold font-lato text-camp-buttons-buttonTextDark ml-2 mt-4 px-8 py-2 rounded-full">
                    Upload {stagedFiles.length} Photo{(stagedFiles.length > 1 ? 's' : '')}
                  </button>
                ) : null}
              </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
