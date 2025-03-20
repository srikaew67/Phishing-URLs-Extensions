// src/App.jsx
import React from "react";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // const [currentUrl, setCurrentUrl] = useState("");

  // useEffect(() => {
  //   // Get current tab URL when popup opens
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     if (tabs[0]) {
  //       setCurrentUrl(tabs[0].url);
  //     }
  //   });
  // }, []);

  return (
    <div className="w-xs h-[500px] border-2 border-black p-[20px] ">
      <div className="flex justify-center">
        <h1 className="text-xl font-bold text-black">
          Phishing URLs Detection
        </h1>
      </div>
      <div className="flex justify-center mt-[20px]">
        <button className="m-[10px] p-[5px] border-2 border-black">Scan this page</button>
        <button className="m-[10px] p-[5px] border-2 border-black">Scan link</button>
      </div>
    </div>
  );
}

export default App;
