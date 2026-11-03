import usePlayerStore from '../../store/PlayerStore';

export default class CombatSystem {
    // Basic turn based resolution
    static resolveAttack(attackerStats, defenderStats) {
        // attack - defense + random(1,6)
        const roll = Math.floor(Math.random() * 6) + 1;
        const damage = Math.max(1, attackerStats.attack - defenderStats.defense + roll);
        return damage;
    }

    static playerAttack(enemy) {
        const { stats } = usePlayerStore.getState();
        const dmg = this.resolveAttack(stats, { defense: enemy.dataStats.defense });
        return { damage: dmg, killed: enemy.takeDamage(dmg) };
    }

    static enemyAttack(enemy) {
        const { stats, updateStats } = usePlayerStore.getState();
        const dmg = this.resolveAttack({ attack: enemy.dataStats.attack }, stats);
        
        let newHP = Math.max(0, stats.hp - dmg);
        updateStats({ hp: newHP });
        
        return { damage: dmg, killed: newHP <= 0 };
    }
}
