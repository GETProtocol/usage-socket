import { ethers, utils } from "ethers";
import logger from "./logger";
import { IBroadcast } from "./socket";
import { BaseGET, EventMetadataStorage } from "../types/ethers-contracts";
import { UsageEvent } from "..";

type IBaseEvent = ethers.Event & {
  args: {
    orderTime: ethers.BigNumber;
    getUsed: ethers.BigNumber;
  };
};

type INftEvent = IBaseEvent & {
  args: {
    nftIndex: ethers.BigNumber;
  };
};

type IEventMetadataEvent = IBaseEvent & {
  args: {
    eventAddress: string;
  };
};

type IGetEvent = Pick<UsageEvent, "eventId" | "latitude" | "longitude" | "nftIndex">;

const getCommon = async (e: IBaseEvent) => {
  const timestamp = (await e.getBlock()).timestamp;
  return {
    id: `${e.transactionHash}-${e.logIndex}`,
    txHash: e.transactionHash,
    blockNumber: e.blockNumber.toString(),
    blockTimestamp: timestamp.toString(),
    day: timestamp / 86400,
    relayerId: e.address,
    orderTime: e.args.orderTime.toString(),
  };
};

const getFuelUsage = (e: IBaseEvent, type: UsageEvent["type"]) => ({
  getDebitedFromSilo: ["MINT"].includes(type) ? utils.formatEther(e.args.getUsed.toString()) : "0",
  getCreditedToDepot: ["INVALIDATE", "SCAN", "CHECK_IN"].includes(type)
    ? utils.formatEther(e.args.getUsed.toString())
    : "0",
});

export function startListeners(
  nftContract: BaseGET,
  eventMetadataContract: EventMetadataStorage,
  broadcast: IBroadcast
): void {
  async function getEventByNftIndex(e: INftEvent): Promise<IGetEvent> {
    const nftData = await nftContract.returnStructTicket(e.args.nftIndex);
    const event = await eventMetadataContract.getEventData(nftData.eventAddress);
    return {
      eventId: nftData.eventAddress,
      latitude: ethers.utils.parseBytes32String(event[5][0]),
      longitude: ethers.utils.parseBytes32String(event[5][1]),
      nftIndex: e.args.nftIndex.toString(),
    };
  }

  async function getEventByAddress(e: IEventMetadataEvent): Promise<IGetEvent> {
    const event = await eventMetadataContract.getEventData(e.args.eventAddress);
    return {
      eventId: e.args.eventAddress,
      latitude: ethers.utils.parseBytes32String(event[5][0]),
      longitude: ethers.utils.parseBytes32String(event[5][1]),
      nftIndex: "0",
    };
  }

  function abstractHandler<T extends INftEvent | IEventMetadataEvent>(
    type: UsageEvent["type"],
    getEvent: (e: T) => Promise<IGetEvent>
  ) {
    logger.info("ATTACHED_LISTENER", { type });
    return function (...args: Array<never | T>) {
      const e = args[args.length - 1];
      logger.info("RUNNING_HANDLER", { type, txHash: e.transactionHash });
      void Promise.all([getCommon(e), getEvent(e), getFuelUsage(e, type)]).then(
        ([common, event, fuelUsage]) => {
          broadcast({
            ...common,
            ...event,
            ...fuelUsage,
            type,
          });
        }
      );
    };
  }

  const primarySaleMint = abstractHandler<INftEvent>("MINT", getEventByNftIndex);
  const ticketInvalidated = abstractHandler<INftEvent>("INVALIDATE", getEventByNftIndex);
  const secondarySale = abstractHandler<INftEvent>("RESALE", getEventByNftIndex);
  const ticketScanned = abstractHandler<INftEvent>("SCAN", getEventByNftIndex);
  const nftClaimed = abstractHandler<INftEvent>("CLAIM", getEventByNftIndex);
  const newEventRegistered = abstractHandler<IEventMetadataEvent>("NEW_EVENT", getEventByAddress);

  nftContract.on("PrimarySaleMint", primarySaleMint);
  nftContract.on("TicketInvalidated", ticketInvalidated);
  nftContract.on("SecondarySale", secondarySale);
  nftContract.on("TicketScanned", ticketScanned);
  nftContract.on("NftClaimed", nftClaimed);
  eventMetadataContract.on("NewEventRegistered", newEventRegistered);
}
