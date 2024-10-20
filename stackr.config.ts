import { DA, KeyPurpose, SignatureScheme, StackrConfig } from "@stackr/sdk";
import dotenv from "dotenv";

dotenv.config();

const stackrConfig: StackrConfig = {
  isSandbox: true,
  sequencer: {
    blockSize: 16,
    blockTime: 10,
  },
  syncer: {
    vulcanRPC: process.env.VULCAN_RPC as string,
    L1RPC: process.env.L1_RPC as string,
  },
  operator: {
    accounts: [
      {
        privateKey: process.env.PRIVATE_KEY as string,
        purpose: KeyPurpose.BATCH,
        scheme: SignatureScheme.ECDSA,
      },
    ],
  },
  domain: {
    name: "Generative NFT MRU",
    version: "1",
    salt: "0x691ad008bcea736f03425604eb14d70cc4ff069fd8b1ba9aff00bb93d4b6d58f",
  },
  datastore: {
    type: "sqlite",
    uri: process.env.DATABASE_URI as string,
  },
  registryContract: process.env.REGISTRY_CONTRACT as string,
  preferredDA: DA.AVAIL,
  logLevel: "log",
};

export { stackrConfig };
