export interface UsageEvent {
  id: string; // Composite PK: txHash-logIndex
  txHash: string;
  blockNumber: string;
  blockTimestamp: string;
  orderTime: string;
  day: number;
  relayerId: string;
  eventId: string;
  nftIndex: string;
  getUsed: string;
  type: "NEW_EVENT" | "MINT" | "INVALIDATE" | "SCAN" | "CLAIM";
  latitude: string;
  longitude: string;
}

export interface Message {
  message: string;
}
