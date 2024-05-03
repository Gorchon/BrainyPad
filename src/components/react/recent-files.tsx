import React, { useState, useRef, useEffect } from "react";
import "./recent-files.css";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { FileSelect } from "../../server/db/types";

function RecentFiles() {
  return (
    <ReactQueryProvider>
      <div className="grid grid-cols-4 gap-8">
        <InnerRecentNotes />
        <UploadFileButton />
      </div>
    </ReactQueryProvider>
  );
}

function InnerRecentNotes() {
  const { data, isLoading } = useQuery({
    queryFn: () =>
      fetch("/api/files").then((res) => res.json() as Promise<FileSelect[]>),
    queryKey: "files",
  });

  if (isLoading || !data) return <div>Loading...</div>;

  return data.map((file) => (
    <FilePreview key={file.id} name={file.name ?? ""} id={file.id} />
  ));
}

function FilePreview({ name, id }: { name: string; id: string }) {
  function navigateTo(href: string) {
    window.location.href = href;
  }

  return (
    <div
      className="h-72 bg-gray-200 cursor-pointer"
      onClick={() => navigateTo(`/files/${id}`)}
    >
      <div className="uploadedFiles">
        <div className="img">
          <img src="../public/file.svg" alt="file" width={80} height={80} />
        </div>
        <div className="footer">
          <p>{name}</p>
          <div className="delete">
            <img src="../public/delete.svg" alt="file" width={40} height={40} />{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadFileButton() {
  const { mutate, isLoading } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return fetch("/api/files/new", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("files");
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function uploadFile(file: File) {
    mutate(file);
  }

  function selectFiles() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      uploadFile(file);
    }
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    console.log("onDragOver");
    event.preventDefault();
    setIsDragging(true);
    event.dataTransfer.dropEffect = "copy";
  }

  function onDragleave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDragDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = event.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      uploadFile(file);
    }
  }

  return (
    <div
      className="h-72 bg-gray-200"
      onDragOver={onDragOver}
      onDragLeave={onDragleave}
      onDrop={onDragDrop}
    >
      {isLoading ? (
        <span>Uploading...</span>
      ) : (
        <>
          {isDragging ? (
            <span className="select">Drop files here</span>
          ) : (
            <>
              <button className="input" onClick={selectFiles}>
                <img
                  src="../public/addFile.png"
                  alt="add File"
                  width={80}
                  height={80}
                />
                <p>Upload files</p>
              </button>
            </>
          )}

          <input
            type="file"
            className="hidden"
            multiple={false}
            ref={fileInputRef}
            onChange={onFileSelect}
            disabled={isLoading}
          />
        </>
      )}
    </div>
  );
}

export default RecentFiles;
