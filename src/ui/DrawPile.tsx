import { useGame } from '../state/GameContext';

export function DrawPile() {
  const { state, dispatch } = useGame();
  const isMyTurn = state.activePlayerIndex === state.humanPlayerIndex;
  const canDraw = isMyTurn && state.phase === 'waiting-draw';

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => dispatch({ type: 'DRAW_STOCK' })}
        disabled={!canDraw}
        className="w-16 h-22 bg-blue-800 border-2 border-blue-600 rounded flex flex-col items-center justify-center text-white text-xs font-medium disabled:opacity-50 hover:bg-blue-700 disabled:cursor-not-allowed px-2 py-3"
      >
        <span className="text-lg">🂠</span>
        <span>{state.drawPile.length}</span>
      </button>
      <span className="text-xs text-gray-400">Stock</span>
    </div>
  );
}
