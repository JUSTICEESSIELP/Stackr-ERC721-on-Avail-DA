import { Domain } from "@stackr/sdk";
import { AllowedInputTypes, EIP712Types } from "@stackr/sdk/machine";
import { Wallet } from "ethers";

export const signMessage = async (
  wallet: Wallet,
  domain: Domain,
  types: EIP712Types,
  payload: { name: string; inputs: AllowedInputTypes }
) => {
  return await wallet.signTypedData(domain, types, payload);
};
