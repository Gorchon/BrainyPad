import {
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
  const [isDarkmode, setIsDarkmode] = useState(()=>{
    if (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem("isDarkmode") === null) {
      return true;
    }
    if (localStorage.getItem("isDarkmode") === "true") {
      return true;
    }
    return false;
  });
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    setIsDarkmode(localStorage.getItem("isDarkmode") === "true");
  }, []);

  useEffect(() => {
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.classList.remove(isDarkmode ? "light" : "dark");
      htmlElement.classList.add(isDarkmode ? "dark" : "light");
    }
    localStorage.setItem("isDarkmode", String(isDarkmode));
  }, [isDarkmode]);

  return (
    <ClerkContext>
      <div
        className="flex flex-col w-80 sticky top-0 bg-gray-200 dark:bg-sidebar shadow-md overflow-hidden z-10"
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
              <Home size={24} className="dark:stroke-white" />
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
              <MessageCircleMore size={24} className="dark:stroke-white" />
              <span className="dark:text-white">Chat</span>
            </a>
          </li>
          <li>
            <a
              href="/files"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-500"
            >
              <Folders size={24} className="dark:stroke-white" />
              <span className="dark:text-white">Files</span>
            </a>
          </li>
        </ul>

        <button
          className={`ml-8 w-16 h-8 rounded-full bg-white flex items-center transition duration-300 focus:outline-none shadow `}
          onClick={() => setIsDarkmode(!isDarkmode)}
        >
          <div
            id="switch-toggle"
            className={`w-8 h-8 relative rounded-full transition duration-500 transform p-1 text-white ${
              isDarkmode
                ? "bg-gray-700 translate-x-full"
                : "bg-borders -translate-x-2"
            }`}
          >
            {isDarkmode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </div>
        </button>

        <br />

        <div className="px-5 py-8  w-full text-xl ">
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
