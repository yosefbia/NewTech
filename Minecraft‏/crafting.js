// Simple shapeless crafting. Each recipe = required items + output. CRAFT recipes need a crafting table nearby.
const RECIPES = [
  { out: { key: 'PLANKS', count: 4 }, req: { WOOD: 1 }, needTable: false },
  { out: { key: 'STICK',  count: 4 }, req: { PLANKS: 2 }, needTable: false },
  { out: { key: 'CRAFT',  count: 1 }, req: { PLANKS: 4 }, needTable: false },
  { out: { key: 'TORCH',  count: 4 }, req: { STICK: 1, COAL_ITEM: 1 }, needTable: false },
  { out: { key: 'FURNACE', count: 1 }, req: { STONE: 8 }, needTable: true },

  // wood tools
  { out: { key: 'WOOD_PICK',   count: 1 }, req: { PLANKS: 3, STICK: 2 }, needTable: true },
  { out: { key: 'WOOD_AXE',    count: 1 }, req: { PLANKS: 3, STICK: 2 }, needTable: true },
  { out: { key: 'WOOD_SHOVEL', count: 1 }, req: { PLANKS: 1, STICK: 2 }, needTable: true },
  { out: { key: 'WOOD_SWORD',  count: 1 }, req: { PLANKS: 2, STICK: 1 }, needTable: true },
  // stone
  { out: { key: 'STONE_PICK',   count: 1 }, req: { STONE: 3, STICK: 2 }, needTable: true },
  { out: { key: 'STONE_AXE',    count: 1 }, req: { STONE: 3, STICK: 2 }, needTable: true },
  { out: { key: 'STONE_SHOVEL', count: 1 }, req: { STONE: 1, STICK: 2 }, needTable: true },
  { out: { key: 'STONE_SWORD',  count: 1 }, req: { STONE: 2, STICK: 1 }, needTable: true },
  // iron
  { out: { key: 'IRON_PICK',   count: 1 }, req: { IRON_ITEM: 3, STICK: 2 }, needTable: true },
  { out: { key: 'IRON_AXE',    count: 1 }, req: { IRON_ITEM: 3, STICK: 2 }, needTable: true },
  { out: { key: 'IRON_SHOVEL', count: 1 }, req: { IRON_ITEM: 1, STICK: 2 }, needTable: true },
  { out: { key: 'IRON_SWORD',  count: 1 }, req: { IRON_ITEM: 2, STICK: 1 }, needTable: true },
  // diamond
  { out: { key: 'DIAMOND_PICK',   count: 1 }, req: { DIAMOND_ITEM: 3, STICK: 2 }, needTable: true },
  { out: { key: 'DIAMOND_AXE',    count: 1 }, req: { DIAMOND_ITEM: 3, STICK: 2 }, needTable: true },
  { out: { key: 'DIAMOND_SHOVEL', count: 1 }, req: { DIAMOND_ITEM: 1, STICK: 2 }, needTable: true },
  { out: { key: 'DIAMOND_SWORD',  count: 1 }, req: { DIAMOND_ITEM: 2, STICK: 1 }, needTable: true },
];

const Crafting = {
  canCraft(recipe, inv, hasTable) {
    if (recipe.needTable && !hasTable) return false;
    for (const k in recipe.req) {
      if (inv.countOf(k) < recipe.req[k]) return false;
    }
    return true;
  },
  craft(recipe, inv, hasTable) {
    if (!this.canCraft(recipe, inv, hasTable)) return false;
    for (const k in recipe.req) inv.remove(k, recipe.req[k]);
    inv.add(recipe.out.key, recipe.out.count);
    return true;
  },
};
