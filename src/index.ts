import { startSocket } from "./socket";
import { startContracts } from "./contracts";
import { startListeners } from "./listeners";

const { NODE_URI } = process.env;
if (!NODE_URI) {
  console.error("NODE_URI not set");
  process.exit(1);
}

const broadcast = startSocket(8080);
const { nftContract, eventMetadataContract } = startContracts(NODE_URI);
startListeners(nftContract, eventMetadataContract, broadcast);
