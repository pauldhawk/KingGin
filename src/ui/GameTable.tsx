import { useGame } from '../state/GameContext';
import type { ContractSpec } from '../engine/contracts';
import { CONTRACTS, contractSize } from '../engine/contracts';
import { BotHand } from './BotHand';
import { DrawPile } from './DrawPile';
import { DiscardPile } from './DiscardPile';
import { Hand } from './Hand';
import { RoundResult } from './RoundResult';

function contractLabel(contract: ContractSpec): string {
  const size = contractSize(contract);
  const parts = contract.map((m) => `${m.size} ${m.type === 'group' ? 'Group' : 'Seq'}`);
  return `Round contract: ${parts.join(' + ')} (${size} cards)`;
}

export function GameTable() {
  const { state } = useGame();
  const { players, activePlayerIndex, humanPlayerIndex, roundIndex } = state;
  const contract = CONTRACTS[roundIndex];
  const botPlayers = players.filter((_, i) => i !== humanPlayerIndex);

  return (
    <div className="relative min-h-screen bg-green-900 flex flex-col text-white select-none">
      {/* Round indicator */}
      <div className="flex justify-center pt-3 pb-1">
        <span className="text-sm text-green-300 bg-green-800 px-3 py-1 rounded-full">
          Round {roundIndex + 1} — {contractLabel(contract)}
        </span>
      </div>

      {/* Bot hands */}
      <div className="flex justify-center gap-4 px-4 py-3">
        {botPlayers.map((p) => {
          const globalIdx = players.indexOf(p);
          return (
            <BotHand key={p.id} player={p} isActive={activePlayerIndex === globalIdx} />
          );
        })}
      </div>

      {/* Center: draw + discard */}
      <div className="flex justify-center items-center gap-8 py-4">
        <DrawPile />
        <DiscardPile />
      </div>

      {/* Human hand */}
      <div className="mt-auto pb-6 px-4">
        <div className="bg-green-800 rounded-xl p-4">
          <p className="text-xs text-green-400 text-center mb-2 font-medium">Your Hand</p>
          <Hand />
        </div>
      </div>

      {/* Round-over overlay */}
      {state.phase === 'round-over' && <RoundResult />}
    </div>
  );
}
