import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CONTRACT_ADDRESSES,
  EVENT_FACTORY_ABI,
  EVENT_ABI,
} from "../config/thirdweb";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { getContract, prepareContractCall, readContract } from "thirdweb";
import { client } from "../config/thirdweb";
import { etherlinkTestnet } from "thirdweb/chains";

export interface TicketType {
  name: string;
  price: string;
  quantity: number;
  sold: number;
}

export interface Event {
  id: number;
  address: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  location: string;
  totalTickets: number;
  soldTickets: number;
  ticketTypes: TicketType[];
  organizer: string;
  isActive: boolean;
}

export interface CreateEventData {
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  location: string;
  totalTickets: number;
  ticketTypes: TicketType[];
}

export const useEvents = () => {
  const account = useActiveAccount();
  const address = account?.address;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔧 useEvents hook initialized", { address });

  // Memoize the event factory contract to prevent recreation on every render
  const eventFactoryContract = useMemo(() => {
    console.log("📋 Creating event factory contract...");
    return getContract({
      client,
      address: CONTRACT_ADDRESSES.EVENT_FACTORY,
      chain: etherlinkTestnet,
    });
  }, []); // Empty dependency array - contract never changes

  console.log("📋 Event factory contract ready", {
    factoryAddress: CONTRACT_ADDRESSES.EVENT_FACTORY,
    chain: etherlinkTestnet.name,
  });

  // Read event count from factory
  const { data: eventCount } = useReadContract({
    contract: eventFactoryContract,
    method: "function eventCount() view returns (uint256)",
  });

  console.log("📊 Event count from contract:", eventCount?.toString());

  // Read organizer events
  const { data: organizerEvents } = useReadContract({
    contract: eventFactoryContract,
    method:
      "function getOrganizerEvents(address organizer) view returns (uint256[])",
    params: [address || "0x0000000000000000000000000000000000000000"],
  });

  console.log("👤 Organizer events for address:", {
    address,
    organizerEvents: organizerEvents?.map((e) => e.toString()),
  });

  // Setup transaction sending
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  // Fetch all events - memoized to prevent infinite loops
  const fetchEvents = useCallback(async () => {
    console.log("🔄 Starting fetchEvents...");

    if (!eventCount || Number(eventCount) === 0) {
      console.log("📭 No events found, setting empty array");
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventsData: Event[] = [];
      const count = Number(eventCount);
      console.log(`🔍 Fetching ${count} events from factory...`);

      for (let i = 1; i <= count; i++) {
        try {
          console.log(`📋 Fetching event ${i}/${count}...`);

          // Get event address from factory using readContract
          const eventAddress = await readContract({
            contract: eventFactoryContract,
            method:
              "function getEventAddress(uint256 eventId) view returns (address)",
            params: [BigInt(i)],
          });

          console.log(`📍 Event ${i} address:`, eventAddress);

          if (
            !eventAddress ||
            eventAddress === "0x0000000000000000000000000000000000000000"
          ) {
            console.log(`⚠️ Event ${i} has invalid address, skipping`);
            continue;
          }

          // Get the event contract
          const eventContract = getContract({
            client,
            address: eventAddress,
            chain: etherlinkTestnet,
          });

          console.log(`📄 Reading event ${i} details...`);

          // Read event details using readContract
          const [
            name,
            description,
            startTime,
            endTime,
            location,
            totalTickets,
            soldTickets,
            organizer,
            isActive,
          ] = await Promise.all([
            readContract({
              contract: eventContract,
              method: "function name() view returns (string)",
            }),
            readContract({
              contract: eventContract,
              method: "function description() view returns (string)",
            }),
            readContract({
              contract: eventContract,
              method: "function startTime() view returns (uint256)",
            }),
            readContract({
              contract: eventContract,
              method: "function endTime() view returns (uint256)",
            }),
            readContract({
              contract: eventContract,
              method: "function location() view returns (string)",
            }),
            readContract({
              contract: eventContract,
              method: "function totalTickets() view returns (uint256)",
            }),
            readContract({
              contract: eventContract,
              method: "function soldTickets() view returns (uint256)",
            }),
            readContract({
              contract: eventContract,
              method: "function organizer() view returns (address)",
            }),
            readContract({
              contract: eventContract,
              method: "function isActive() view returns (bool)",
            }),
          ]);

          console.log(`✅ Event ${i} details loaded:`, {
            name,
            description: description?.substring(0, 50) + "...",
            startTime: startTime?.toString(),
            endTime: endTime?.toString(),
            location,
            totalTickets: totalTickets?.toString(),
            soldTickets: soldTickets?.toString(),
            organizer,
            isActive,
          });

          // Fetch ticket types
          const ticketTypes: TicketType[] = [];
          // TODO: Implement ticket types reading based on your contract structure

          eventsData.push({
            id: i,
            address: eventAddress,
            name: name || "",
            description: description || "",
            startTime: Number(startTime) || 0,
            endTime: Number(endTime) || 0,
            location: location || "",
            totalTickets: Number(totalTickets) || 0,
            soldTickets: Number(soldTickets) || 0,
            ticketTypes,
            organizer: organizer || "",
            isActive: isActive || false,
          });
        } catch (err) {
          console.error(`❌ Error fetching event ${i}:`, err);
        }
      }

      console.log(
        `🎉 Successfully loaded ${eventsData.length} events:`,
        eventsData
      );
      setEvents(eventsData);
    } catch (err) {
      console.error("💥 Error fetching events:", err);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [eventCount, eventFactoryContract]); // Only depend on eventCount and contract

  // Create new event
  const createNewEvent = useCallback(
    async (eventData: CreateEventData) => {
      console.log("🎫 Creating new event:", eventData);

      if (!address) {
        console.error("❌ Wallet not connected");
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        const {
          name,
          description,
          startTime,
          endTime,
          location,
          totalTickets,
          ticketTypes,
        } = eventData;

        const ticketTypeNames = ticketTypes.map((t) => t.name);
        const ticketPrices = ticketTypes.map((t) => BigInt(t.price));
        const ticketQuantities = ticketTypes.map((t) => BigInt(t.quantity));

        console.log("📝 Preparing transaction with params:", {
          name,
          description: description.substring(0, 50) + "...",
          startTime,
          endTime,
          location,
          totalTickets,
          ticketTypeNames,
          ticketPrices: ticketPrices.map((p) => p.toString()),
          ticketQuantities: ticketQuantities.map((q) => q.toString()),
          nftContract: CONTRACT_ADDRESSES.TICKITY_NFT,
        });

        const transaction = prepareContractCall({
          contract: eventFactoryContract,
          method:
            "function createEvent(string name, string description, uint256 startTime, uint256 endTime, string location, uint256 totalTickets, string[] ticketTypeNames, uint256[] ticketPrices, uint256[] ticketQuantities, address nftContract)",
          params: [
            name,
            description,
            BigInt(startTime),
            BigInt(endTime),
            location,
            BigInt(totalTickets),
            ticketTypeNames,
            ticketPrices,
            ticketQuantities,
            CONTRACT_ADDRESSES.TICKITY_NFT,
          ],
        });

        console.log("🚀 Sending transaction...");

        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("✅ Event created successfully:", result);
            // Refresh events after creation
            fetchEvents();
          },
          onError: (error) => {
            console.error("❌ Error creating event:", error);
            setError("Failed to create event");
          },
        });
      } catch (err) {
        console.error("💥 Error preparing transaction:", err);
        setError("Failed to create event");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, eventFactoryContract, sendTransaction, fetchEvents]
  );

  // Get events by organizer
  const getOrganizerEvents = useCallback(
    async (organizerAddress: string) => {
      console.log("👤 Getting events for organizer:", organizerAddress);

      if (!organizerEvents) {
        console.log("📭 No organizer events found");
        return [];
      }

      const filteredEvents = events.filter((event) =>
        organizerEvents.includes(BigInt(event.id))
      );

      console.log(`📋 Found ${filteredEvents.length} events for organizer`);
      return filteredEvents;
    },
    [events, organizerEvents]
  );

  // Purchase ticket
  const purchaseTicket = useCallback(
    async (eventAddress: string, ticketTypeIndex: number, price: string) => {
      console.log("🎟️ Purchasing ticket:", {
        eventAddress,
        ticketTypeIndex,
        price,
      });

      try {
        const eventContract = getContract({
          client,
          address: eventAddress,
          chain: etherlinkTestnet,
        });

        const transaction = prepareContractCall({
          contract: eventContract,
          method: "function purchaseTicket(uint256 ticketTypeIndex)",
          params: [BigInt(ticketTypeIndex)],
          value: BigInt(price),
        });

        console.log("🚀 Sending ticket purchase transaction...");

        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("✅ Ticket purchased successfully:", result);
            fetchEvents(); // Refresh events
          },
          onError: (error) => {
            console.error("❌ Error purchasing ticket:", error);
          },
        });

        return transaction;
      } catch (err) {
        console.error("💥 Error purchasing ticket:", err);
        throw err;
      }
    },
    [sendTransaction, fetchEvents]
  );

  // Use ticket
  const useTicket = useCallback(
    async (eventAddress: string, tokenId: number) => {
      console.log("🎫 Using ticket:", { eventAddress, tokenId });

      try {
        const eventContract = getContract({
          client,
          address: eventAddress,
          chain: etherlinkTestnet,
        });

        const transaction = prepareContractCall({
          contract: eventContract,
          method: "function useTicket(uint256 tokenId)",
          params: [BigInt(tokenId)],
        });

        console.log("🚀 Sending use ticket transaction...");

        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("✅ Ticket used successfully:", result);
          },
          onError: (error) => {
            console.error("❌ Error using ticket:", error);
          },
        });

        return transaction;
      } catch (err) {
        console.error("💥 Error using ticket:", err);
        throw err;
      }
    },
    [sendTransaction]
  );

  // Cancel event
  const cancelEvent = useCallback(
    async (eventAddress: string) => {
      console.log("❌ Canceling event:", eventAddress);

      try {
        const eventContract = getContract({
          client,
          address: eventAddress,
          chain: etherlinkTestnet,
        });

        const transaction = prepareContractCall({
          contract: eventContract,
          method: "function cancelEvent()",
          params: [],
        });

        console.log("🚀 Sending cancel event transaction...");

        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("✅ Event canceled successfully:", result);
            fetchEvents(); // Refresh events
          },
          onError: (error) => {
            console.error("❌ Error canceling event:", error);
          },
        });

        return transaction;
      } catch (err) {
        console.error("💥 Error canceling event:", err);
        throw err;
      }
    },
    [sendTransaction, fetchEvents]
  );

  // Withdraw funds
  const withdrawFunds = useCallback(
    async (eventAddress: string) => {
      console.log("💰 Withdrawing funds from event:", eventAddress);

      try {
        const eventContract = getContract({
          client,
          address: eventAddress,
          chain: etherlinkTestnet,
        });

        const transaction = prepareContractCall({
          contract: eventContract,
          method: "function withdrawFunds()",
          params: [],
        });

        console.log("🚀 Sending withdraw funds transaction...");

        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("✅ Funds withdrawn successfully:", result);
          },
          onError: (error) => {
            console.error("❌ Error withdrawing funds:", error);
          },
        });

        return transaction;
      } catch (err) {
        console.error("💥 Error withdrawing funds:", err);
        throw err;
      }
    },
    [sendTransaction]
  );

  // Fetch events only when eventCount changes, not on every render
  useEffect(() => {
    console.log(
      "🔄 useEffect triggered - eventCount changed:",
      eventCount?.toString()
    );
    if (eventCount !== undefined) {
      fetchEvents();
    }
  }, [eventCount]); // Only depend on eventCount, not fetchEvents

  console.log("📊 useEvents hook state:", {
    eventsCount: events.length,
    loading,
    error,
    address,
    eventCount: eventCount?.toString(),
  });

  return {
    events,
    loading: loading || isPending,
    error,
    createNewEvent,
    getOrganizerEvents,
    purchaseTicket,
    useTicket,
    cancelEvent,
    withdrawFunds,
    refreshEvents: fetchEvents,
  };
};
