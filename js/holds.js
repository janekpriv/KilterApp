import { TENSOR_W, TENSOR_H } from './config.js';

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
  const holds = [];
  let id = 0;
  const colSpacing = 7;
  const rowSpacing = 7;

  for (let row = 0; row * rowSpacing < TENSOR_H - 4; row++) {
    const y = 3 + row * rowSpacing;
    const offset = (row % 2) * 3.5;

    for (let col = 0; col * colSpacing + offset < TENSOR_W - 4; col++) {
      const x = 3 + col * colSpacing + offset;
      if (Math.random() < 0.18) continue;
      holds.push({ id: id++, x: Math.round(x), y: Math.round(y) });
    }
  }

  return holds;
}
