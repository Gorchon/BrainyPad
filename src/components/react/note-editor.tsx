import React from "react";
import MKEditor from "./MKEditor";
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
  const { data, isLoading } = useQuery({
    queryFn: () =>
      fetch(`/api/notes/${id}`).then(
        (res) => res.json() as Promise<NoteSelect>
      ),
  });

  if (isLoading || !data) return <div>Loading...</div>;

  return <MKEditor initialMarkdown={data.content ?? ""} />;
};

export default NoteEditor;
