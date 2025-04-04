import React, { useState } from "react";
import "./App.css";
import { PanelsTopLeft, Link2 ,OctagonAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./assets/Logo.svg";

function App() {
  const [activePage, setActivePage] = useState("page1");

  const handleScanPage = () => {
    setActivePage("page1");
  };

  const handleScanURL = () => {
    setActivePage("page2");
  };

  return (
    <div className="font-poppins w-2xs h-[480px] p-2">
      <div className="flex justify-center">
        <img src={logo} alt="" />
        <h1 className="ml-3 text-lg font-bold text-black py-5">
          Phishing URLs Detection
        </h1>
      </div>
      <div className="flex justify-center mt-3">
        <button
          onClick={handleScanPage}
          className="group relative mr-3 h-10 overflow-hidden rounded-2xl bg-neutral-100 px-2 py-1 text-black shadow-lg"
        >
          <span className="text-sm group-hover:text-white relative z-10 transition-colors duration-500 flex">
            Scan this page
            <span className="text-blue-500 group-hover:text-white transition-colors duration-500 pl-1">
              <PanelsTopLeft strokeWidth={1.75} />
            </span>
          </span>
          <span className="absolute inset-0 overflow-hidden rounded-md">
            <span className="absolute left-0 aspect-square w-full origin-center -translate-x-full rounded-full bg-blue-500 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-150"></span>
          </span>
        </button>
        <button
          onClick={handleScanURL}
          className="group relative h-10 overflow-hidden rounded-2xl bg-neutral-100 px-2 py-1 text-black shadow-lg"
        >
          <span className="text-sm group-hover:text-white relative z-10 transition-colors duration-500 flex">
            Scan URL
            <span className="text-blue-500 group-hover:text-white transition-colors duration-500 pl-1">
              <Link2 strokeWidth={1.75} />
            </span>
          </span>
          <span className="absolute inset-0 overflow-hidden rounded-md">
            <span className="absolute left-0 aspect-square w-full origin-center -translate-x-full rounded-full bg-blue-500 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-150"></span>
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activePage === "page1" && (
          <motion.div
            key="page1"
            initial={{ opacity: 0, x: -50 }} // page1 comes from the left
            animate={{ opacity: 1, x: 0 }} // page1 animates to its original position
            exit={{ opacity: 0, x: 50 }} // page1 exits to the right
            transition={{ duration: 0.5 }}
            className="text-center text-base mt-5 text-lg"
          >
            <div>
              <div className="text-sm rounded-2xl bg-natural-100 px-2 py-2 text-black shadow-lg flex justify-between">
                <p>This URL : Test</p>
                <span className="text-blue-500">
                  {" "}
                  <Link2 strokeWidth={1.75} />
                </span>
              </div>
              <div className="mt-10">
                <p className="text-left">Numbers of URLs</p>
                <div>
                  <div>
                    <p>Phishing URLs <span className="bg-yellow-400 text-black"><OctagonAlert /></span></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activePage === "page2" && (
          <motion.div
            key="page2"
            initial={{ opacity: 0, x: -50 }} // page2 comes from the right
            animate={{ opacity: 1, x: 0 }} // page2 animates to its original position
            exit={{ opacity: 0, x: 50 }} // page2 exits to the left
            transition={{ duration: 0.5 }}
            className="text-center mt-5 font-bold text-lg"
          >
            Insert
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
