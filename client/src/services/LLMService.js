import axios from 'axios';
import { API_URL } from '../utils/constants';
import { buildDialogPayload, buildQuestPayload, buildItemPayload } from '../utils/promptBuilder';
import { safeParse } from '../utils/responseParser';
import npcFallbacks from '../data/dialogueFallbacks.json';
import questFallbacks from '../data/quests.json';

class LLMService {
    async generateDialogue(characterId, playerInput, context, history = []) {
        console.log('DEBUG: Calling LLM Dialogue API:', { characterId, playerInput, context });
        try {
            const payload = {
                characterId,
                playerInput,
                context: {
                    dialogueType: "npc",
                    npcName: context.name,
                    personality: context.personality,
                    history: history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
                }
            };
            const { data } = await axios.post(`${API_URL}/npc/dialogue`, payload);
            if (data.success) return data.data;
        } catch (error) {
            console.error('DEBUG: LLM Dialogue API failed:', error);
        }
        
        // Fallback
        const fallbackList = npcFallbacks.npc || npcFallbacks;
        const text = Array.isArray(fallbackList) 
            ? fallbackList[Math.floor(Math.random() * fallbackList.length)]
            : "Hello traveler.";
        return { text };
    }

    async generateEnemyDialogue(enemyId, context) {
        console.log('DEBUG: Calling LLM Enemy Dialogue API:', { enemyId, context });
        try {
            const payload = {
                characterId: enemyId,
                context: {
                    dialogueType: "enemy",
                    npcName: context.name || enemyId,
                    personality: context.personality || 'hostile',
                    history: []
                }
            };
            const { data } = await axios.post(`${API_URL}/npc/dialogue`, payload);
            if (data.success) return data.data;
        } catch (error) {
            console.error('DEBUG: LLM Enemy Dialogue API failed:', error);
        }
        
        // Fallback
        const fallbacks = npcFallbacks.enemy || ["Prepare to face your destiny!"];
        return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
    }

    async generateQuest(level) {
        try {
            const { data } = await axios.post(`${API_URL}/quest/generate`, buildQuestPayload(level));
            if (data.success) return data.data;
        } catch (error) {
            console.warn('LLM Quest failed offline fallback triggered', error);
        }
        // Fallback
        return questFallbacks[0];
    }

    async describeItem(itemName, rarity) {
        try {
            const { data } = await axios.post(`${API_URL}/item/describe`, buildItemPayload(itemName, rarity));
            if (data.success) return data.data;
        } catch (error) {
            console.warn('LLM Item describe failed', error);
        }
        return { description: `A standard ${rarity} ${itemName}.` };
    }
}

export default new LLMService();
