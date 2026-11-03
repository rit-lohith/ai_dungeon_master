import useQuestStore from '../../store/QuestStore';
import LLMService from '../../services/LLMService';
import fallbackQuests from '../../data/quests.json';

export default class QuestSystem {
    static async generateLLMQuest(level) {
        const result = await LLMService.generateQuest(level);
        if (result && result.type) {
            return {
                id: 'gen_' + Date.now(),
                ...result
            };
        }
        
        // Fallback
        const fallback = fallbackQuests[Math.floor(Math.random() * fallbackQuests.length)];
        return { ...fallback, id: 'fb_' + Date.now() };
    }

    static notifyKill(targetId) {
        // Whenever a monster is killed, update relevant kill quests
        const store = useQuestStore.getState();
        const activeQuests = store.quests.filter(q => q.status === 'active' && q.type === 'kill' && q.target === targetId);
        
        activeQuests.forEach(q => {
            store.updateQuestProgress(q.id, 1);
        });
    }
}
