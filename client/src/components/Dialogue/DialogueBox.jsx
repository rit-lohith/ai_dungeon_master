import React, { useState, useEffect, useRef } from 'react';
import useNPCStore from '../../store/NPCStore';
import useGameStore from '../../store/GameStore';
import useQuestStore from '../../store/QuestStore';
import { SCENES } from '../../utils/constants';
import { HERO_ATTACK_BARKS, ENEMY_ATTACK_BARKS, NPC_GREETING_BARKS } from '../../data/combatBarks';
import DialogueInput from './DialogueInput';
import ThinkingSpinner from './ThinkingSpinner';
import LLMService from '../../services/LLMService';

export default function DialogueBox() {
    const { setScene, activeNPC } = useGameStore();
    const { memories, addMemory, setEmotion } = useNPCStore();
    const addQuest = useQuestStore(state => state.addQuest);
    const quests = useQuestStore(state => state.quests);
    
    // Mapping emotions to SpeechSynthesis values
    const EMOTION_PROPS = {
        aggressive: { pitch: 0.6, rate: 1.1 },
        hostile: { pitch: 0.7, rate: 1.1 },
        calm: { pitch: 1.0, rate: 0.9 },
        fearful: { pitch: 1.4, rate: 1.2 },
        neutral: { pitch: 1.0, rate: 1.0 },
        excited: { pitch: 1.2, rate: 1.2 }
    };

    const currentNpc = activeNPC || { id: 'generic', name: 'Mysterious Stranger', occupation: 'Traveler', emotion: 'neutral', personality: 'unknown' };
    const isEnemy = currentNpc.dialogueType === 'enemy';
    const isBoss = currentNpc.isBoss;
    
    const history = memories[currentNpc.id]?.history || [];
    const [isThinking, setIsThinking] = useState(false);
    const historyEndRef = useRef(null);
    const lastSpokenRef = useRef('');

    // Text-to-Speech Implementation
    const speakMessage = (text, emotion = 'neutral', role = 'npc') => {
        if (!text || text === lastSpokenRef.current) return;
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        if (role === 'player') {
            utterance.pitch = 1.1;
            utterance.rate = 1.0;
        } else {
            const props = EMOTION_PROPS[emotion] || EMOTION_PROPS.neutral;
            utterance.pitch = props.pitch;
            utterance.rate = props.rate;
        }
        
        utterance.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
        lastSpokenRef.current = text;
    };

    // Auto-Greeting Logic: Pick a random bark if history is empty
    useEffect(() => {
        if (history.length === 0) {
            let bark = "";
            if (isEnemy) {
                bark = ENEMY_ATTACK_BARKS[Math.floor(Math.random() * ENEMY_ATTACK_BARKS.length)];
            } else {
                bark = NPC_GREETING_BARKS[Math.floor(Math.random() * NPC_GREETING_BARKS.length)];
            }
            addMemory(currentNpc.id, bark, 'npc');
        }
    }, [currentNpc.id]);

    // Handle vocal speech whenever new message is appended to history
    useEffect(() => {
        const lastMsg = history[history.length - 1];
        if (lastMsg) {
            speakMessage(lastMsg.content, currentNpc.emotion || (isEnemy ? 'hostile' : 'neutral'), lastMsg.role);
        }
        // Auto scroll to bottom
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleChatSubmit = async (inputValue) => {
        if (!inputValue.trim() || isThinking) return;

        // 1. Add player message to store
        addMemory(currentNpc.id, inputValue, 'player');
        setIsThinking(true);

        try {
            // 2. Fetch dialogue from LLMService
            let response;
            if (isEnemy) {
                response = await LLMService.generateEnemyDialogue(currentNpc.id, {
                    ...currentNpc,
                    playerInput: inputValue,
                    history: history
                });
            } else {
                response = await LLMService.generateDialogue(currentNpc.id, inputValue, currentNpc, history);
            }

            // 3. Process LLM result
            if (response) {
                let replyText = response.text || "";
                
                // Inspect response to check if it's a Quest
                if (response.type === 'quest' || (response.title && response.objective)) {
                    replyText = `I have a task for you: ${response.title}. Objective: "${response.objective}"`;
                    
                    const questData = {
                        id: response.id || 'gen_' + Date.now(),
                        title: response.title,
                        objective: response.objective,
                        type: response.target ? 'kill' : 'custom',
                        target: response.target || 'enemy',
                        amount: response.amount || 1,
                        reward: response.reward || { gold: 20, xp: 80 }
                    };

                    // Prevent duplicates
                    const exists = quests.some(q => q.title === questData.title);
                    if (!exists) {
                        addQuest(questData);
                    }
                }

                addMemory(currentNpc.id, replyText, 'npc');
                if (response.emotion) {
                    setEmotion(currentNpc.id, response.emotion);
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            addMemory(currentNpc.id, "I cannot find the words right now...", 'npc');
        } finally {
            setIsThinking(false);
        }
    };

    const handleClose = () => {
        window.speechSynthesis.cancel();
        setScene(SCENES.GAME);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentNpc.id]);

    return (
        <div className="absolute inset-0 flex items-end justify-center pb-8 z-50 pointer-events-none px-6">
            <div className={`
                max-w-[700px] w-full bg-[#0c0c14]/95 border-2 
                ${isBoss ? 'border-soul-red/50 shadow-[0_-15px_40px_rgba(255,51,68,0.25)]' : 'border-accent/30 shadow-[0_-15px_40px_rgba(34,211,238,0.15)]'} 
                rounded-2xl p-6 backdrop-blur-xl pointer-events-auto flex flex-col relative animate-fade-in font-inter
            `}>
                
                {/* Speaker Identity Tab */}
                <div className={`absolute -top-7 left-6 px-4 py-1.5 rounded-t-xl border-t-2 border-x-2 flex items-center gap-2
                    ${isBoss ? 'bg-soul-red/20 border-soul-red/50' : 'bg-accent/10 border-accent/30'}
                `}>
                    <span className={`w-2 h-2 rounded-full ${isBoss ? 'bg-soul-red animate-ping' : 'bg-accent animate-pulse'}`} />
                    <span className="font-fantasy text-[10px] tracking-[0.2em] uppercase font-bold text-white">
                        {currentNpc.name} <span className="text-gray-400 font-pixel text-[8px] ml-1">({currentNpc.occupation || 'Hostile'})</span>
                    </span>
                </div>

                {/* Close Button ("Walk Away") */}
                <button 
                    onClick={handleClose}
                    className="absolute -top-7 right-6 px-3 py-1 bg-black/80 text-gray-400 border-t-2 border-x-2 border-white/10 rounded-t-xl text-[9px] hover:text-white font-pixel uppercase tracking-widest transition-colors duration-200"
                >
                    Walk Away [Esc]
                </button>

                {/* Scrollable Dialogue History Area */}
                <div className="flex flex-col gap-3 max-h-56 overflow-y-auto mb-4 p-2 custom-scrollbar border border-white/5 bg-black/25 rounded-lg">
                    {history.map((msg, idx) => {
                        const isPlayer = msg.role === 'player';
                        return (
                            <div 
                                key={idx} 
                                className={`flex flex-col max-w-[85%] rounded-xl px-4 py-2 text-xs leading-relaxed ${
                                    isPlayer 
                                        ? 'self-end bg-accent/10 text-cyan-100 border border-accent/20' 
                                        : (isBoss 
                                            ? 'self-start bg-soul-red/10 text-red-100 border border-soul-red/20' 
                                            : 'self-start bg-white/5 text-gray-200 border border-white/5')
                                }`}
                            >
                                <span className={`text-[7px] uppercase tracking-wider mb-0.5 font-bold ${isPlayer ? 'text-accent' : 'text-gray-400'}`}>
                                    {isPlayer ? 'Hero' : currentNpc.name}
                                </span>
                                <p className="m-0 font-serif tracking-wide select-text">"{msg.content}"</p>
                            </div>
                        );
                    })}
                    {isThinking && (
                        <div className="self-start">
                            <ThinkingSpinner />
                        </div>
                    )}
                    <div ref={historyEndRef} />
                </div>

                {/* Interactive Dialogue Input Bar */}
                <div className="border-t border-white/5 pt-3">
                    <DialogueInput onSubmit={handleChatSubmit} disabled={isThinking} />
                </div>
            </div>
        </div>
    );
}
