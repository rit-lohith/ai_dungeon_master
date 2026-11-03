// Simple pub-sub event system using Phaser's Event Emitter
import Phaser from 'phaser';

const EventSystem = new Phaser.Events.EventEmitter();

export const EVENTS = {
    PLAYER_MOVED: 'player_moved',
    COMBAT_START: 'combat_start',
    COMBAT_END: 'combat_end',
    QUEST_COMPLETED: 'quest_completed',
    NPC_TALK: 'npc_talk',
    ITEM_PICKUP: 'item_pickup',
    LEVEL_CHANGED: 'level_changed'
};

export default EventSystem;
