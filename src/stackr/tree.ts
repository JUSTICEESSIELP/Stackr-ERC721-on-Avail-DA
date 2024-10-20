import { MerkleTree } from "merkletreejs";

import { constructERC721Tree } from "./custom/erc721";
import { NFT } from "./state";
import { solidityPackedKeccak256 } from "ethers";

export const constructTree = (state: NFT): MerkleTree => {
  return new MerkleTree([
    constructERC721Tree(state.erc721).getHexRoot(),
    solidityPackedKeccak256(["string"], [state.admin]),
  ]);
};
