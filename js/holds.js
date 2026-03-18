import holdsData from './holds-data.js';


/**
 * Returns the list of all holds on the board.
 *
 * In production, replace this function body with data fetched
 * from your backend (GET /holds) or imported from a JSON file
 * generated from your parsed Kilter database.
 *
 * Each hold: { id: number, x: number, y: number }
 * Coordinates are in tensor-space: x ∈ [0, TENSOR_W-1], y ∈ [0, TENSOR_H-1]
 *
 * @returns {{ id: number, x: number, y: number }[]}
 */
export function generateHolds() {
  return holdsData;
}
