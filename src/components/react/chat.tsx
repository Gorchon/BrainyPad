import React, { useState, useRef } from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { MessageSelect } from "../../server/db/types";
import { Loader, Trash2 } from "lucide-react";
import type { FileReference } from "../../pages/api/assistant/chat/[id]";

type ChatProps =
  | { id: string; type: "file" | "note"; showRefs?: boolean }
  | { id?: undefined; type?: undefined; showRefs?: boolean };

const Chat: React.FC<ChatProps> = (props) => {
  return (
    <ReactQueryProvider>
      <InnerChat {...props} />
    </ReactQueryProvider>
  );
};

const InnerChat: React.FC<ChatProps> = ({ id, type, showRefs = false }) => {
  const messagesRes = useQuery(
    ["messages", type, id], // queryKey
    async () => {
      // queryFn
      const endpoint = id
        ? `/api/assistant/chat/${id}?type=${type}`
        : `/api/assistant/chat/all`;

      const response = await fetch(endpoint);
      const data = await response.json(); // Log the server response

      return data as {
        messages: MessageSelect[];
        referencedFiles: { id: string }[];
      };
    },
    {
      // options
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess: () => {},
    }
  );

  const sendMessageMutation = useMutation({
    mutationKey: [type, id, "send-mutation"],
    mutationFn: async (message: string) => {
      const endpoint = id
        ? `/api/assistant/chat/${id}?type=${type}&message=${message}`
        : `/api/assistant/chat/all?type=${type}&message=${message}`;

      const response = await fetch(endpoint);
      const data = (await response.json()) as Promise<{
        messages: MessageSelect[];
        referencedFiles: FileReference[];
      }>;

      return data;
    },
    onMutate: () => scrollToBottom(),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", type, id] }),
    onSuccess: () => {
      console.log(sendMessageMutation.data?.referencedFiles);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationKey: [id, "delete-conversation-mutation"],
    mutationFn: async (id: string) => {
      const endpoint = `/api/conversations/delete`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
    },
    onSuccess: () => {
      messagesRes.refetch();
    },
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function handleSend() {
    sendMessageMutation.mutate(input);
    setInput("");
  }

  return (
    <div className="flex flex-grow justify-evenly space-x-3">
      <div
        className="flex flex-col h-screen bg-[#e3e8ed] w-full rounded-lg shadow relative dark:bg-chat"
        style={{ height: "85vh" }}
      >
        <div
          className="flex-grow overflow-auto p-4"
          style={{ maxHeight: "calc(85vh - 75px)" }}
        >
          {messagesRes.isLoading || !messagesRes.data ? (
            <>Loading...</>
          ) : (
            <>
              {messagesRes.data.messages.map((message) => (
                <div
                  key={message.id}
                  className={`dark:bg-message dark:text-white my-2 mx-4 p-2 rounded-lg shadow max-w-lg ${
                    !message.wasFromAi
                      ? "ml-auto bg-blue-100"
                      : "mr-auto bg-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {sendMessageMutation.isLoading && (
                <div className="my-2 mx-4 p-2 rounded-lg shadow max-w-lg ml-auto bg-blue-100 dark:bg-message dark:text-white">
                  {sendMessageMutation.variables}
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center p-2 bg-gray-100 absolute bottom-0 w-full dark:bg-borders">
          <input
            className="flex-grow p-2 border-2 border-r-0 border-gray-300 rounded-l-lg focus:outline-none dark:bg-card dark:text-white dark:border-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write your message"
          />
          <button
            className="bg-gray-600 hover:bg-blue-700 text-white px-7 py-2 rounded-r-lg focus:outline-none border-2 border-gray-300 dark dark:bg-sidebar dark:border-gray-500 dark:hover:bg-blue-500 dark:text-white"
            onClick={handleSend}
          >
            Send
          </button>
          {deleteConversationMutation.isLoading ? (
            <Loader size={30} className="stroke-2 motion-safe:animate-spin" />
          ) : (
            <Trash2
              onClick={() =>
                deleteConversationMutation.mutate(
                  messagesRes.data?.messages[0].conversationId ?? ""
                )
              }
              size={30}
              className="cursor-pointer stroke-2"
            />
          )}
        </div>
      </div>
      {showRefs && (
        <div className="bg-[#e3e8ed] dark:bg-card flex flex-col justify-start items-start w-full h-full p-4 rounded-lg shadow-lg mr-5">
          <h2 className="font-bold text-lg dark:text-white mb-3">
            Sources Referenced
          </h2>
          <ul className="pl-4 dark:text-white mb-2">
            {sendMessageMutation.data?.referencedFiles.map((file) => (
              <li className="list-disc text-lg">{`${file.title} (${file.refCount})`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Chat;
