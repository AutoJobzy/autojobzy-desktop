/**
 * Global Configuration for Electron App
 * Use 127.0.0.1 instead of localhost for Windows compatibility
 */

// Windows Electron मध्ये localhost DNS resolution fail होते
// 127.0.0.1 use करायचं - reliable आहे
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://api.autojobzy.com';
