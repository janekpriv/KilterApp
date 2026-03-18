import { API_URL } from './config.js';

/**
 * Sends the route payload to the backend and returns the prediction.
 *
 * @param {{ holds: Array<{x: number, y: number, channel: number}> }} payload
 * @returns {Promise<{ grade: string, font?: string }>}
 * @throws {Error} on network failure or non-2xx response
 */
export async function predictDifficulty(payload) {
  const response = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Server error ${response.status}: ${text}`);
  }

  return response.json();
}
