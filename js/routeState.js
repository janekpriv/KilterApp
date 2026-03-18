import { HoldType, HOLD_CHANNEL } from './config.js';
import { HOLD_OFFSET_X, HOLD_OFFSET_Y } from './config.js';
/**
 * Manages the current route state — which holds are active and of what type.
 * Emits a 'routechange' CustomEvent on window whenever the route is modified.
 */
export class RouteState {
  /** @type {Map<number, string>} holdId → HoldType */
  #holds = new Map();

  get(holdId) {
    return this.#holds.get(holdId) ?? null;
  }

  set(holdId, type) {
    this.#holds.set(holdId, type);
    this.#emit();
  }

  delete(holdId) {
    this.#holds.delete(holdId);
    this.#emit();
  }

  clear() {
    this.#holds.clear();
    this.#emit();
  }

  counts() {
    const result = { start: 0, foot: 0, hand: 0, top: 0 };
    for (const type of this.#holds.values()) result[type]++;
    return result;
  }

  isValid() {
    const { start, top } = this.counts();
    return start >= 1 && top >= 1;
  }

  /**
   * Serialises the route into the minimal payload expected by the backend.
   * Backend reconstructs the (4, 173, 185) tensor from this.
   *
   * @param {Array<{id: number, x: number, y: number}>} allHolds
   * @returns {{ holds: Array<{x: number, y: number, channel: number}> }}
   */
  toPayload(allHolds) {
    const holdsIndex = Object.fromEntries(allHolds.map(h => [h.id, h]));
    const holds = [];

    for (const [holdId, type] of this.#holds.entries()) {
      const hold = holdsIndex[holdId];
      if (!hold) continue;
      holds.push({ x: hold.x + HOLD_OFFSET_X, y: hold.y - HOLD_OFFSET_Y, channel: HOLD_CHANNEL[type] });
    }

    return { holds };
  }

  #emit() {
    window.dispatchEvent(new CustomEvent('routechange'));
  }
}
