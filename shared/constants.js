module.exports = {
  TILE_SIZE: 32,
  MAP_WIDTH: 80,
  MAP_HEIGHT: 80,
  DIRECTIONS: [ {x:0, y:-1}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0} ], // UP, RIGHT, DOWN, LEFT
  ENTITY_TYPES: {
    PLAYER: 'player',
    ENEMY: 'enemy',
    NPC: 'npc',
    ITEM: 'item'
  },
  EMOTIONS: {
    FRIENDLY: 'friendly',
    NEUTRAL: 'neutral',
    HOSTILE: 'hostile',
    FEARFUL: 'fearful'
  }
};
