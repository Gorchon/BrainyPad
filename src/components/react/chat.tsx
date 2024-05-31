import React, { useState, useRef } from "react";
import ReactQueryProvider, { queryClient } from "./react-query-provider";
import { useMutation, useQuery } from "react-query";
import type { MessageSelect } from "../../server/db/types";

type ChatProps =
  | { id: string; type: "file" | "note" }
  | { id?: undefined; type?: undefined };

const Chat: React.FC<ChatProps> = (props) => {
  return (
    <ReactQueryProvider>
      <InnerChat {...props} />
    </ReactQueryProvider>
  );
};

const InnerChat: React.FC<ChatProps> = ({ id, type }) => {
  const messagesRes = useQuery({
    queryKey: ["messages", type, id],
    queryFn: async () => {
      const endpoint = id
        ? `/api/assistant/chat/${id}?type=${type}`
        : `/api/assistant/chat`;

      const response = await fetch(endpoint);
      const data = (await response.json()) as Promise<{
        messages: MessageSelect[];
      }>;

      return data;
    },
  });

  const sendMessageMutation = useMutation({
    mutationKey: [type, id, "send-mutation"],
    mutationFn: async (message: string) => {
      const endpoint = id
        ? `/api/assistant/chat/${id}?type=${type}&message=${message}`
        : `/api/assistant/chat?type=${type}&message=${message}`;

      const response = await fetch(endpoint);
      const data = (await response.json()) as Promise<{
        messages: MessageSelect[];
      }>;

      return data;
    },
    onMutate: () => scrollToBottom(),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", type, id] }),
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
    <div
      className="flex flex-col h-screen bg-[#e3e8ed] rounded-lg shadow relative w-1/2"
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
                className={`my-2 mx-4 p-2 rounded-lg shadow max-w-lg ${
                  !message.wasFromAi
                    ? "ml-auto bg-blue-100"
                    : "mr-auto bg-gray-200"
                }`}
              >
                {message.content}
              </div>
            ))}
            {sendMessageMutation.isLoading && (
              <div className="my-2 mx-4 p-2 rounded-lg shadow max-w-lg ml-auto bg-blue-100">
                {sendMessageMutation.variables}
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center p-2 bg-gray-100 absolute bottom-0 w-full">
        <input
          className="flex-grow p-2 border-2 border-r-0 border-gray-300 rounded-l-lg focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Write your message"
        />
        <button
          className="bg-gray-600 hover:bg-blue-700 text-white px-7 py-2 rounded-r-lg focus:outline-none border-2 border-gray-300"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
