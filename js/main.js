import { HoldType, TOOL_KEYS }   from './config.js';
import { generateHolds }         from './holds.js';
import { RouteState }            from './routeState.js';
import { BoardRenderer }         from './renderer.js';
import { UIController }          from './uiController.js';
import { predictDifficulty }     from './api.js';

// ─── Bootstrap ──────────────────────────────────────────────────────────────

const canvas   = document.getElementById('wallCanvas');
const allHolds = generateHolds();

const renderer = new BoardRenderer(canvas);
const route    = new RouteState();
const ui       = new UIController();

let currentTool  = HoldType.START;
let hoveredHoldId = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function redraw() {
  renderer.draw(allHolds, route, hoveredHoldId, currentTool);
}

function syncUI() {
  ui.refresh(route.counts(), route.isValid());
}

function toCanvasMouse(e) {
  const rect  = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

// ─── Canvas events ───────────────────────────────────────────────────────────

canvas.addEventListener('click', e => {
  const { x, y } = toCanvasMouse(e);
  const hold = renderer.findHoldAt(x, y, allHolds);
  if (!hold) return;

  if (currentTool === 'clear') {
    route.delete(hold.id);
  } else {
    // toggle off if same type clicked again
    route.get(hold.id) === currentTool
      ? route.delete(hold.id)
      : route.set(hold.id, currentTool);
  }

  syncUI();
  redraw();
});

canvas.addEventListener('mousemove', e => {
  const { x, y } = toCanvasMouse(e);
  const hold  = renderer.findHoldAt(x, y, allHolds);
  const newId = hold?.id ?? null;

  if (newId !== hoveredHoldId) {
    hoveredHoldId = newId;
    redraw();
  }
});

canvas.addEventListener('mouseleave', () => {
  hoveredHoldId = null;
  redraw();
});

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  const tool = TOOL_KEYS[e.key];
  if (tool) setTool(tool);
});

// ─── Tool selection ──────────────────────────────────────────────────────────

function setTool(tool) {
  currentTool = tool;
  ui.setActiveTool(tool);
}

// Expose to inline onclick handlers in HTML
window.setTool = setTool;

// ─── Predict ─────────────────────────────────────────────────────────────────

async function predict() {
  const payload = route.toPayload(allHolds);
  ui.setPredictLoading(true);
  ui.showTensorDebug(payload);

  try {
    const result = await predictDifficulty(payload);
    ui.showGrade(result);
    ui.showTensorDebug(payload, result);
  } catch (err) {
    console.error('[predict]', err);
    ui.showGradeError();
  } finally {
    ui.setPredictLoading(false);
  }
}

window.predict = predict;

// ─── Reset ───────────────────────────────────────────────────────────────────

function resetRoute() {
  route.clear();
  ui.resetDisplay();
  syncUI();
  redraw();
}

window.resetRoute = resetRoute;

// ─── Init ────────────────────────────────────────────────────────────────────

function init() {
  renderer.resize();
  syncUI();
  redraw();
}

window.addEventListener('resize', () => {
  renderer.resize();
  redraw();
});

init();
