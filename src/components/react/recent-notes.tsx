import React from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { FileSelect } from "../../server/db/types";
import type { NewNoteBody } from "../../pages/api/notes/new";

interface RecentNotesProps {
  children?: React.ReactNode;
}

const RecentNotes: React.FC<RecentNotesProps> = () => {
  return (
    <ReactQueryProvider>
      <InnerRecentNotes />
      <CreateNoteButton />
    </ReactQueryProvider>
  );
};

const InnerRecentNotes = () => {
  const { data, isLoading } = useQuery({
    queryFn: () =>
      fetch("/api/notes").then((res) => res.json() as Promise<FileSelect[]>),
    queryKey: "notes",
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
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
    <button disabled={isLoading} onClick={() => mutate()}>
      {isLoading ? "Creating" : "Create"} Note
    </button>
  );
};

export default RecentNotes;
