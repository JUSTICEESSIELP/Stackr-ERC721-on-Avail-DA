import { ActionConfirmationStatus } from "@stackr/sdk";
import { Wallet } from "ethers";

import { mru } from "./stackr/mru.ts";
import { signMessage } from "./utils.ts";

const main = async () => {
  const owner = new Wallet(process.env.PRIVATE_KEY as string);
  const user = Wallet.createRandom();

  const inputs = { to: user.address, id: 1 };
  const name = "mint";
  const domain = mru.config.domain;
  const types = mru.getStfSchemaMap()[name];
  const signature = await signMessage(owner, domain, types, { name, inputs });
  const incrementActionParams = {
    name,
    inputs,
    signature,
    msgSender: owner.address,
  };

  const ack = await mru.submitAction(incrementActionParams);
  console.log(ack.hash);

  // leverage the ack to wait for C1 and access logs & error from STF execution
  const { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
  console.log({ logs, errors });
};

main();
