import { State } from "@stackr/sdk/machine";

import { constructTree } from "./tree";
import { ERC721Storage } from "./custom/erc721";

export type NFT = {
  erc721: ERC721Storage;
  admin: string;
};

export class NFTState extends State<NFT> {
  constructor(state: NFT) {
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
