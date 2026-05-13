import { useGame } from '../state/GameContext';
import { Card } from './Card';

export function DiscardPile() {
  const { state, dispatch } = useGame();
  const isMyTurn = state.activePlayerIndex === state.humanPlayerIndex;
  const canTake = isMyTurn && state.phase === 'waiting-draw' && state.discardPile.length > 0;
  const topCard = state.discardPile[state.discardPile.length - 1];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        {topCard ? (
          <button
            onClick={() => dispatch({ type: 'DRAW_DISCARD' })}
            disabled={!canTake}
            className="disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <Card card={topCard} />
          </button>
        ) : (
          <div className="w-10 h-14 border-2 border-dashed border-gray-500 rounded" />
        )}
      </div>
      <span className="text-xs text-gray-400">Discard</span>
    </div>
  );
}
