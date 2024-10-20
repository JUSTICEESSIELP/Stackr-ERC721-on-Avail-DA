import { SolidityType, Transitions } from "@stackr/sdk/machine";

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
    if (data.msgSender !== data.state.admin) {
      throw "NOT_AUTHORIZED";
    }

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

    if (owner !== msgSender) {
      throw "NOT_AUTHORIZED";
    }

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
