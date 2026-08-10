import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link2, OctagonAlert, AlertCircle, EyeOff, Eye } from "lucide-react";
import "../App.css";
import { usePhishingApi } from "../hooks/usePhishingApi";
import LoadingSpinner from "./LoadingSpinner";

// Compiled once — reused across all calls
const DOMAIN_REGEX = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/;

// Script injected into the page — defined outside component to avoid recreation
function extractExternalUrls(domain) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/;
  const seen = new Set();
  const result = [];
  for (const a of document.getElementsByTagName("a")) {
    const { href } = a;
    if (!href || !href.startsWith("http")) continue;
    const m = href.match(regex);
    const d = m?.[1];
    if (d && d !== domain && !seen.has(href)) {
      seen.add(href);
      result.push(href);
    }
  }
  return result;
}

function hidePhishingLinks(phishingUrls) {
  document.querySelectorAll("a").forEach((a) => {
    if (phishingUrls.includes(a.href)) {
      a.dataset.phishingHidden = "true";
      a.style.visibility = "hidden";
    }
  });
}

function showPhishingLinks() {
  document.querySelectorAll("[data-phishing-hidden]").forEach((a) => {
    a.style.visibility = "";
    delete a.dataset.phishingHidden;
  });
}

const ScanPage = () => {
  const [currentUrl, setCurrentUrl] = useState("");
  const [externalUrls, setExternalUrls] = useState([]);
  const [phishingUrls, setPhishingUrls] = useState([]);
  const [hiddenOnPage, setHiddenOnPage] = useState(false);
  const { loading, error, scanUrls } = usePhishingApi();

  const phishingUrlsRef = useRef(phishingUrls);
  useEffect(() => { phishingUrlsRef.current = phishingUrls; }, [phishingUrls]);

  const extractPageUrls = useCallback((tabId, mainDomain) => {
    chrome.scripting.executeScript(
      { target: { tabId }, func: extractExternalUrls, args: [mainDomain] },
      async (results) => {
        if (!results?.[0]?.result) return;
        const urls = results[0].result;
        setExternalUrls(urls);
        if (urls.length === 0) return;

        const data = await scanUrls(urls);
        if (!data) return;

        setPhishingUrls(
          data.results
            .filter((r) => r.prediction === "Phishing")
            .map((r) => r.url)
        );
      }
    );
  }, [scanUrls]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      const url = tabs[0].url;
      setCurrentUrl(url);
      const m = url.match(DOMAIN_REGEX);
      extractPageUrls(tabs[0].id, m?.[1] ?? "");
    });
  }, [extractPageUrls]);

  const togglePageVisibility = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      const { id: tabId } = tabs[0];
      setHiddenOnPage((prev) => {
        if (prev) {
          chrome.scripting.executeScript({ target: { tabId }, func: showPhishingLinks });
        } else {
          chrome.scripting.executeScript({
            target: { tabId },
            func: hidePhishingLinks,
            args: [phishingUrlsRef.current],
          });
        }
        return !prev;
      });
    });
  }, []);

  // ---- Render ----

  return (
    <div className="flex flex-col h-full">
      {/* Current URL bar */}
      <div className="text-sm rounded-2xl bg-neutral-100 px-3 py-2 text-black shadow-sm flex justify-between items-center">
        <p className="flex items-center gap-1 min-w-0">
          <span className="shrink-0 text-gray-500">URL:</span>
          <span className="url-scroll">{currentUrl}</span>
        </p>
        <span className="text-blue-500 shrink-0">
          <Link2 size={16} strokeWidth={1.75} />
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-3 py-2 text-xs leading-snug mt-3"
          role="alert"
        >
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6">
        <p className="text-left text-sm font-medium text-gray-600 mb-2">
          External Links Found
        </p>
        <div className="flex justify-between gap-3">
          {/* Phishing count */}
          <div className="flex-1 border border-red-200 bg-red-50 rounded-lg p-3 text-center min-h-[90px] flex flex-col items-center justify-center">
            <p className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              Phishing
              <OctagonAlert size={13} strokeWidth={1.75} />
            </p>
            {loading ? (
              <LoadingSpinner size="w-7 h-7" className="mx-auto mt-1" />
            ) : (
              <p className="text-4xl font-bold leading-none">{phishingUrls.length}</p>
            )}
          </div>

          {/* Total count */}
          <div className="flex-1 border border-gray-200 rounded-lg p-3 text-center min-h-[90px] flex flex-col items-center justify-center">
            <p className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              Total
              <Link2 size={13} strokeWidth={1.75} />
            </p>
            <p className="text-4xl font-bold leading-none">{externalUrls.length}</p>
          </div>
        </div>
      </div>

      {/* Hide / Show on page button */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={togglePageVisibility}
          disabled={phishingUrls.length === 0 || loading}
          className={`flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-sm text-white border-0 cursor-pointer
            transition-[background-color,opacity] duration-200
            disabled:opacity-45 disabled:cursor-not-allowed
            ${hiddenOnPage
              ? "bg-gray-500 shadow-[0_1px_6px_rgba(107,114,128,0.4)] hover:bg-gray-600"
              : "bg-blue-500 shadow-[0_1px_6px_rgba(59,130,246,0.4)] hover:bg-blue-600"
            }`}
        >
          {hiddenOnPage ? (
            <>
              <Eye size={14} />
              แสดงใน Browser
            </>
          ) : (
            <>
              <EyeOff size={14} />
              ซ่อนใน Browser
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ScanPage;
