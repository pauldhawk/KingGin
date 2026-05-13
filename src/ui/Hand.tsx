import { useState } from 'react';
import type { AnyCard } from '../engine/types';
import { CONTRACTS } from '../engine/contracts';
import { validateContractFlexible, canGoOut } from '../engine/validate';
import { useGame } from '../state/GameContext';
import { Card } from './Card';

export function Hand() {
  const { state, dispatch } = useGame();
  const [selectedCard, setSelectedCard] = useState<AnyCard | null>(null);

  const contract = CONTRACTS[state.roundIndex];
  const human = state.players[state.humanPlayerIndex];
  const isMyTurn = state.activePlayerIndex === state.humanPlayerIndex;
  const canAct = isMyTurn && state.phase === 'waiting-discard';

  // "Go Out" only if removing THIS specific selected card leaves a valid flexible contract
  const selectedIdx = selectedCard !== null ? human.hand.indexOf(selectedCard) : -1;
  const canGoOutWithSelected =
    selectedIdx !== -1 &&
    canAct &&
    validateContractFlexible(human.hand.filter((_, j) => j !== selectedIdx), contract);

  // Show "Go Out" button label when canGoOut is possible at all (greyed if wrong card selected)
  const goOutPossible = canAct && canGoOut(human.hand, contract);

  function handleCardClick(card: AnyCard) {
    if (!canAct) return;
    setSelectedCard((prev) => (prev === card ? null : card));
  }

  function handleDiscard() {
    if (!selectedCard || !canAct) return;
    dispatch({ type: 'DISCARD', card: selectedCard });
    setSelectedCard(null);
  }

  function handleGoOut() {
    if (!selectedCard || !canGoOutWithSelected) return;
    dispatch({ type: 'GO_OUT', discardCard: selectedCard });
    setSelectedCard(null);
  }

  if (!human) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-gray-400">
        {state.phase === 'waiting-draw' && isMyTurn && 'Draw a card to continue'}
        {state.phase === 'waiting-discard' && isMyTurn && 'Select a card to discard'}
        {!isMyTurn && state.phase !== 'round-over' && 'Waiting for bot…'}
      </p>
      <div className="flex flex-wrap gap-1 justify-center">
        {human.hand.map((card, i) => (
          <Card
            key={i}
            card={card}
            selected={selectedCard === card}
            onClick={canAct ? () => handleCardClick(card) : undefined}
          />
        ))}
      </div>
      {canAct && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleDiscard}
            disabled={!selectedCard}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-40 hover:bg-blue-700 disabled:cursor-not-allowed"
          >
            Discard
          </button>
          {goOutPossible && (
            <button
              onClick={handleGoOut}
              disabled={!canGoOutWithSelected}
              className="px-4 py-1.5 bg-green-600 text-white rounded text-sm disabled:opacity-40 hover:bg-green-700 disabled:cursor-not-allowed"
            >
              Go Out!
            </button>
          )}
        </div>
      )}
    </div>
  );
}
