import QTable from './QTable';
import { manhattanDistance } from '../../utils/mathUtils';

export default class EnemyAI {
    constructor(enemy, player) {
        this.enemy = enemy;
        this.player = player;
        this.qTable = new QTable('enemy_ai_qtable');
    }

    getState() {
        // State space: distance (close/medium/far) + playerHP (low/mid/high) + enemyHP (low/mid/high)
        const dist = manhattanDistance(this.enemy.gridX, this.enemy.gridY, this.player.gridX, this.player.gridY);
        let distState = 'far';
        if (dist <= 1) distState = 'close';
        else if (dist <= 4) distState = 'medium';

        let pHP = 'high';
        if (this.player.hp < 20) pHP = 'low';
        else if (this.player.hp < 60) pHP = 'mid';

        let eHP = 'high';
        if (this.enemy.hp < 15) eHP = 'low';
        else if (this.enemy.hp < 30) eHP = 'mid';

        return `${distState}_${pHP}_${eHP}`;
    }

    chooseAction(state) {
        return this.qTable.chooseAction(state, ['move_toward', 'move_away', 'attack', 'defend']);
    }

    learn(oldState, action, reward, newState) {
        this.qTable.update(oldState, action, reward, newState);
    }
}
