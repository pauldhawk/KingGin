import type { Player } from '../engine/types';

interface BotHandProps {
  player: Player;
  isActive: boolean;
}

export function BotHand({ player, isActive }: BotHandProps) {
  return (
    <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${isActive ? 'bg-gray-700 ring-2 ring-yellow-400' : 'bg-gray-800'}`}>
      <span className={`text-xs font-medium ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
        {player.name} {isActive && '⟳'}
      </span>
      <div className="flex flex-wrap gap-0.5 justify-center max-w-40">
        {player.hand.map((_, i) => (
          <div key={i} className="w-5 h-7 bg-blue-800 rounded border border-blue-600 flex-shrink-0" />
        ))}
      </div>
      <span className="text-xs text-gray-500">{player.hand.length} cards</span>
    </div>
  );
}
