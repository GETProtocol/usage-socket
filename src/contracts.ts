import ethers from "ethers";
import logger from "./logger";
import {
  BaseGET__factory,
  EventMetadataStorage__factory,
  BaseGET,
  EventMetadataStorage,
} from "../types/ethers-contracts";

const NFT_CONTRACT_ADDRESS = "0xbce1b23c7544422f1E2208d29A6A3AA9fAbAB250";
const EVENT_METADATA_CONTRACT_ADDRESS = "0x08C2aF3F01A36AD9F274ccE77f6f77cf9aa1dfC9";

export const startContracts = (
  nodeUri: string
): { nftContract: BaseGET; eventMetadataContract: EventMetadataStorage } => {
  const provider = new ethers.providers.WebSocketProvider(nodeUri);

  logger.info("CONNECTED_TO_WEB3");

  return {
    nftContract: BaseGET__factory.connect(NFT_CONTRACT_ADDRESS, provider),
    eventMetadataContract: EventMetadataStorage__factory.connect(
      EVENT_METADATA_CONTRACT_ADDRESS,
      provider
    ),
  };
};
