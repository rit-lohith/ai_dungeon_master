import useGameStore from '../store/GameStore';

export function useGame() {
    return useGameStore();
}
