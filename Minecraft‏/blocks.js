// Block & item definitions. AIR=0; opaque blocks are >0.
const BLOCK_SIZE = 32;

const BLOCKS = {
  AIR:      { id: 0,  name: 'Air',      solid: false, color: null,      hardness: 0,   tool: null,      drops: null, light: 0 },
  GRASS:    { id: 1,  name: 'Grass',    solid: true,  color: '#5cbf3a', hardness: 0.6, tool: 'shovel',  drops: 'DIRT', topColor: '#7ed957' },
  DIRT:     { id: 2,  name: 'Dirt',     solid: true,  color: '#8b5a2b', hardness: 0.5, tool: 'shovel',  drops: 'DIRT' },
  STONE:    { id: 3,  name: 'Stone',    solid: true,  color: '#888888', hardness: 1.5, tool: 'pickaxe', drops: 'STONE' },
  SAND:     { id: 4,  name: 'Sand',     solid: true,  color: '#e8d36a', hardness: 0.4, tool: 'shovel',  drops: 'SAND' },
  WOOD:     { id: 5,  name: 'Wood',     solid: true,  color: '#6b4423', hardness: 1.0, tool: 'axe',     drops: 'WOOD' },
  LEAVES:   { id: 6,  name: 'Leaves',   solid: true,  color: '#2e8b3a', hardness: 0.2, tool: null,      drops: null, leaf: true },
  COAL:     { id: 7,  name: 'Coal Ore', solid: true,  color: '#444444', hardness: 2.0, tool: 'pickaxe', drops: 'COAL_ITEM' },
  IRON:     { id: 8,  name: 'Iron Ore', solid: true,  color: '#c8a37a', hardness: 2.5, tool: 'pickaxe', drops: 'IRON_ITEM', minTier: 1 },
  DIAMOND:  { id: 9,  name: 'Diamond',  solid: true,  color: '#6ee7e0', hardness: 3.0, tool: 'pickaxe', drops: 'DIAMOND_ITEM', minTier: 2 },
  BEDROCK:  { id: 10, name: 'Bedrock',  solid: true,  color: '#222222', hardness: -1,  tool: null,      drops: null },
  WATER:    { id: 11, name: 'Water',    solid: false, color: 'rgba(40,90,200,0.6)', hardness: -1, fluid: true },
  LAVA:     { id: 12, name: 'Lava',     solid: false, color: 'rgba(230,90,20,0.85)', hardness: -1, fluid: true, light: 8 },
  TORCH:    { id: 13, name: 'Torch',    solid: false, color: '#ffb84d', hardness: 0.1, tool: null,      drops: 'TORCH', light: 10 },
  PLANKS:   { id: 14, name: 'Planks',   solid: true,  color: '#b07a3a', hardness: 0.8, tool: 'axe',     drops: 'PLANKS' },
  CRAFT:    { id: 15, name: 'Crafting Table', solid: true, color: '#7a4a1f', hardness: 1.0, tool: 'axe', drops: 'CRAFT', special: 'craft' },
  FURNACE:  { id: 16, name: 'Furnace',  solid: true,  color: '#555555', hardness: 2.0, tool: 'pickaxe', drops: 'FURNACE', special: 'furnace' },
};

// id -> key lookup
const BLOCK_BY_ID = {};
for (const k in BLOCKS) { BLOCK_BY_ID[BLOCKS[k].id] = { ...BLOCKS[k], key: k }; }

// Items (some overlap with blocks; others are tools/materials)
const ITEMS = {
  // placeable blocks - same key
  DIRT:    { name: 'Dirt',   block: 'DIRT' },
  GRASS:   { name: 'Grass',  block: 'GRASS' },
  STONE:   { name: 'Stone',  block: 'STONE' },
  SAND:    { name: 'Sand',   block: 'SAND' },
  WOOD:    { name: 'Wood',   block: 'WOOD' },
  PLANKS:  { name: 'Planks', block: 'PLANKS' },
  LEAVES:  { name: 'Leaves', block: 'LEAVES' },
  TORCH:   { name: 'Torch',  block: 'TORCH' },
  CRAFT:   { name: 'Crafting Table', block: 'CRAFT' },
  FURNACE: { name: 'Furnace', block: 'FURNACE' },
  // materials
  COAL_ITEM:    { name: 'Coal' },
  IRON_ITEM:    { name: 'Iron Ingot' },
  DIAMOND_ITEM: { name: 'Diamond' },
  STICK:        { name: 'Stick' },
  SAPLING:      { name: 'Sapling' },
  APPLE:        { name: 'Apple', food: 4 },
  // tools - tier: 0=wood, 1=stone, 2=iron, 3=diamond
  WOOD_PICK:    { name: 'Wood Pickaxe',   tool: 'pickaxe', tier: 0, durability: 60,  speed: 1.5 },
  STONE_PICK:   { name: 'Stone Pickaxe',  tool: 'pickaxe', tier: 1, durability: 130, speed: 2.0 },
  IRON_PICK:    { name: 'Iron Pickaxe',   tool: 'pickaxe', tier: 2, durability: 250, speed: 3.0 },
  DIAMOND_PICK: { name: 'Diamond Pickaxe',tool: 'pickaxe', tier: 3, durability: 1560,speed: 5.0 },
  WOOD_AXE:     { name: 'Wood Axe',       tool: 'axe',     tier: 0, durability: 60,  speed: 1.5 },
  STONE_AXE:    { name: 'Stone Axe',      tool: 'axe',     tier: 1, durability: 130, speed: 2.0 },
  IRON_AXE:     { name: 'Iron Axe',       tool: 'axe',     tier: 2, durability: 250, speed: 3.0 },
  DIAMOND_AXE:  { name: 'Diamond Axe',    tool: 'axe',     tier: 3, durability: 1560,speed: 5.0 },
  WOOD_SHOVEL:  { name: 'Wood Shovel',    tool: 'shovel',  tier: 0, durability: 60,  speed: 1.5 },
  STONE_SHOVEL: { name: 'Stone Shovel',   tool: 'shovel',  tier: 1, durability: 130, speed: 2.0 },
  IRON_SHOVEL:  { name: 'Iron Shovel',    tool: 'shovel',  tier: 2, durability: 250, speed: 3.0 },
  DIAMOND_SHOVEL:{ name:'Diamond Shovel', tool: 'shovel',  tier: 3, durability: 1560,speed: 5.0 },
  WOOD_SWORD:   { name: 'Wood Sword',     tool: 'sword',   tier: 0, durability: 60,  damage: 4 },
  STONE_SWORD:  { name: 'Stone Sword',    tool: 'sword',   tier: 1, durability: 130, damage: 5 },
  IRON_SWORD:   { name: 'Iron Sword',     tool: 'sword',   tier: 2, durability: 250, damage: 6 },
  DIAMOND_SWORD:{ name: 'Diamond Sword',  tool: 'sword',   tier: 3, durability: 1560,damage: 7 },
};

function itemDef(key) { return ITEMS[key] || null; }
function blockDef(key) { return BLOCKS[key] || null; }
function blockById(id) { return BLOCK_BY_ID[id] || BLOCK_BY_ID[0]; }
