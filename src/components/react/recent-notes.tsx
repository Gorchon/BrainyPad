import React, { useMemo } from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { NoteSelect } from "../../server/db/types";
import type { NewNoteBody } from "../../pages/api/notes/new";
import { CirclePlus, GripHorizontal } from "lucide-react";

interface RecentNotesProps {
  children?: React.ReactNode;
}

const RecentNotes: React.FC<RecentNotesProps> = () => {
  return (
    <ReactQueryProvider>
      <div className="grid grid-cols-4 gap-8">
        <InnerRecentNotes />
        <CreateNoteButton />
      </div>
    </ReactQueryProvider>
  );
};

const InnerRecentNotes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () =>
      fetch("/api/notes").then((res) => res.json() as Promise<NoteSelect[]>),
  });

  if (isLoading || !data)
    return <div className="dark:text-white ">Loading...</div>;

  return data.map((note) => (
    <NotePreview
      key={note.id}
      content={note.content ?? ""}
      id={note.id}
      title={note.title ?? ""}
    />
  ));
};

const CreateNoteButton = () => {
  const { isLoading, mutate } = useMutation({
    mutationFn: () => {
      const name = prompt("Enter note name");

      return fetch("/api/notes/new", {
        method: "POST",
        body: JSON.stringify({ name } as NewNoteBody),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("notes");
    },
  });

  return (
    <button
      disabled={isLoading}
      className="h-72 my-2 bg-white dark:bg-card outline outline-4 outline-gray-200 dark:outline-borders flex flex-col justify-center space-x-3 items-center text-lg dark:text-white hover:scale-[1.015] transition-all ease-out duration-200"
      onClick={() => mutate()}
    >
      <CirclePlus size={30} className="dark:stroke-white" />
      {isLoading ? "Creating" : "Create"} Note
    </button>
  );
};

const NotePreview = ({
  title,
  content,
  id,
}: {
  title: string;
  content: string;
  id: string;
}) => {
  // get first 100 characters of content
  const contentExcerpt = useMemo(() => content.slice(0, 100), [content]);

  return (
    <div className="h-72 outline outline-4 bg-white dark:bg-card outline-gray-200 dark:outline-borders flex flex-col justify-end hover:scale-[1.015] z-0 transition-all ease-out duration-20 my-2">
      <div className="bg-gray-400 dark:bg-card-footer h-16 w-full flex items-center justify-start px-2 text-xl font-medium outline z-20 outline-3 outline-gray-600 dark:outline-borders">
        <span className="flex w-full justify-between items-center">
          <a className="dark:text-white" href={`/notes/${id}`}>
            {title}
          </a>
          <GripHorizontal size={24} className="mr-2 dark:stroke-white" />
        </span>
      </div>
    </div>
  );
};

export default RecentNotes;
