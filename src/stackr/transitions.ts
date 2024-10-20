import { SolidityType, Transitions, REQUIRE } from "@stackr/sdk/machine";

import { ERC721State } from "./state";
import {
  _burn,
  _mint,
  approve,
  setApprovalForAll,
  transferFrom,
} from "./custom/erc721";
import { call } from "./custom/lib";

export const mint = ERC721State.STF({
  schema: {
    to: SolidityType.ADDRESS,
    id: SolidityType.UINT,
  },
  handler: (data) => {
    REQUIRE(data.msgSender === data.state.admin, "NOT_AUTHORIZED");
    return _mint.handler(data);
  },
});

export const burn = ERC721State.STF({
  schema: {
    id: SolidityType.UINT,
  },
  handler: (data) => {
    let { state } = data;
    const { inputs, msgSender } = data;
    const owner = state.ownerOf[inputs.id];

    REQUIRE(owner === msgSender, "NOT_AUTHORIZED");

    return call(_burn, data, state, { id: inputs.id });
  },
});

export const transitions: Transitions<ERC721State> = {
  approve,
  setApprovalForAll,
  transferFrom,
  mint,
  burn,
};
