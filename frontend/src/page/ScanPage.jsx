import React from "react";
import { PanelsTopLeft, Link2, OctagonAlert } from "lucide-react";

const ScanPage = () => {
  return (
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
            <p>
              Phishing URLs{" "}
              <span className="bg-yellow-400 text-black">
                <OctagonAlert />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
