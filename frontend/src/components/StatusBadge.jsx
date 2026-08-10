import React from "react";
import { OctagonAlert, ShieldCheck } from "lucide-react";

/**
 * Displays a Safe or Phishing result badge.
 * @param {"Phishing"|"Legitimate"} prediction
 * @param {number} confidence - 0 to 1
 */
const StatusBadge = ({ prediction, confidence }) => {
  const isPhishing = prediction === "Phishing";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-xl px-4 py-2.5 text-sm transition-all border ${
        isPhishing
          ? "bg-red-50 text-red-600 border-red-200"
          : "bg-green-50 text-green-600 border-green-200"
      }`}
    >
      <div className="flex items-center justify-center gap-2 text-base font-semibold">
        {isPhishing ? (
          <>
            <OctagonAlert size={20} strokeWidth={2} />
            <span>Phishing Detected</span>
          </>
        ) : (
          <>
            <ShieldCheck size={20} strokeWidth={2} />
            <span>URL is Safe</span>
          </>
        )}
      </div>
      {confidence !== undefined && (
        <p className="text-xs mt-1 opacity-75 text-center">
          Confidence: {(confidence * 100).toFixed(1)}%
        </p>
      )}
    </div>
  );
};

export default StatusBadge;
