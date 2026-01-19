/**
 * Fetch with Timeout Utility
 * Adds AbortController support and timeout handling to fetch calls
 * Prevents indefinite hangs on Windows
 */

/**
 * Fetch with automatic timeout and abort controller
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options (method, headers, body, etc)
 * @param {number} timeout - Timeout in milliseconds (default: 30000 = 30s)
 * @returns {Promise<Response>} - Fetch response
 * @throws {Error} - Timeout error or network error
 */
export async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Specific error handling
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms - please check your internet connection`);
    }

    // Network error
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error - please check if the server is running');
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetch with retry logic and exponential backoff
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3, timeout = 30000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, timeout);
    } catch (error) {
      lastError = error;

      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: wait 1s, 2s, 4s between retries
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`[fetchWithRetry] Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe JSON parser that validates response before parsing
 * @param {Response} response - Fetch response object
 * @returns {Promise<object>} - Parsed JSON
 * @throws {Error} - If response is not JSON or parsing fails
 */
export async function safeJsonParse(response) {
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON response but got: ${contentType || 'unknown'}. Body: ${text.substring(0, 100)}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
}
