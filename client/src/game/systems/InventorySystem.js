import usePlayerStore from '../../store/PlayerStore';

export default class InventorySystem {
    static useItem(index) {
        const { inventory, removeItem, updateStats, stats } = usePlayerStore.getState();
        const item = inventory[index];
        if (!item || !item.effect) {
            console.warn(`No item or effect at index ${index}`);
            return;
        }

        const newStats = { ...item.effect };
        let logMsg = `Using ${item.name}: `;
        
        // Special handling for HP to not exceed maxHp
        if (newStats.hp) {
            const healAmount = newStats.hp;
            newStats.hp = Math.min(stats.maxHp, stats.hp + healAmount);
            logMsg += `Healed ${healAmount} HP. `;
        }
        
        // For other stats (attack, defense, maxHp), we add them to current values
        if (newStats.attack) {
            logMsg += `Attack +${newStats.attack}. `;
            newStats.attack = (stats.attack || 0) + newStats.attack;
        }
        if (newStats.defense) {
            logMsg += `Defense +${newStats.defense}. `;
            newStats.defense = (stats.defense || 0) + newStats.defense;
        }
        if (newStats.maxHp) {
            logMsg += `Max HP +${newStats.maxHp}. `;
            newStats.maxHp = (stats.maxHp || 100) + newStats.maxHp;
        }

        console.log(logMsg);
        updateStats(newStats);
        removeItem(index);
    }
}
