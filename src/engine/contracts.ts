import type { ContractSpec, ContractMeld } from './types';

export type { ContractSpec, ContractMeld };

// One entry per round (index 0 = round 1)
export const CONTRACTS: ContractSpec[] = [
  // Round 1: Two Groups of 3 (6 card contract)
  [{ type: 'group', size: 3 }, { type: 'group', size: 3 }],
  // Round 2: One Group of 3 + One Sequence of 4 (7 card contract)
  [{ type: 'group', size: 3 }, { type: 'sequence', size: 4 }],
  // Round 3: Two Sequences of 4 (8 card contract)
  [{ type: 'sequence', size: 4 }, { type: 'sequence', size: 4 }],
  // Round 4: Three Groups of 3 (9 card contract)
  [{ type: 'group', size: 3 }, { type: 'group', size: 3 }, { type: 'group', size: 3 }],
  // Round 5: Two Groups of 3 + One Sequence of 4 (10 card contract)
  [{ type: 'group', size: 3 }, { type: 'group', size: 3 }, { type: 'sequence', size: 4 }],
  // Round 6: One Group of 3 + Two Sequences of 4 (11 card contract)
  [{ type: 'group', size: 3 }, { type: 'sequence', size: 4 }, { type: 'sequence', size: 4 }],
  // Round 7: Three Sequences of 4 (12 card contract)
  [{ type: 'sequence', size: 4 }, { type: 'sequence', size: 4 }, { type: 'sequence', size: 4 }],
];

export function contractSize(contract: ContractSpec): number {
  return contract.reduce((sum, meld) => sum + meld.size, 0);
}
