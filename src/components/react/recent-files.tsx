import React, { useState, useRef } from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { FileSelect } from "../../server/db/types";
import { CirclePlus, File, Loader, Trash2 } from "lucide-react";

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
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["files"],
    queryFn: () =>
      fetch("/api/files").then((res) => res.json() as Promise<FileSelect[]>),
  });

  if (isLoading || !data)
    return <div className="dark:text-white ">Loading...</div>;

  return data.map((file) => (
    <FilePreview key={file.id} name={file.name ?? ""} id={file.id} refetch={refetch} />
  ));
}

function FilePreview({ name, id, refetch }: { name: string; id: string, refetch: () => void}) {
  function navigateTo(href: string) {
    window.location.href = href;
  }

  const deleteMutation = useMutation({
    mutationFn: () => {
      return fetch(`/api/files/delete`, {
        method: "DELETE",
        body: JSON.stringify({ id } as { id: string }),
      });
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div
      className="h-72 bg-white cursor-pointer hover:scale-[1.015] my-2 transition-all ease-out duration-200"
      onClick={() => navigateTo(`/files/${id}`)}
    >
      <div className="relative h-72 outline outline-4 bg-white dark:bg-card outline-gray-200 dark:outline-borders flex flex-col">
        {/* tarjeta de archivo*/}
        <div className="flex h-full items-center justify-center">
          <File size={50} className="dark:stroke-white" />
        </div>
        <div className="bg-gray-400 dark:bg-card-footer h-20 w-full flex items-center justify-start px-2 text-xl font-medium outline z-20 outline-3 outline-gray-600 dark:outline-borders">
          <span className="flex w-full justify-between items-center">
            <p className="dark:text-white">{name}</p>
            {deleteMutation.isLoading ? (
              <Loader
                size={24}
                className="mr-2 dark:stroke-white motion-safe:animate-spin"
              />
            ) : (
              <div
                className="delete-button"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault(); // Prevent default anchor behavior
                  deleteMutation.mutate();
                }}
              >
                <Trash2
                  size={24}
                  className="mr-2 dark:stroke-white hover:cursor-pointer"
                />
              </div>
            )}
          </span>
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
      className="h-72 my-2 bg-white dark:bg-card outline outline-4 outline-gray-200 dark:outline-borders flex flex-col justify-center items-center text-lg hover:scale-[1.015] transition-all ease-out duration-200"
      onDragOver={onDragOver}
      onDragLeave={onDragleave}
      onDrop={onDragDrop}
    >
      {isLoading ? (
        <span className="text-lg dark:text-white">Uploading...</span>
      ) : (
        <>
          {isDragging ? (
            <span className="select text-lg">Drop files here</span>
          ) : (
            <>
              <button
                className="flex flex-col justify-center items-center"
                onClick={selectFiles}
              >
                <CirclePlus size={30} className="dark:stroke-white" />
                <p className="text-lg dark:text-white">Upload files</p>
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
