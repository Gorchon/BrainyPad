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
    return <div className="text-white">Loading...</div>;
  }

  return (
    <h2>
      <mkeditor.data.MKEditor initialMarkdown={note.data.content ?? ""} />
    </h2>
  );
};

export default NoteEditor;
