# Minecraft JS

A 2D, tile-based Minecraft built for the NewTech weekend assignment with plain
HTML, CSS and JavaScript — no libraries, no frameworks and no image files:
every block texture is drawn with layered CSS gradients.

## Description

You harvest a 2D world block by block and build it back your way. Pick a tool,
click a matching block and it pops out of the world into your pack; pick a
block from the pack and click any empty spot to place it. The landing page
(`index.html`) explains the rules and lets you start the classic hand-built
world or roll a random one at a size you choose.

**Base features** (assignment requirements)

- 24×14 hardcoded world with grass, dirt, rock and tree tiles
- Tool selection with a highlighted state (CSS classes, no inline styles)
- Removing a tile only with the matching tool, with feedback when it is wrong
- Inventory that collects harvested tiles and places them back
- Reset button that restores the world to its exact starting layout
- Separate landing page with a tutorial

**Extra features**

- Full stacked inventory with counts (not just the last tile)
- Two extra tile types (water, sand) and an extra tool (bucket)
- Sky vs. cave: emptied cells above ground show sky, underground they
  become dark cave holes
- Fade/pop animations for harvesting and placing, shake on wrong tool
- Keyboard shortcuts: `1–4` select tools, `Esc` clears the selection
- Status bar with contextual messages
- Responsive layout; oversized worlds scroll horizontally
- Pick the world size (12–60 × 8–24) on the landing page
- Procedural generation ("Unleash the Ninja"): trees only on grass, rocks
  underground, sandy shores, water settles in the dips, caves with intact
  roofs, nothing floats

## How to run

Open `index.html` in any modern browser — no build step, no server needed
(a local server such as `python -m http.server` works too).

## Project structure

| File | Role |
| --- | --- |
| `index.html` | Landing page: tutorial, tools/blocks legend, world-size form |
| `game.html` | The game: toolbar, world and pack containers (hardcoded, per the tips) |
| `css/base.css` | Design tokens, shared panels/buttons/badges |
| `css/tiles.css` | Every block texture as CSS gradients + tile states/animations |
| `css/game.css` | Game screen layout, world frame, sky decorations, status bar |
| `css/landing.css` | Landing page layout |
| `js/config.js` | All tile/tool definitions in one place + size limits |
| `js/worlds.js` | Hardcoded layout, layout parser, random world generator |
| `js/inventory.js` | Pack state (counts, selection) — pure data, no DOM |
| `js/ui.js` | All DOM rendering: tiles, slots, toolbar highlight, status |
| `js/game.js` | The `Game` controller: turn rules and event wiring |
| `js/main.js` | Boot: reads world options from the URL |
| `js/landing.js` | Landing form + preset chips |

The world is defined as strings (one character per tile) and parsed into a
2D array, so the hardcoded map stays easy to read and edit in `js/worlds.js`.

## What I found hard

- Keeping the tool↔tile mapping in one place so new blocks don't need
  changes in five files — solved by deriving each tool's `removes` list
  from the tile definitions in `config.js`.
- Deciding what an emptied cell should look like: a mined rock deep
  underground should not show bright sky. The fix was computing a ground
  level per column and showing sky above it and dark cave below it.
- Making the random generator follow "reasonable nature" rules (trees on
  grass, water only in dips, caves that don't break the surface) without
  it becoming spaghetti — it ended up as five small ordered passes.

## Known bugs

- None known. One deliberate quirk: you may place blocks on any empty cell,
  including mid-air — free building is allowed on purpose (like Minecraft
  bridges). Blocks under a tree can also be dug away, leaving it hovering.

## Assignment review

A fun scope: big enough to force real structure decisions (state vs.
rendering, data-driven config), small enough to finish in a weekend. The
tips in the brief — CSS classes over inline styles, one object for game
logic, hardcoded containers — genuinely shaped the cleaner parts of this
code. Drawing all the tile textures in pure CSS was the unexpected rabbit
hole and the most satisfying part.
