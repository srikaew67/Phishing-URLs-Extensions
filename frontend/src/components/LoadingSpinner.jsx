import React from "react";

/**
 * Reusable animated loading spinner — pure Tailwind.
 * @param {string} size  - Tailwind size classes e.g. "w-6 h-6" (default)
 * @param {string} className - Extra class names
 */
const LoadingSpinner = ({ size = "w-6 h-6", className = "" }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`${size} ${className} animate-spin rounded-full border-2 border-gray-200 border-t-blue-500`}
  />
);

export default LoadingSpinner;
