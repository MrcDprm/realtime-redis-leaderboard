/**
 * Centralized API / Socket base URLs for Electron readiness.
 * Empty string = same-origin (nginx proxy in Docker, Vite proxy in dev).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? '';
