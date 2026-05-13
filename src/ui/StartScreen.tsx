import { useGame } from '../state/GameContext';

export function StartScreen() {
  const { dispatch } = useGame();

  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-2 tracking-tight">King Gin</h1>
      <p className="text-green-300 text-lg mb-8">Contract Rummy for 4 players</p>
      <button
        onClick={() => dispatch({ type: 'START_GAME' })}
        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-lg shadow-lg transition-colors"
      >
        Start Round 1
      </button>
      <p className="text-green-600 text-sm mt-4">You vs. 3 bots</p>
    </div>
  );
}
