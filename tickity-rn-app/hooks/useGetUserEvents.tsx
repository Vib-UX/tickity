import getEvents from "@/constants/subgraph";
import { chain, client } from "@/constants/thirdweb";
import { Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { getContract, readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

export interface EventWithTickets {
  event: Event;
  userTickets: readonly bigint[];
  hasTickets: boolean;
  ticketCount: number;
}

const useGetUserEvents = () => {
  const account = useActiveAccount();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userEvents", account?.address],
    queryFn: async () => {
      if (!account) {
        throw new Error("No wallet connected");
      }

      const events = await getEvents();
      const eventsWithTickets: EventWithTickets[] = [];

      for (const event of events.eventCreateds) {
        try {
          const eventContract = getContract({
            client: client,
            address: event.eventAddress,
            chain: chain,
          });

          const userTickets = await readContract({
            contract: eventContract,
            method:
              "function getUserTickets(address user) external view returns (uint256[] memory)",
            params: [account.address],
          });

          const ticketCount = userTickets ? userTickets.length : 0;
          const hasTickets = ticketCount > 0;

          // Only add events where user has tickets
          if (hasTickets) {
            eventsWithTickets.push({
              event,
              userTickets: userTickets || [],
              hasTickets,
              ticketCount,
            });
          }
        } catch (error) {
          console.error(
            `Error fetching tickets for event ${event.eventAddress}:`,
            error
          );
          // Don't add events with errors since they have no tickets
        }
      }

      console.log("events with tickets", eventsWithTickets.length);
      return {
        events: eventsWithTickets,
        totalEvents: eventsWithTickets.length,
      };
    },
    enabled: !!account?.address,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data, isLoading, error, refetch };
};

export default useGetUserEvents;
