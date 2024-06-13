import React from "react";
import ReactQueryProvider from "./react-query-provider";
import { useQuery } from "react-query";

interface FilePreviewProps {
  children?: React.ReactNode;
  id: string;
  hide?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = (props) => {
  return (
    <ReactQueryProvider>
      <InnerFilePreview {...props} />
    </ReactQueryProvider>
  );
};

const InnerFilePreview: React.FC<FilePreviewProps> = ({ id, hide }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["files", id],
    queryFn: () => fetch(`/api/files/${id}`).then((res) => res.json()),
  });

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <>
      <div className={`w-[40vw] ${hide ? "block" : "hidden"}`}>
        Content is being being hidden...
      </div>
      <div className={`w-[40vw] ${hide ? "hidden" : "block"}`}>
        <iframe src={data.media} className="w-full min-h-[80vh]" />
      </div>
    </>
  );
};

export default FilePreview;
