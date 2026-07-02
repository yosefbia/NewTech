/* ============================================================
   config.js — game data
   Every tile type and tool is defined here. Adding a new tile
   or tool starts here (plus a .tile-* texture in css/tiles.css).
   ============================================================ */
'use strict';

/* Tile types. `empty` tiles can be built on; solid tiles name
   the tool that harvests them. */
const TILE_TYPES = {
  sky:   { label: 'Sky',   empty: true },
  cave:  { label: 'Cave',  empty: true },
  grass: { label: 'Grass', tool: 'shovel' },
  dirt:  { label: 'Dirt',  tool: 'shovel' },
  sand:  { label: 'Sand',  tool: 'shovel' },
  rock:  { label: 'Rock',  tool: 'pickaxe' },
  tree:  { label: 'Tree',  tool: 'axe' },
  water: { label: 'Water', tool: 'bucket' },
};

/* Tools. `removes` is filled in from TILE_TYPES below, so the
   tool <-> tile mapping lives in exactly one place. */
const TOOL_TYPES = {
  axe:     { label: 'Axe',     removes: [] },
  pickaxe: { label: 'Pickaxe', removes: [] },
  shovel:  { label: 'Shovel',  removes: [] },
  bucket:  { label: 'Bucket',  removes: [] },
};

for (const [type, tile] of Object.entries(TILE_TYPES)) {
  if (tile.tool) TOOL_TYPES[tile.tool].removes.push(type);
}

/* World sizing, shared by the landing form and the generator. */
const WORLD_LIMITS = { minCols: 12, maxCols: 60, minRows: 8, maxRows: 24 };
const WORLD_DEFAULT = { cols: 24, rows: 14 };

/* Parse an int and keep it inside [min, max]. */
function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
