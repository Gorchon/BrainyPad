import { User, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <>
      <div
        className="w-80 bg-gray-200 shadow-md overflow-auto z-10"
        style={{ height: "100vh" }}
      >
        <div className="p-5 font-bold text-5xl text gray-">BrainyPad</div>
        <ul className="space-y-2 p-5">
          <li>
            <a
              href="/home"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-500"
            >
              <span>🏠</span>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a
              href="/search"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-500"
            >
              <span>🔍</span>
              <span>Search</span>
            </a>
          </li>
          <li>
            <a
              href="/chat"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-500"
            >
              <span>💬</span>
              <span>Chat</span>
            </a>
          </li>
          <li>
            <a
              href="/files"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-500"
            >
              <span>📁</span>
              <span>Files</span>
            </a>
          </li>
        </ul>
        <div className="px-5 py-2 border-t mt-auto">
          <div className="flex items-center space-x-3">
            <button className="z-10 ml-[2rem] flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 outline-1 outline-white hover:outline">
              <User className="h-6 w-6 stroke-dark" />
            </button>
            <span className="text-gray-800">User Name</span>
            <Settings className="h-6 w-6 stroke-dark" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
