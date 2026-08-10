/**
 * Centralized API configuration.
 * Override the base URL via the VITE_API_URL environment variable.
 * Example: set VITE_API_URL=http://192.168.1.10:8000 in frontend/.env
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export const ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  scan:   `${API_BASE_URL}/scan`,
};
