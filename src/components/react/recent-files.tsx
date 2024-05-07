import React, { useState, useRef, useEffect } from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { FileSelect } from "../../server/db/types";
import { CirclePlus, Trash, File } from "lucide-react";

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
      className="h-72 bg-white cursor-pointer hover:scale-[1.015] my-2 transition-all ease-out duration-200"
      onClick={() => navigateTo(`/files/${id}`)}
    >
      <div className="relative h-72 outline outline-4 bg-white outline-gray-200 flex flex-col justify-center">  {/* tarjeta de archivo*/}
        <div className="flex justify-center">
          <File size={50}/>
        </div>
        <div className=" absolute bottom-0 w-full px-4 h-16 py-2 text-xl outline outline-1 outline-gray-600 bg-gray-400 flex flex-row"> 
          <p>{name}</p>
          <Trash size={32} />
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
      className="h-72 my-2 bg-white outline outline-4 outline-gray-200 flex flex-col justify-center items-center text-lg hover:scale-[1.015] transition-all ease-out duration-200"
      onDragOver={onDragOver}
      onDragLeave={onDragleave}
      onDrop={onDragDrop}
    >
      {isLoading ? (
        <span className="text-lg">Uploading...</span>
      ) : (
        <>
          {isDragging ? (
            <span className="select text-lg">Drop files here</span>
          ) : (
            <>
              <button className="flex flex-col justify-center items-center" onClick={selectFiles}>
                <CirclePlus size={30}/>
                <p className="text-lg">Upload files</p>
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
