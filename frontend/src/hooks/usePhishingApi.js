import { useState, useCallback } from "react";
import { ENDPOINTS } from "../config/api";

/**
 * Custom hook for calling the phishing detection API.
 * Manages loading, error, and result state in one place.
 */
export function usePhishingApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  /**
   * Helper function for sending array of URLs to POST /scan
   */
  const performScan = useCallback(async (urls) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(ENDPOINTS.scan, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? data.message ?? `Server error ${response.status}`);
      }
      return data;
    } catch (err) {
      const msg =
        err.name === "TypeError"
          ? "Cannot connect to backend. Make sure the server is running."
          : err.message;
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Scan a single URL (sends as a 1-item list to API).
   * @param {string} url
   * @returns {Promise<object|null>}
   */
  const scanUrl = useCallback(async (url) => {
    const data = await performScan([url]);
    const singleResult = data?.results?.[0] ?? null;
    setResult(singleResult);
    return singleResult;
  }, [performScan]);

  /**
   * Scan multiple URLs at once.
   * @param {string[]} urls
   * @returns {Promise<object|null>}
   */
  const scanUrls = useCallback(async (urls) => {
    const data = await performScan(urls);
    setResult(data);
    return data;
  }, [performScan]);

  return { loading, error, result, reset, scanUrl, scanUrls };
}
