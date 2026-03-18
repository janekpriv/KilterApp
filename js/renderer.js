import { TENSOR_W, TENSOR_H, CANVAS_PADDING, HOLD_COLORS, HOLD_OFFSET_X, HOLD_OFFSET_Y } from './config.js';

const GLOW_ACTIVE   = 10;
const GLOW_HOVERED  = 18;
const INACTIVE_FILL = '#1e1e28';
const INACTIVE_STROKE = '#3a3a50';
const GRID_LINES    = 8;

export class BoardRenderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
  }

  /**
   * Resize canvas to fill its wrapper, preserving the tensor aspect ratio.
   */
  resize() {
    const w = this.canvas.parentElement.clientWidth;
    const h = Math.round(w * (TENSOR_H / TENSOR_W)) + CANVAS_PADDING * 2;
    this.canvas.width  = w;
    this.canvas.height = h;
  }

  /**
   * Full redraw. Called after every state change.
   *
   * @param {Array<{id: number, x: number, y: number}>} allHolds
   * @param {RouteState} routeState
   * @param {number|null} hoveredHoldId
   * @param {string} currentTool
   */
  draw(allHolds, routeState, hoveredHoldId, currentTool) {
    this.#drawBackground();
    this.#drawGrid();
    for (const hold of allHolds) {
      this.#drawHold(hold, routeState.get(hold.id), hold.id === hoveredHoldId, currentTool);
    }
  }

  /**
   * Maps tensor coordinates to canvas pixel position.
   * Tensor y=0 is the bottom of the wall; canvas y=0 is the top — flip required.
   *
   * @param {number} x  tensor x ∈ [0, TENSOR_W-1]
   * @param {number} y  tensor y ∈ [0, TENSOR_H-1]
   * @returns {{ px: number, py: number }}
   */
  toCanvas(x, y) {
    const gridW = this.canvas.width  - CANVAS_PADDING * 2;
    const gridH = this.canvas.height - CANVAS_PADDING * 2;
    return {
      px: CANVAS_PADDING + ((x + HOLD_OFFSET_X) / (TENSOR_W - 1)) * gridW,
      py: CANVAS_PADDING + (1 - (y - HOLD_OFFSET_Y) / (TENSOR_H - 1)) * gridH,
    };
  }

  /**
   * Finds the hold nearest to a canvas pixel position, within hit-test radius.
   *
   * @param {number} mouseX
   * @param {number} mouseY
   * @param {Array<{id: number, x: number, y: number}>} allHolds
   * @returns {{ id: number, x: number, y: number } | null}
   */
  findHoldAt(mouseX, mouseY, allHolds) {
    const hitRadius = this.#holdRadius() * 1.8;
    let best = null;
    let bestDist = Infinity;

    for (const hold of allHolds) {
      const { px, py } = this.toCanvas(hold.x, hold.y);
      const d = Math.hypot(mouseX - px, mouseY - py);
      if (d < hitRadius && d < bestDist) { best = hold; bestDist = d; }
    }

    return best;
  }

  // ─── private ──────────────────────────────────────────────────────────────

  #holdRadius() {
    return Math.max(4, (this.canvas.width / TENSOR_W) * 2.2);
  }

  #drawBackground() {
    this.ctx.fillStyle = '#0c0c10';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  #drawGrid() {
    const { ctx, canvas } = this;
    const gridW = canvas.width  - CANVAS_PADDING * 2;
    const gridH = canvas.height - CANVAS_PADDING * 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= GRID_LINES; i++) {
      const x = CANVAS_PADDING + (i / GRID_LINES) * gridW;
      ctx.beginPath(); ctx.moveTo(x, CANVAS_PADDING); ctx.lineTo(x, canvas.height - CANVAS_PADDING); ctx.stroke();
      const y = CANVAS_PADDING + (i / GRID_LINES) * gridH;
      ctx.beginPath(); ctx.moveTo(CANVAS_PADDING, y); ctx.lineTo(canvas.width - CANVAS_PADDING, y); ctx.stroke();
    }
  }

  #drawHold(hold, type, isHovered, currentTool) {
    const { ctx } = this;
    const { px, py } = this.toCanvas(hold.x, hold.y);
    const r = this.#holdRadius();

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);

    if (type) {
      this.#drawActiveHold(ctx, px, py, r, type, isHovered);
    } else {
      this.#drawInactiveHold(ctx, px, py, r, isHovered, currentTool);
    }

    ctx.shadowBlur = 0;
  }

  #drawActiveHold(ctx, px, py, r, type, isHovered) {
    const color = HOLD_COLORS[type];
    ctx.shadowColor = color;
    ctx.shadowBlur  = isHovered ? GLOW_HOVERED : GLOW_ACTIVE;
    ctx.fillStyle   = color;
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    this.#drawHoldMarker(ctx, px, py, r, type);
  }

  #drawInactiveHold(ctx, px, py, r, isHovered, currentTool) {
    if (isHovered && currentTool !== 'clear') {
      const color = HOLD_COLORS[currentTool];
      ctx.fillStyle   = color + '33';
      ctx.fill();
      ctx.strokeStyle = color + 'aa';
      ctx.lineWidth   = 1.5;
    } else if (isHovered) {
      ctx.fillStyle   = 'rgba(255,255,255,0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth   = 1.5;
    } else {
      ctx.fillStyle   = INACTIVE_FILL;
      ctx.fill();
      ctx.strokeStyle = INACTIVE_STROKE;
      ctx.lineWidth   = 1;
    }
    ctx.stroke();
  }

  #drawHoldMarker(ctx, px, py, r, type) {
    const fontSize = Math.max(6, r * 1.1);
    ctx.fillStyle      = 'rgba(0,0,0,0.7)';
    ctx.textAlign      = 'center';
    ctx.textBaseline   = 'middle';
    ctx.font           = `bold ${fontSize}px DM Mono, monospace`;

    if (type === 'start') {
      ctx.fillText('S', px, py);
    } else if (type === 'top') {
      ctx.fillText('T', px, py);
    } else if (type === 'foot') {
      ctx.beginPath();
      ctx.moveTo(px, py - r * 0.45);
      ctx.lineTo(px + r * 0.4, py + r * 0.35);
      ctx.lineTo(px - r * 0.4, py + r * 0.35);
      ctx.closePath();
      ctx.fill();
    }
  }
}
