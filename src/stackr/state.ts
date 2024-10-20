import { State } from "@stackr/sdk/machine";

import { constructTree } from "./tree";

export type ERC721Storage = {
  admin: string;
  name: string;
  symbol: string;
  ownerOf: Record<string, string>;
  balanceOf: Record<string, number>;
  getApproved: Record<number, string>;
  isApprovedForAll: Record<string, string[]>;
};

export class ERC721State extends State<ERC721Storage> {
  constructor(state: ERC721Storage) {
    super(state);
  }

  // Here since the state is simple and doesn't need wrapping, we skip the transformers to wrap and unwrap the state

  // transformer() {
  //   return {
  //     wrap: () => this.state,
  //     unwrap: (wrappedState: number) => wrappedState,
  //   };
  // }

  getRootHash() {
    return constructTree(this.state).getHexRoot();
  }
}
