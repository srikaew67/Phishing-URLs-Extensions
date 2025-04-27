import React, { useEffect, useState } from "react";
import { Link2, OctagonAlert } from "lucide-react";
import "../App.css";

const ScanPage = () => {
  const [currentUrl, setCurrentUrl] = useState("");
  const [externalUrls, setExternalUrls] = useState([]);
  const [numberofPhishingUrls, setNumberofPhishingUrls] = useState(0);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [phishingUrlsList, setPhishingUrlsList] = useState([]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url;
        console.log("Current Tab URL: ", url);
        setCurrentUrl(url);

        const domainMatch = url.match(
          /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/
        );
        const domain = domainMatch ? domainMatch[1] : "";
        console.log("Current domain:", domain);

        extractPageUrls(tabs[0].id, domain);
      }
    });
  }, []);

  const extractPageUrls = (tabId, mainDomain) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        function: (domain) => {
          const anchorTags = document.getElementsByTagName("a");
          const allUrls = [];
          const externalUrls = [];

          for (let i = 0; i < anchorTags.length; i++) {
            const href = anchorTags[i].href;
            if (href && href.startsWith("http")) {
              allUrls.push(href);

              const urlDomainMatch = href.match(
                /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/
              );
              const urlDomain = urlDomainMatch ? urlDomainMatch[1] : "";

              if (urlDomain && urlDomain !== domain) {
                externalUrls.push(href);
              }
            }
          }
          return { allUrls, externalUrls };
        },
        args: [mainDomain],
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          const { allUrls, externalUrls } = results[0].result;
          console.log("All URLs:", allUrls);
          console.log("External URLs:", externalUrls);

          setExternalUrls(externalUrls);

          if (externalUrls.length > 0) {
            sendExtractedUrls(externalUrls);
          }
        }
      }
    );
  };

  const highlightPhishingLinks = (phishingUrls) => {
    setPhishingUrlsList(phishingUrls);
    if (!highlightEnabled) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (urls) => {
          const anchors = document.querySelectorAll("a");
          anchors.forEach((a) => {
            if (urls.includes(a.href)) {
              const wrapper = document.createElement("span");
              wrapper.style.display = "inline-block";
              wrapper.style.boxShadow = "0 0 0px 2px red";
              a.parentNode.insertBefore(wrapper, a);
              wrapper.appendChild(a);
            }
          });
        },
        args: [phishingUrls],
      });
    });
  };

  const toggleHighlight = () => {
    setHighlightEnabled((prev) => {
      const newValue = !prev;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (urls, enable) => {
            const anchors = document.querySelectorAll("a");
            anchors.forEach((a) => {
              if (urls.includes(a.href)) {
                const parent = a.parentNode;
                if (enable) {
                  const wrapper = document.createElement("span");
                  wrapper.style.display = "inline-block";
                  wrapper.style.boxShadow = "0 0 0px 2px red";
                  parent.insertBefore(wrapper, a);
                  wrapper.appendChild(a);
                } else if (parent.tagName === "SPAN" && parent.style.boxShadow.includes("red")) {
                  parent.replaceWith(...parent.childNodes);
                }
              }
            });
          },
          args: [phishingUrlsList, newValue],
        });
      });

      return newValue;
    });
  };

  const sendExtractedUrls = async (urls) => {
    console.log("Sending external URLs to backend:", urls);
    try {
      const response = await fetch("http://127.0.0.1:8000/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: urls }),
      });

      if (response.ok) {
        const result = await response.json();
        setNumberofPhishingUrls(result.count);

        const phishingUrls = result.results
          .filter((r) => r.prediction === "Phishing")
          .map((r) => r.url);
        highlightPhishingLinks(phishingUrls);
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
      <div className="text-sm rounded-2xl bg-natural-100 px-2 py-2 text-black shadow-lg flex justify-between">
        <p className="flex">
          This URL: <span className="url-scroll">{currentUrl}</span>
        </p>
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
              <span>
                <OctagonAlert strokeWidth={1.75} size={14} />
              </span>
            </p>
            <p className="text-4xl">{numberofPhishingUrls}</p>
          </div>
          <div className="rounded-md border-1 text-center w-[130px] h-[120px] flex flex-col items-center justify-center">
            <p className="flex justify-center items-center">
              <span className="text-sm pr-1">Total URLs</span>
              <span>
                <Link2 strokeWidth={1.75} size={14} />
              </span>
            </p>
            <p className="text-4xl">{externalUrls.length}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
          onClick={toggleHighlight}
        >
          {highlightEnabled ? "Disable Highlight" : "Enable Highlight"}
        </button>
      </div>
    </div>
  );
};

export default ScanPage;
