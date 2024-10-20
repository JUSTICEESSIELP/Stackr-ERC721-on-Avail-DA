import { solidityPackedKeccak256 } from "ethers";
import { MerkleTree } from "merkletreejs";

import { ERC721Storage } from "./state";

export const constructTree = (state: ERC721Storage): MerkleTree => {
  const ownerOfHashes = Object.entries(state.ownerOf).map(([id, owner]) =>
    solidityPackedKeccak256(["uint256", "address"], [id, owner])
  );
  const balanceOfHashes = Object.entries(state.balanceOf).map(
    ([address, balance]) =>
      solidityPackedKeccak256(["address", "uint256"], [address, balance])
  );
  const getApprovedHashes = Object.entries(state.getApproved).map(
    ([id, spender]) =>
      solidityPackedKeccak256(["uint256", "address"], [id, spender])
  );
  const isApprovedForAllHashes = Object.entries(state.isApprovedForAll).map(
    ([spender, approved]) =>
      solidityPackedKeccak256(["address", "address[]"], [spender, approved])
  );

  return new MerkleTree([
    solidityPackedKeccak256(["string"], [state.admin]),
    solidityPackedKeccak256(["string"], [state.name]),
    solidityPackedKeccak256(["string"], [state.symbol]),
    new MerkleTree(ownerOfHashes).getHexRoot(),
    new MerkleTree(balanceOfHashes).getHexRoot(),
    new MerkleTree(getApprovedHashes).getHexRoot(),
    new MerkleTree(isApprovedForAllHashes).getHexRoot(),
  ]);
};
