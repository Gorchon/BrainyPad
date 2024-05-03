import React, { useState } from "react";

interface Message {
  id: number;
  text: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    const newMessage = { id: messages.length, text: input };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-100">
      <div className="overflow-y-auto mb-4 flex-grow">
        {messages.map((message) => (
          <div key={message.id} className="bg-white p-2 rounded-lg shadow mb-2">
            {message.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-grow p-2 border rounded-l-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r-lg"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
