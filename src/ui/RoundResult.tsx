import { useGame } from '../state/GameContext';

export function RoundResult() {
  const { state } = useGame();
  const { players, finalScores, goingOutPlayerIndex } = state;

  if (!finalScores) return null;

  const winner = goingOutPlayerIndex !== null ? players[goingOutPlayerIndex] : null;

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
      <div className="bg-gray-800 rounded-xl p-8 min-w-72 shadow-2xl border border-gray-600">
        <h2 className="text-xl font-bold text-white text-center mb-2">Round Over!</h2>
        {winner && (
          <p className="text-green-400 text-center text-sm mb-4">
            {winner.name} went out
          </p>
        )}
        <div className="space-y-2">
          {players.map((player, i) => (
            <div key={player.id} className="flex justify-between items-center">
              <span className={`text-sm ${i === goingOutPlayerIndex ? 'text-green-400 font-medium' : 'text-gray-300'}`}>
                {player.name}
              </span>
              <span className={`text-sm font-bold ${i === goingOutPlayerIndex ? 'text-green-400' : finalScores[i] > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {finalScores[i]} pts
              </span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs text-center mt-6">
          Multi-round support coming in Iteration 5
        </p>
      </div>
    </div>
  );
}
