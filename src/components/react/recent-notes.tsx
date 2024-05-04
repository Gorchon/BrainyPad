import React, { useMemo } from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { NoteSelect } from "../../server/db/types";
import type { NewNoteBody } from "../../pages/api/notes/new";
import { CirclePlus } from "lucide-react";

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
    queryFn: () =>
      fetch("/api/notes").then((res) => res.json() as Promise<NoteSelect[]>),
    queryKey: "notes",
  });

  if (isLoading || !data) return <div>Loading...</div>;

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
      className="h-72 my-2 bg-white outline outline-4 outline-gray-200 flex flex-col justify-center space-x-3 items-center text-lg hover:scale-[1.015] transition-all ease-out duration-200"
      onClick={() => mutate()}
    >
      <CirclePlus size={30}/>
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
    <div className="h-72 bg-gray-200">
      <p>{contentExcerpt}</p>
      <div>
        <h2>
          <a href={`/notes/${id}`}>{title}</a>
        </h2>
      </div>
    </div>
  );
};

export default RecentNotes;
