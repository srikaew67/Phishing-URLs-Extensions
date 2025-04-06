import React, { useEffect, useState } from "react";
import { Link2, OctagonAlert } from "lucide-react";
import '../App.css'

const ScanPage = () => {
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url;
        console.log("Current Tab URL: ", url);  // Check if URL is being set
        setCurrentUrl(url);
        sendUrl(url); // Automatically send the URL after setting the state
      }
    });
  }, []);

  const sendUrl = async (url) => {
    console.log("Sending URL to backend:", url);
    try {
      const response = await fetch("http://127.0.0.1:8000/scan-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Response from backend:", result);
      } else {
        console.error("Error sending URL to backend", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  
  
  
  return (
    <div>
      <div className="text-sm rounded-2xl bg-natural-100 px-2 py-2 text-black shadow-lg flex justify-between">
        <p className="flex">This URL: <span className="url-scroll">{currentUrl}</span></p>
        <span className="text-blue-500">
          <Link2 strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-10">
        <p className="text-left text-base">Numbers of URLs</p>
        <div className="justify-between mt-2 flex">
          <div className="rounded-md border-1 text-center w-[130px] h-[120px] flex flex-col items-center justify-center">
            <p className="flex justify-center items-center">
              <span className="text-sm pr-1">Phishing URLs</span>
              <span className="">
                <OctagonAlert strokeWidth={1.75} size={14} />
              </span>
            </p>
            <p className="text-4xl">200</p>
          </div>
          <div className="rounded-md border-1 text-center w-[130px] h-[120px] flex flex-col items-center justify-center">
            <p className="flex justify-center items-center">
              <span className="text-sm pr-1">Phishing URLs</span>
              <span className="">
                <OctagonAlert strokeWidth={1.75} size={14} />
              </span>
            </p>
            <p className="text-4xl">200</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
