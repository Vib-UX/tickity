export interface Event {
  id: string;
  transactionHash_: string;
  blockNumber?: string;
  blockTimestamp?: string;
  eventName?: string;
  eventDescription?: string;
  eventDate?: string;
  eventLocation?: string;
  ticketPrice?: string;
  maxTickets?: string;
  organizer?: string;
  image?: string;
  title?: string;
  description?: string;
  date?: string;
  eventAddress?: string;
  eventId: string;
}

export interface EventsData {
  eventCreateds: Event[];
}

export interface TicketPurchaseParams {
  eventId: string;
  quantity: number;
  price: string;
}
