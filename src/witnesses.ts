import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, Witnesses } from '../contracts/managed/hello-world/contract/index.js';

export type PrivateState = {
  readonly age: bigint;
};

export const witnesses: Witnesses<PrivateState> = {
  userAge: ({
    privateState,
  }: WitnessContext<Ledger, PrivateState>): [PrivateState, bigint] => {
    return [privateState, privateState.age];
  },
};
