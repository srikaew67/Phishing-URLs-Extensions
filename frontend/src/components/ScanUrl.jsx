import React, { useState } from "react";
import { Link2, Play, OctagonAlert, ShieldCheck } from "lucide-react";

const ScanUrl = () => {
  const [url, setUrl] = useState("");
  const [predictResult, setpredictResult] = useState("");

  const setoutput = (data) => {
    if (data.prediction === "Phishing") {
      setpredictResult(
        <div className="flex justify-center items-center gap-2 mt-5 text-lg">
          <span>This URL is </span>
          <span className="text-red-600 flex items-center gap-1">
            Dangerous
            <OctagonAlert strokeWidth={1.75} />
          </span>
        </div>
      );
    } else {
      setpredictResult(
        <div className="flex justify-center items-center text-green-600 gap-2 mt-5 text-lg">
          <span>This URL is </span>
          <span className="text-green-600 flex items-center gap-1">
            Safe
            <ShieldCheck strokeWidth={1.75} />
          </span>
        </div>
      );
    }
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  const sendUrl = async () => {
    console.log("URL to scan:", url); // use state directly
    try {
      const response = await fetch("http://127.0.0.1:8000/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      if (response.ok) {
        const data = await response.json();
        setoutput(data.result);
      } else {
        console.error(
          "Error sending external URLs to backend",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Network error when sending external URLs:", error);
    }
  };

  return (
    <div>
      <div className="text-sm rounded-xl bg-natural-100 px-2 py-2 text-black shadow-[0px_0px_10px_-3px_rgba(0,_0,_0,_0.8)] flex justify-between">
        <p className="flex items-center">
          Insert URL:
          <input
            type="text"
            value={url}
            onChange={handleChange}
            className="w-4/6 focus:outline-none focus:border-transparent  border-gray-300"
          />
        </p>
        <span className="text-blue-500">
          <Link2 strokeWidth={1.75} />
        </span>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={sendUrl}
          className="flex justify-center items-center  h-10 rounded-xl px-4 py-2 shadow-[0px_0px_10px_-3px_rgba(0,_0,_0,_0.8)]"
          type="submit"
        >
          <span>
            <Play fill="#007AFF" strokeWidth={0} />
          </span>
          Scanning
        </button>
      </div>
      <div>{predictResult}</div>
    </div>
  );
};

export default ScanUrl;
