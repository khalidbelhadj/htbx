"use client";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadToS3 } from "./s3-actions";

type Props = {
  children: React.ReactNode;
};

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};
export function DropZone({ children }: Props) {
  const [openModal, setOpenModal] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const { getRootProps, isDragAccept, isDragReject, acceptedFiles } =
    useDropzone({
      accept: { "application/pdf": [] },
      noClick: true,
      onDropAccepted(files, event) {
        setOpenModal(true);
      },
    });

  async function upload() {
    const file = acceptedFiles[0];
    setOpenModal(false);
    const formData = new FormData();
    formData.append("file", file);
    const img = await uploadToS3(formData, tags);
    // append img to div with id img
    const imgElement = document.createElement("img");
    imgElement.src = "data:image/png;base64," + img;
    imgElement.width = 200;
    imgElement.height = 200;
    const imgDiv = document.getElementById("img");
    imgDiv.appendChild(imgElement);
  }

  return (
    <div
      className={cn(
        "transition-all h-full rounded-sm outline outline-[#fff0]",
        isDragAccept && "outline outline-offset-1 outline-4 outline-green-400",
        isDragReject && "outline outline-offset-1 outline-4 outline-red-500"
      )}
      {...getRootProps()}
    >
      {isDragAccept}
      {isDragReject}

      {openModal && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File Confirmation</DialogTitle>
              <DialogDescription>
                Would you like to upload {acceptedFiles[0].name}?

                <input type="text" onChange={(e) => {
                  const tags = e.target.value.split(",")
                  setTags(tags)
                }} />
              </DialogDescription>
              <Button onClick={upload}>Upload</Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
      <div id="img"></div>
      {children}
    </div>
  );
}
