import React, { useEffect, useState, useMemo } from "react";
import { PanelsTopLeft, Link2, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "./assets/Logo.svg";
import ScanUrl from "./components/ScanUrl";
import ScanPage from "./components/ScanPage";
import { ENDPOINTS } from "./config/api";

export default function App() {
  const [currentPage, setCurrentPage] = useState("page1");
  const [backendStatus, setBackendStatus] = useState("checking"); // "checking" | "online" | "offline"

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(ENDPOINTS.health, { signal: AbortSignal.timeout(3000) });
        setBackendStatus(res.ok ? "online" : "offline");
      } catch {
        setBackendStatus("offline");
      }
    };
    checkHealth();
  }, []);

  const tabs = useMemo(() => [
    { id: "page1", label: "Scan this page", Icon: PanelsTopLeft },
    { id: "page2", label: "Scan URL", Icon: Link2 },
  ], []);

  return (
    <div className="font-poppins w-xs p-3 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-8 w-8" />
          <h1 className="text-base font-bold text-black">
            Phishing URLs Detection
          </h1>
        </div>

        {/* Backend status indicator */}
        <div className="flex items-center gap-1" title={`Backend: ${backendStatus}`}>
          {backendStatus === "checking" && (
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
          )}
          {backendStatus === "online" && (
            <>
              <Wifi size={14} className="text-green-500" />
              <span className="text-xs text-green-600">Online</span>
            </>
          )}
          {backendStatus === "offline" && (
            <>
              <WifiOff size={14} className="text-red-500" />
              <span className="text-xs text-red-500">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-3 my-4">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setCurrentPage(id)}
            className={`group relative h-10 overflow-hidden rounded-xl px-3 py-1
              shadow-[0px_0px_10px_-3px_rgba(0,0,0,0.8)] transition-colors
              ${currentPage === id ? "bg-blue-500 text-white" : "bg-neutral-100 text-black"}`}
          >
            <span className={`text-sm items-center relative z-10 transition-colors duration-300 flex gap-1
              ${currentPage === id ? "text-white" : "group-hover:text-white"}`}>
              {label}
              <Icon
                strokeWidth={1.75}
                size={16}
                className={currentPage === id ? "text-white" : "text-blue-500 group-hover:text-white transition-colors duration-300"}
              />
            </span>
            <span className="absolute inset-0 overflow-hidden rounded-md">
              <span className={`absolute left-0 aspect-square w-full origin-center rounded-full
                bg-blue-500 transition-all duration-500
                ${currentPage === id
                  ? "translate-x-0 scale-150"
                  : "-translate-x-full group-hover:translate-x-0 group-hover:scale-150"
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      {/* Page Content — fixed height so both tabs are the same size */}
      <div className="h-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
            className="h-[250px]"
          >
            {currentPage === "page1" ? <ScanPage /> : <ScanUrl />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
