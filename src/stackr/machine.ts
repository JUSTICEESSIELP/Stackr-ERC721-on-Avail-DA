import { StateMachine } from "@stackr/sdk/machine";

import * as genesisState from "../../genesis-state.json";
import { NFTState } from "./state";
import { transitions } from "./transitions";

const machine = new StateMachine({
  id: "counter",
  stateClass: NFTState,
  initialState: genesisState.state,
  on: transitions,
});

export { machine };
