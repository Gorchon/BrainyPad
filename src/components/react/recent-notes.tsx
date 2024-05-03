import React from "react";
import ReactQueryProvider from "./react-query-provider";
import { useQuery } from "react-query";
import type { File } from "../../server/db/types";

interface RecentNotesProps {
  children?: React.ReactNode;
}

const RecentNotes: React.FC<RecentNotesProps> = () => {
  return (
    <ReactQueryProvider>
      <InnerRecentNotes />
    </ReactQueryProvider>
  );
};

const InnerRecentNotes = () => {
  const { data, isLoading } = useQuery({
    queryFn: () =>
      fetch("/api/notes").then((res) => res.json() as Promise<File[]>),
    queryKey: "notes",
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
};

export default RecentNotes;
