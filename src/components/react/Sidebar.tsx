import {
  User,
  Settings,
  Home,
  Search,
  MessageCircleMore,
  Folders,
} from "lucide-react";

const Sidebar = () => {
  return (
    <>
      <div
        className="flex flex-col w-80 bg-gray-200 shadow-md overflow-hidden z-10"
        style={{ height: "100vh" }}
      >
        <div className="p-5 font-bold text-5xl">BrainyPad</div>
        <ul className="flex-grow overflow-auto space-y-8 p-8 text-xl">
          {" "}
          <li>
            <a
              href="/home"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500" // Aumentado espacio
            >
              <Home size={24} />
              <span>Home</span>
            </a>
          </li>
          <li>
            <a
              href="/search"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500"
            >
              <Search size={24} />
              <span>Search</span>
            </a>
          </li>
          <li>
            <a
              href="/chat"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500"
            >
              <MessageCircleMore size={24} />
              <span>Chat</span>
            </a>
          </li>
          <li>
            <a
              href="/files"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500"
            >
              <Folders size={24} />
              <span>Files</span>
            </a>
          </li>
        </ul>
        <div className="px-5 py-2 border-t w-full text-xl">
          {" "}
          <div className="flex items-center justify-between">
            <button className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-300">
              {" "}
              <User size={24} className="stroke-dark" />{" "}
            </button>
            <span className="text-gray-800">User Name</span>
            <Settings size={24} className="stroke-dark" />{" "}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
