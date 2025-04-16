import React, { useEffect, useState } from "react";
import { PanelsTopLeft, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./assets/Logo.svg";
import ScanUrl from "./components/ScanUrl";
import ScanPage from "./components/ScanPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("page1");

  return (
    <div className="font-poppins w-2xs h-[480px] p-2">
      <div className="flex justify-center">
        <img src={logo} alt="" />
        <h1 className="ml-3 text-lg font-bold text-black py-5">
          Phishing URLs Detection
        </h1>
      </div>
      <div className="flex justify-center my-8">
        <button
          onClick={() => setCurrentPage("page1")}
          className={`group relative mr-3 h-10 overflow-hidden rounded-xl ${
            currentPage === "page1"
              ? "bg-blue-500 text-white"
              : "bg-neutral-100 text-black"
          } px-2 py-1 shadow-[0px_0px_10px_-3px_rgba(0,_0,_0,_0.8)]`}
        >
          <span
            className={`text-sm items-center relative z-10 transition-colors duration-500 flex ${
              currentPage === "page1" ? "text-white" : "group-hover:text-white"
            }`}
          >
            Scan this page
            <span
              className={`${
                currentPage === "page1"
                  ? "text-white"
                  : "text-blue-500 group-hover:text-white"
              } transition-colors duration-500 pl-1`}
            >
              <PanelsTopLeft strokeWidth={1.75} />
            </span>
          </span>
          <span className="absolute inset-0 overflow-hidden rounded-md">
            <span
              className={`absolute left-0 aspect-square w-full origin-center rounded-full bg-blue-500 transition-all duration-500 ${
                currentPage === "page1"
                  ? "translate-x-0 scale-150"
                  : "-translate-x-full group-hover:translate-x-0 group-hover:scale-150"
              }`}
            ></span>
          </span>
        </button>
        <button
          onClick={() => setCurrentPage("page2")}
          className={`group relative h-10 overflow-hidden rounded-xl ${
            currentPage === "page2"
              ? "bg-blue-500 text-white"
              : "bg-neutral-100 text-black"
          } px-2 py-1 shadow-[0px_0px_10px_-3px_rgba(0,_0,_0,_0.8)]`}
        >
          <span
            className={`text-sm items-center relative z-10 transition-colors duration-500 flex ${
              currentPage === "page2" ? "text-white" : "group-hover:text-white"
            }`}
          >
            Scan URL
            <span
              className={`${
                currentPage === "page2"
                  ? "text-white"
                  : "text-blue-500 group-hover:text-white"
              } transition-colors duration-500 pl-1`}
            >
              <Link2 strokeWidth={1.75} />
            </span>
          </span>
          <span className="absolute inset-0 overflow-hidden rounded-md">
            <span
              className={`absolute left-0 aspect-square w-full origin-center rounded-full bg-blue-500 transition-all duration-500 ${
                currentPage === "page2"
                  ? "translate-x-0 scale-150"
                  : "-translate-x-full group-hover:translate-x-0 group-hover:scale-150"
              }`}
            ></span>
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
        >
          {currentPage === "page1" ? <ScanPage /> : <ScanUrl />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
