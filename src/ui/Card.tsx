import type { AnyCard } from '../engine/types';

const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
};

interface CardProps {
  card: AnyCard;
  onClick?: () => void;
  selected?: boolean;
  faceDown?: boolean;
  disabled?: boolean;
}

export function Card({ card, onClick, selected, faceDown, disabled }: CardProps) {
  if (faceDown) {
    return (
      <div className="w-10 h-14 bg-blue-800 rounded border border-blue-600 flex-shrink-0" />
    );
  }

  const isJoker = card.suit === 'joker';
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const textColor = isJoker ? 'text-purple-500' : isRed ? 'text-red-500' : 'text-gray-900';
  const borderColor = selected ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-300';
  const transform = selected ? '-translate-y-2' : '';
  const cursor = onClick && !disabled ? 'cursor-pointer hover:shadow-lg' : 'cursor-default';

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`w-10 h-14 bg-white rounded border-2 flex flex-col items-center justify-center text-xs font-bold flex-shrink-0 transition-transform ${borderColor} ${textColor} ${transform} ${cursor}`}
    >
      {isJoker ? (
        <span>Jo</span>
      ) : (
        <>
          <span className="leading-none">{card.rank}</span>
          <span className="leading-none">{SUIT_SYMBOLS[card.suit]}</span>
        </>
      )}
    </button>
  );
}
