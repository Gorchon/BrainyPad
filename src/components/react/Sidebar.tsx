import {
  User,
  Settings,
  Home,
  Search,
  MessageCircleMore,
  Folders,
} from "lucide-react";

import { UserButton } from "@clerk/clerk-react";
import ClerkContext from "./clerk-provider";
import { useEffect, useState } from "react";

const userButtonDimensions = { height: 60, width: 60 };

const Sidebar = () => {
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    }
  }, []);

  return (
    <ClerkContext>
      <div
        className="flex flex-col w-80 bg-gray-200 dark:bg-sidebar shadow-md overflow-hidden z-10"
        style={{ height: "100vh" }}
      >
        <div className="p-5 font-bold text-5xl dark:text-white">BrainyPad</div>
        <ul className="flex-grow overflow-auto space-y-8 p-8 text-xl">
          {" "}
          <li>
            <a
              href="/"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500" // Aumentado espacio
            >
              <Home size={24} className="dark:stroke-white"/>
              <span className="dark:text-white">Home</span>
            </a>
          </li>
          <li>
            <a
              href="/search"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500"
            >
              <Search size={24} className="dark:stroke-white" />
              <span className="dark:text-white">Search</span>
            </a>
          </li>
          <li>
            <a
              href="/chat"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500"
            >
              <MessageCircleMore size={24} className="dark:stroke-white"/>
              <span className="dark:text-white">Chat</span>
            </a>
          </li>
          <li>
            <a
              href="/files"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500"
            >
              <Folders size={24} className="dark:stroke-white"/>
              <span className="dark:text-white">Files</span>
            </a>
          </li>
        </ul>
        <div className="px-5 py-8 border-t w-full text-xl ">
          {" "}
          <div className="flex items-center space-x-8 px-4">
            {!firstLoad && (
              <UserButton
                appearance={{
                  elements: {
                    rootBox: userButtonDimensions,
                    userButtonTrigger: userButtonDimensions,
                    userButtonBox: userButtonDimensions,
                    avatarBox: userButtonDimensions,
                  },
                }}
              />
            )}
            <span className="text-gray-800 dark:text-white">User Name</span>
          </div>
        </div>
      </div>
    </ClerkContext>
  );
};

export default Sidebar;
