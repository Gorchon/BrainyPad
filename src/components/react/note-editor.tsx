import React from "react";
import { useQuery } from "react-query";
import ReactQueryProvider from "./react-query-provider";
import type { NoteSelect } from "../../server/db/types";

interface NoteEditorProps {
  id: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ id }) => {
  return (
    <ReactQueryProvider>
      <InnerNoteEditor id={id} />
    </ReactQueryProvider>
  );
};

const InnerNoteEditor = ({ id }: NoteEditorProps) => {
  const note = useQuery({
    queryKey: ["note", id],
    queryFn: () =>
      fetch(`/api/notes/${id}`).then(
        (res) => res.json() as Promise<NoteSelect>
      ),
  });

  const mkeditor = useQuery({
    queryKey: ["mkeditor"],
    queryFn: async () => {
      const MKEditor = (await import("./MKEditor")).default;
      return { MKEditor };
    },
  });

  if (note.isLoading || !note.data || !mkeditor.data || mkeditor.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full dark:bg-[#232329] bg-[#e5e7eb] bg-opacity-25 dark:bg-opacity-50">
      <mkeditor.data.MKEditor initialMarkdown={note.data.content ?? ""} />
    </div>
  );
};

export default NoteEditor;
