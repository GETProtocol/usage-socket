import ethers from "ethers";
import logger from "./logger";
import {
  NFT__factory,
  EventMetadata__factory,
  NFT,
  EventMetadata,
} from "../types/ethers-contracts";

const NFT_CONTRACT_ADDRESS = "0x308e44cA2153C61103b0DC67Fd038De650912b73";
const EVENT_METADATA_CONTRACT_ADDRESS = "0xcDA348fF8C175f305Ed8682003ec6F8743067f79";

export const startContracts = (
  nodeUri: string
): { nftContract: NFT; eventMetadataContract: EventMetadata } => {
  const provider = new ethers.providers.WebSocketProvider(nodeUri);

  logger.info("CONNECTED_TO_WEB3");

  return {
    nftContract: NFT__factory.connect(NFT_CONTRACT_ADDRESS, provider),
    eventMetadataContract: EventMetadata__factory.connect(
      EVENT_METADATA_CONTRACT_ADDRESS,
      provider
    ),
  };
};
