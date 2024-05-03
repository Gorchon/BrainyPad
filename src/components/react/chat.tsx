import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      // Checks if the input is not just whitespace
      const newMessage = { id: messages.length, text: input, sender: "user" };
      setMessages([...messages, newMessage]);
      setInput("");
    }
  };

  return (
    // <div className="flex flex-col h-screen bg-gray-100 rounded-lg shadow relative" >
    <div
      className="flex flex-col h-screen bg-[#e3e8ed] rounded-lg shadow relative"
      style={{ height: "85vh" }}
    >
      <div
        className="flex-grow overflow-auto p-4"
        style={{ maxHeight: "calc(85vh - 75px)" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`bg-white my-2 mx-4 p-2 rounded-lg shadow max-w-lg ${
              message.sender === "user"
                ? "ml-auto bg-blue-100"
                : "mr-auto bg-gray-200"
            }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center p-2 bg-gray-100 absolute bottom-0 w-full">
        <input
          className="flex-grow p-2 border-2 border-r-0 border-gray-300 rounded-l-lg focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe tu mensaje"
        />
        <button
          className="bg-gray-600 hover:bg-blue-700 text-white px-7 py-2 rounded-r-lg focus:outline-none border-2 border-gray-300"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
