import React from "react";
import ReactQueryProvider from "./react-query-provider";
import { useQuery } from "react-query";

interface FilePreviewProps {
  children?: React.ReactNode;
  id: string;
}

const FilePreview: React.FC<FilePreviewProps> = (props) => {
  return (
    <ReactQueryProvider>
      <InnerFilePreview {...props} />
    </ReactQueryProvider>
  );
};

const InnerFilePreview: React.FC<FilePreviewProps> = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryFn: () => fetch(`/api/files/${id}`).then((res) => res.json()),
  });

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div>
      <iframe src={data.media} className="w-full min-h-[80vh]" />
    </div>
  );
};

export default FilePreview;
