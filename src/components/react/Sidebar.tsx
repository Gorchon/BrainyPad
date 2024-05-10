import {
  User,
  Settings,
  Home,
  Search,
  MessageCircleMore,
  Folders,
  SunMedium,
  Moon,
} from "lucide-react";

import { UserButton } from "@clerk/clerk-react";
import ClerkContext from "./clerk-provider";
import React, { useEffect, useState } from "react";

const userButtonDimensions = { height: 60, width: 60 };

const Sidebar = () => {

  const [theme, setTheme] = useState(()=> {  
    if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";});

  //lol
useEffect(() => {
  if(theme === "dark") {
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.classList.remove("light");
      htmlElement.classList.add("dark");
    }
  } else {
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.classList.remove("dark");
      htmlElement.classList.add("light");
    }
  }
}, [theme]);

const handleChangeTheme = () => {
  setTheme((prevTheme) => ( prevTheme === "light" ? "dark" : "light"));
};
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

        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" className="sr-only peer" />
          <span className="ms-3"></span>
          <SunMedium size={30} className="dark:stroke-white"/>
          <span className="ms-3"></span>
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 outline outline-1 outline-gray-900" onClick={handleChangeTheme}></div>
          <span className="ms-3"></span>
          <Moon size={25} className="dark:stroke-white"/>
        </label>

        <br />

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
