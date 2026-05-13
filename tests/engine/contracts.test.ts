import { describe, it, expect } from 'vitest';
import { CONTRACTS, contractSize } from '../../src/engine/contracts';

describe('CONTRACTS', () => {
  it('has exactly 7 entries', () => {
    expect(CONTRACTS).toHaveLength(7);
  });

  it('round 1: two groups of 3', () => {
    expect(CONTRACTS[0]).toEqual([
      { type: 'group', size: 3 },
      { type: 'group', size: 3 },
    ]);
  });

  it('round 2: one group of 3 + one sequence of 4', () => {
    expect(CONTRACTS[1]).toContainEqual({ type: 'group', size: 3 });
    expect(CONTRACTS[1]).toContainEqual({ type: 'sequence', size: 4 });
    expect(CONTRACTS[1]).toHaveLength(2);
  });

  it('round 3: two sequences of 4', () => {
    expect(CONTRACTS[2]).toEqual([
      { type: 'sequence', size: 4 },
      { type: 'sequence', size: 4 },
    ]);
  });

  it('round 4: three groups of 3', () => {
    expect(CONTRACTS[3]).toHaveLength(3);
    expect(CONTRACTS[3].every((m) => m.type === 'group' && m.size === 3)).toBe(true);
  });

  it('round 5: two groups of 3 + one sequence of 4', () => {
    const groups = CONTRACTS[4].filter((m) => m.type === 'group');
    const seqs = CONTRACTS[4].filter((m) => m.type === 'sequence');
    expect(groups).toHaveLength(2);
    expect(seqs).toHaveLength(1);
  });

  it('round 6: one group of 3 + two sequences of 4', () => {
    const groups = CONTRACTS[5].filter((m) => m.type === 'group');
    const seqs = CONTRACTS[5].filter((m) => m.type === 'sequence');
    expect(groups).toHaveLength(1);
    expect(seqs).toHaveLength(2);
  });

  it('round 7: three sequences of 4', () => {
    expect(CONTRACTS[6]).toHaveLength(3);
    expect(CONTRACTS[6].every((m) => m.type === 'sequence' && m.size === 4)).toBe(true);
  });
});

describe('contractSize', () => {
  it('round 1 is 6', () => expect(contractSize(CONTRACTS[0])).toBe(6));
  it('round 2 is 7', () => expect(contractSize(CONTRACTS[1])).toBe(7));
  it('round 3 is 8', () => expect(contractSize(CONTRACTS[2])).toBe(8));
  it('round 4 is 9', () => expect(contractSize(CONTRACTS[3])).toBe(9));
  it('round 5 is 10', () => expect(contractSize(CONTRACTS[4])).toBe(10));
  it('round 6 is 11', () => expect(contractSize(CONTRACTS[5])).toBe(11));
  it('round 7 is 12 — requires at least one May I', () => expect(contractSize(CONTRACTS[6])).toBe(12));

  it('contract sizes are non-decreasing', () => {
    const sizes = CONTRACTS.map(contractSize);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
  });
});
