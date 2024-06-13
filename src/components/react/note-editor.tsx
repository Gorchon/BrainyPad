import React, { useEffect, useRef } from "react";
import { useMutation, useQuery } from "react-query";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import type { NoteSelect } from "../../server/db/types";
import type { ContentBody } from "../../pages/api/notes/update";
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
  const [content, setContent] = React.useState("");
  let timeoutId = useRef<number | null>(null);

  const note = useQuery(
    ["note", id],
    () =>
      fetch(`/api/notes/${id}`).then(
        (res) => res.json() as Promise<NoteSelect>
      ),
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const updateMutation = useMutation({
    mutationFn: () => {
      return fetch("/api/notes/update", {
        method: "POST",
        body: JSON.stringify({ id, content } as ContentBody),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("notes");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      return fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  //Set the note content when the note is loaded
  useEffect(() => {
    if (content !== note.data?.content) {
      console.log("Setting note content");
      setContent(note.data?.content ?? "");
    }
  }, [note.isSuccess]);

  /**
   * Creates a timer to update the note content x seconds after every change
   * If any changes are made during those x seconds, the timer is reset
   */
  useEffect(() => {
    const timeInterval = 10 * 1000;
    // Call the mutation when content changes
    if (content && content != note.data?.content) {
      // Clear the previous timer
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }

      // Set up a new timer
      timeoutId.current = window.setTimeout(() => {
        console.log("Updating note content");
        updateMutation.mutate();
      }, timeInterval);
    }
  }, [content]);

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
    <div className="h-full w-[40vw] dark:bg-[#232329] bg-[#e5e7eb] bg-opacity-25 dark:bg-opacity-50">
      <mkeditor.data.MKEditor
        content={content}
        setContent={setContent}
        loading={updateMutation.isLoading}
        onSave={async () => updateMutation.mutate()}
        delLoading={deleteMutation.isLoading}
        onDelete={async () => deleteMutation.mutate()}
      />
    </div>
  );
};

export default NoteEditor;
