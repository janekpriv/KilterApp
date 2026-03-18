export const TENSOR_W = 185;
export const TENSOR_H = 173;
export const CANVAS_PADDING = 20;
export const HOLD_OFFSET_X = 20;  
export const HOLD_OFFSET_Y = 4;

export const HoldType = Object.freeze({
  START: 'start',
  FOOT:  'foot',
  HAND:  'hand',
  TOP:   'top',
});

export const HOLD_CHANNEL = Object.freeze({
  [HoldType.START]: 0,
  [HoldType.FOOT]:  1,
  [HoldType.HAND]:  2,
  [HoldType.TOP]:   3,
});

export const HOLD_COLORS = Object.freeze({
  [HoldType.START]: '#00e87a',
  [HoldType.FOOT]:  '#f5a623',
  [HoldType.HAND]:  '#4d9fff',
  [HoldType.TOP]:   '#ff4d6a',
});

export const TOOL_KEYS = Object.freeze({
  '1': HoldType.START,
  '2': HoldType.FOOT,
  '3': HoldType.HAND,
  '4': HoldType.TOP,
  'x': 'clear',
  'X': 'clear',
});

export const API_URL = '/predict';
