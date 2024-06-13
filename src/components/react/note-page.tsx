import React, { useState } from "react";
import NoteEditor from "./note-editor";
import Chat from "./chat";

interface NotePageProps {
  children?: React.ReactNode;
  id: string;
}

const NotePage: React.FC<NotePageProps> = ({ id }) => {
  const [hidden, setHidden] = useState(false);

  return (
    <>
      <NoteEditor hideContent={hidden} id={id} />
      <Chat
        onQuizStart={() => setHidden(true)}
        onQuizEnd={() => setHidden(false)}
        type="note"
        id={id}
      />
    </>
  );
};

export default NotePage;
