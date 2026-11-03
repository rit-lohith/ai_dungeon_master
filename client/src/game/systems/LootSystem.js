import itemData from '../../data/items.json';

export default class LootSystem {
    static generateLoot(dungeonLevel, isBoss = false) {
        const roll = Math.random() * 100;
        let rarity = 'common';
        
        if (isBoss) {
            // Bosses always drop Rare or better
            if (roll < 20) rarity = 'legendary';
            else if (roll < 50) rarity = 'epic';
            else rarity = 'rare';
        } else {
            // Denser level = better chance for rare/epic
            if (roll < dungeonLevel * 2) rarity = 'epic';
            else if (roll < dungeonLevel * 10) rarity = 'rare';
            else if (roll < dungeonLevel * 25) rarity = 'uncommon';
        }

        const pool = itemData.filter(i => i.rarity === rarity || (rarity === 'common' && i.rarity === 'common'));
        // If specific rarity pool is empty, fall back to anything in the pool
        if (pool.length === 0) return itemData[Math.floor(Math.random() * itemData.length)];
        
        return pool[Math.floor(Math.random() * pool.length)];
    }
}
