import { gql, request } from "graphql-request";
import { Event, EventResponse, EventResponseDetailed } from "../types/event";

export const SUBGRAPH_CLIENT =
  "https://api.goldsky.com/api/public/project_cmdg6ewng9h9q01xx749o70db/subgraphs/event-factory-poap/1.0.0/gn";

const eventCreateds = gql`
  {
    eventCreatedDetaileds {
      id
      name
      description
      contractId_
      createdAt
      block_number
      endTime
      eventAddress
      eventId
      location
      nftContract
      organizer
      startTime
      ticketPrices
      ticketQuantities
      ticketTypes
      timestamp_
      transactionHash_
    }
  }
`;

// Event details mapping for enhancing API response
const eventDetailsMap: Record<string, Pick<Event, "image">> = {
  "1": {
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
  },
  "2": {
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  },
  "3": {
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
  },
  "4": {
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
  },
  "5": {
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
  },
  "6": {
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
  },
  "7": {
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
  },
};

const getEvents = async () => {
  try {
    // Make actual API call to get real events from subgraph
    const response = (await request(
      SUBGRAPH_CLIENT,
      eventCreateds
    )) as EventResponseDetailed;

    // Enhance the API response with additional details
    const enhancedEvents = response.eventCreatedDetaileds.map(
      (event: EventResponse) => {
        const eventId = event.eventId;
        const image = eventDetailsMap[eventId]
          ? eventDetailsMap[eventId].image
          : "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop";

        return {
          ...event,
          image,
          ticketTypes: event.ticketTypes.split(","),
          ticketQuantities: event.ticketQuantities.split(","),
          ticketPrices: event.ticketPrices.split(","),
          organizer: event.eventAddress, // Use eventAddress as organizer
        };
      }
    );

    return {
      eventCreateds: enhancedEvents,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    // Fallback to empty array if API fails
    return {
      eventCreateds: [],
    };
  }
};

export default getEvents;
