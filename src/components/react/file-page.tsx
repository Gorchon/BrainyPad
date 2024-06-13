import React, { useState } from "react";
import FilePreview from "./file-preview";
import Chat from "./chat";

interface FilePageProps {
  children?: React.ReactNode;
  id: string;
}

const FilePage: React.FC<FilePageProps> = ({ id }) => {
  const [hidden, setHidden] = useState(false);

  return (
    <>
      <FilePreview hide={hidden} id={id} />
      <Chat
        onQuizEnd={() => setHidden(false)}
        onQuizStart={() => setHidden(true)}
        type="file"
        id={id}
      />
    </>
  );
};

export default FilePage;
