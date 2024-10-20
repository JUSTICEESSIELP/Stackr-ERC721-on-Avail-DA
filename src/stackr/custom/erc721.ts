import { SolidityType, REQUIRE, State, SchemaType } from "@stackr/sdk/machine";
import { ZeroAddress } from "ethers/constants";
import { transition } from "./lib";
import MerkleTree from "merkletreejs";
import { solidityPackedKeccak256 } from "ethers";

export type ERC721Storage = {
  name: string;
  symbol: string;
  ownerOf: Record<string, string>;
  balanceOf: Record<string, number>;
  getApproved: Record<number, string>;
  isApprovedForAll: Record<string, string[]>;
};

export type ERC721State = State<ERC721Storage>;

export const approveSchema = {
  spender: SolidityType.ADDRESS,
  id: SolidityType.UINT,
} satisfies SchemaType;

export const approve = transition<ERC721State, typeof approveSchema>(
  approveSchema,
  ({ state, emit, inputs, msgSender }) => {
    const owner = state.ownerOf[inputs.id];

    REQUIRE(
      msgSender === owner && state.isApprovedForAll[owner]?.includes(msgSender),
      "NOT_AUTHORIZED"
    );

    state.getApproved[inputs.id] = inputs.spender;

    emit({
      name: "Approval",
      value: {
        owner,
        spender: inputs.spender,
        id: inputs.id,
      },
    });
    return state;
  }
);

export const setApprovalForAllSchema = {
  operator: SolidityType.ADDRESS,
  approved: SolidityType.BOOL,
} satisfies SchemaType;

export const setApprovalForAll = transition<
  ERC721State,
  typeof setApprovalForAllSchema
>(setApprovalForAllSchema, ({ state, emit, inputs, msgSender }) => {
  const approved = new Set(state.isApprovedForAll[msgSender]);

  if (inputs.approved) {
    approved.add(inputs.operator);
  } else {
    approved.delete(inputs.operator);
  }

  state.isApprovedForAll[msgSender] = [...approved];

  emit({
    name: "Approval",
    value: {
      owner: msgSender,
      operator: inputs.operator,
      approved: inputs.approved,
    },
  });
  return state;
});

export const transferFromSchema = {
  from: SolidityType.ADDRESS,
  to: SolidityType.ADDRESS,
  id: SolidityType.UINT,
} satisfies SchemaType;

export const transferFrom = transition<ERC721State, typeof transferFromSchema>(
  transferFromSchema,
  ({ state, emit, inputs, msgSender }) => {
    REQUIRE(inputs.from === state.ownerOf[inputs.id], "WRONG_FROM");
    REQUIRE(inputs.to !== ZeroAddress, "INVALID_RECIPIENT");
    REQUIRE(
      msgSender === inputs.from ||
        state.isApprovedForAll[inputs.from]?.includes(msgSender) ||
        msgSender === state.getApproved[inputs.id],
      "NOT_AUTHORIZED"
    );

    state.balanceOf[inputs.from]--;
    state.balanceOf[inputs.to] = (state.balanceOf[inputs.to] ?? 0) + 1;

    delete state.getApproved[inputs.id];

    emit({
      name: "Transfer",
      value: {
        from: inputs.from,
        to: inputs.to,
        id: inputs.id,
      },
    });
    return state;
  }
);

export const _mintSchema = {
  to: SolidityType.ADDRESS,
  id: SolidityType.UINT,
} satisfies SchemaType;

export const _mint = transition<ERC721State, typeof _mintSchema>(
  _mintSchema,
  ({ state, emit, inputs }) => {
    REQUIRE(inputs.to !== ZeroAddress, "INVALID_RECIPIENT");
    REQUIRE(!state.ownerOf[inputs.id], "ALREADY_MINTED");

    state.balanceOf[inputs.to] = (state.balanceOf[inputs.to] ?? 0) + 1;
    state.ownerOf[inputs.id] = inputs.to;

    emit({
      name: "Transfer",
      value: {
        from: ZeroAddress,
        to: inputs.to,
        id: inputs.id,
      },
    });
    return state;
  }
);

export const _burnSchema = {
  id: SolidityType.UINT,
} satisfies SchemaType;

export const _burn = transition<ERC721State, typeof _burnSchema>(
  _burnSchema,
  ({ state, emit, inputs }) => {
    const owner = state.ownerOf[inputs.id];

    REQUIRE(owner !== ZeroAddress, "NOT_MINTED");

    state.balanceOf[owner]--;

    delete state.ownerOf[inputs.id];
    delete state.getApproved[inputs.id];

    emit({
      name: "Transfer",
      value: {
        from: owner,
        to: ZeroAddress,
        id: inputs.id,
      },
    });
    return state;
  }
);

export const constructERC721Tree = (state: ERC721Storage): MerkleTree => {
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
    solidityPackedKeccak256(["string"], [state.name]),
    solidityPackedKeccak256(["string"], [state.symbol]),
    new MerkleTree(ownerOfHashes).getHexRoot(),
    new MerkleTree(balanceOfHashes).getHexRoot(),
    new MerkleTree(getApprovedHashes).getHexRoot(),
    new MerkleTree(isApprovedForAllHashes).getHexRoot(),
  ]);
};
