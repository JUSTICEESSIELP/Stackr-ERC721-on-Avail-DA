import { SolidityType, REQUIRE } from "@stackr/sdk/machine";
import { ZeroAddress } from "ethers/constants";

import { ERC721State } from "../state";

export const approve = ERC721State.STF({
  schema: {
    spender: SolidityType.ADDRESS,
    id: SolidityType.UINT,
  },
  handler: ({ state, emit, inputs, msgSender }) => {
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
  },
});

export const setApprovalForAll = ERC721State.STF({
  schema: {
    operator: SolidityType.ADDRESS,
    approved: SolidityType.BOOL,
  },
  handler: ({ state, emit, inputs, msgSender }) => {
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
  },
});

export const transferFrom = ERC721State.STF({
  schema: {
    from: SolidityType.ADDRESS,
    to: SolidityType.ADDRESS,
    id: SolidityType.UINT,
  },
  handler: ({ state, emit, inputs, msgSender }) => {
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
  },
});

export const _mint = ERC721State.STF({
  schema: {
    to: SolidityType.ADDRESS,
    id: SolidityType.UINT,
  },
  handler: ({ state, emit, inputs }) => {
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
  },
});

export const _burn = ERC721State.STF({
  schema: {
    id: SolidityType.UINT,
  },
  handler: ({ state, emit, inputs }) => {
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
  },
});
