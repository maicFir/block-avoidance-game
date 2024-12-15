import useSound from "use-sound";
export const useGameVoice = () => {
    const [play, { stop: stopGameStart }] = useSound("/mp3/game_start.mp3");
    const [playGameEnd, { stop: stopGameEnd }] = useSound("/mp3/game_over.mp3");
    const playGameVoice = () => {
        play();
    };
    const playGameEndVoice = () => {
        playGameEnd();
        
    };
    const gameOverVoice = () => {
        stopGameStart();
    };
    const gameEndVoice = () => {
        stopGameEnd();
    };
    return {
        playGameVoice,
        gameOverVoice,
        playGameEndVoice,
        gameEndVoice
    };
};