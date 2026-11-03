export default class QTable {
    constructor(storageKey, alpha = 0.1, gamma = 0.9, epsilon = 0.2) {
        this.storageKey = storageKey;
        this.alpha = alpha; // Learning rate
        this.gamma = gamma; // Discount factor
        this.epsilon = epsilon; // Exploration rate
        this.table = {};
        
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.table = JSON.parse(data);
            }
        } catch (e) {
            console.error("Failed to load Q-Table", e);
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.table));
        } catch (e) {
            console.error("Failed to save Q-Table", e);
        }
    }

    getQValue(state, action) {
        if (!this.table[state]) this.table[state] = {};
        if (this.table[state][action] === undefined) this.table[state][action] = 0;
        return this.table[state][action];
    }

    chooseAction(state, availableActions) {
        // Epsilon-greedy
        if (Math.random() < this.epsilon) {
            return availableActions[Math.floor(Math.random() * availableActions.length)];
        }

        let bestAction = availableActions[0];
        let maxQ = this.getQValue(state, bestAction);

        for (let i = 1; i < availableActions.length; i++) {
            const qValue = this.getQValue(state, availableActions[i]);
            if (qValue > maxQ) {
                maxQ = qValue;
                bestAction = availableActions[i];
            }
        }
        return bestAction;
    }

    update(state, action, reward, nextState) {
        if (!this.table[nextState]) this.table[nextState] = {};
        
        const nextQValues = Object.values(this.table[nextState]);
        const maxNextQ = nextQValues.length > 0 ? Math.max(...nextQValues) : 0;
        
        const currentQ = this.getQValue(state, action);
        
        // Q-learning formula
        const newQ = currentQ + this.alpha * (reward + this.gamma * maxNextQ - currentQ);
        this.table[state][action] = newQ;
        
        this.save();
    }
}
