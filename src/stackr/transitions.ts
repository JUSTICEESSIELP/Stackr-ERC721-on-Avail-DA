import {
  SolidityType,
  Transitions,
  REQUIRE,
  Transition,
  SchemaType,
} from "@stackr/sdk/machine";

import { NFTState } from "./state";
import {
  _burn,
  _mint,
  approve,
  ERC721State,
  setApprovalForAll,
  transferFrom,
} from "./custom/erc721";
import { call } from "./custom/lib";

export const mint = NFTState.STF({
  schema: {
    to: SolidityType.ADDRESS,
    id: SolidityType.UINT,
  },
  handler: (data) => {
    REQUIRE(data.msgSender === data.state.admin, "NOT_AUTHORIZED");

    let { state } = data;
    state.erc721 = call(_mint, data, state.erc721, data.inputs);
    return state;
  },
});

export const burn = NFTState.STF({
  schema: {
    id: SolidityType.UINT,
  },
  handler: (data) => {
    let { state } = data;
    const { inputs, msgSender } = data;
    const owner = state.erc721.ownerOf[inputs.id];

    REQUIRE(owner === msgSender, "NOT_AUTHORIZED");

    state.erc721 = call(_burn, data, state.erc721, { id: inputs.id });
    return state;
  },
});

// TODO: Make this generic for lib
const proxy = <InputSchemaType extends SchemaType>(
  transition: Transition<ERC721State, InputSchemaType>
): Transition<NFTState, InputSchemaType> => {
  return NFTState.STF({
    schema: transition.schema,
    handler: (data) => {
      let { state } = data;
      const { inputs } = data;

      // TODO: Remove the any, but it's too late for this type stuff, lost enough time already
      state.erc721 = call(transition, data, state.erc721, inputs as any);
      return state;
    },
  });
};

export const transitions: Transitions<NFTState> = {
  approve: proxy(approve),
  setApprovalForAll: proxy(setApprovalForAll),
  transferFrom: proxy(transferFrom),
  mint,
  burn,
};
