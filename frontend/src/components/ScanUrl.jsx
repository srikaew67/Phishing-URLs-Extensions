import React, { useState, useCallback } from "react";
import { Link2, Play, AlertCircle } from "lucide-react";
import { usePhishingApi } from "../hooks/usePhishingApi";
import LoadingSpinner from "./LoadingSpinner";
import StatusBadge from "./StatusBadge";

const ScanUrl = () => {
  const [url, setUrl] = useState("");
  const { loading, error, result, scanUrl, reset } = usePhishingApi();

  const handleScan = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    await scanUrl(trimmed);
  }, [url, scanUrl]);

  const handleChange = useCallback((e) => {
    setUrl(e.target.value);
    if (result || error) reset();
  }, [result, error, reset]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") handleScan();
  }, [handleScan]);

  return (
    <div className="flex flex-col h-full">
      {/* URL input */}
      <div className="text-sm rounded-xl bg-neutral-100 px-3 py-2 text-black shadow-sm flex justify-between items-center gap-2">
        <p className="flex items-center gap-1 flex-1 min-w-0">
          <span className="shrink-0 text-gray-500">URL:</span>
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            aria-label="Enter URL to scan"
            className="flex-1 min-w-0 bg-transparent focus:outline-none placeholder:text-gray-400"
          />
        </p>
        <span className="text-blue-500 shrink-0">
          <Link2 size={16} strokeWidth={1.75} />
        </span>
      </div>

      {/* Scan button */}
      <div className="mt-8 flex justify-center">
        <button
          id="scan-btn"
          onClick={handleScan}
          disabled={loading || !url.trim()}
          type="button"
          aria-label="Scan URL for phishing"
          className="flex items-center gap-1.5 h-10 rounded-xl px-5 text-sm bg-blue-500 text-white border-0
            shadow-[0_1px_6px_rgba(59,130,246,0.4)] transition-[background-color,opacity] duration-200
            hover:bg-blue-600 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <LoadingSpinner size="w-4 h-4" />
              <span>Scanning…</span>
            </>
          ) : (
            <>
              <Play fill="#fff" strokeWidth={0} size={14} />
              <span>Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="flex items-start gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-3 py-2 text-xs leading-snug mt-5"
          role="alert"
        >
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && !error && (
        <div className="mt-5">
          <StatusBadge
            prediction={result.prediction}
            confidence={result.confidence}
          />
        </div>
      )}
    </div>
  );
};

export default ScanUrl;
