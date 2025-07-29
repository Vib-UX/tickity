export interface EventResponse {
  id: string;
  name: string;
  description: string;
  contractId_: string;
  createdAt: string;
  block_number: string;
  endTime: string;
  eventAddress: string;
  eventId: string;
  location: string;
  nftContract: string;
  organizer: string;
  image: string;
  startTime: string;
  ticketPrices: string;
  ticketQuantities: string;
  ticketTypes: string;
  timestamp_: string;
  transactionHash_: string;
}
export interface Event {
  id: string;
  name: string;
  description: string;
  contractId_: string;
  createdAt: string;
  block_number: string;
  endTime: string;
  eventAddress: string;
  eventId: string;
  location: string;
  nftContract: string;
  organizer: string;
  image: string;
  startTime: string;
  ticketPrices: string[];
  ticketQuantities: string[];
  ticketTypes: string[];
  timestamp_: string;
  transactionHash_: string;
}

export interface EventResponseDetailed {
  eventCreatedDetaileds: EventResponse[];
}
export interface EventsData {
  eventCreatedDetaileds: Event[];
}

export interface TicketPurchaseParams {
  eventId: string;
  quantity: number;
  price: string;
}
