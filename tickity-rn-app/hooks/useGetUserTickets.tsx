import { chain, client } from "@/constants/thirdweb";
import { useQuery } from "@tanstack/react-query";
import { getContract, readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

interface UserTicket {
  ticketId: string;
  ticketType: string;
  purchaseDate: string;
  // Add other fields as needed based on your contract
}

const useGetUserTickets = (eventAddress?: string) => {
  const account = useActiveAccount();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userTickets", account?.address, eventAddress],
    queryFn: async () => {
      if (!account?.address || !eventAddress) {
        throw new Error("No wallet connected or event address provided");
      }

      const eventContract = getContract({
        client,
        address: eventAddress,
        chain: chain,
      });

      try {
        const userTickets = await readContract({
          contract: eventContract,
          method:
            "function getUserTickets(address user) external view returns (uint256[] memory)",
          params: [account.address],
        });

        console.log(userTickets, "userTickets");

        // Get ticket types for each ticket ID
        const ticketDetails = [];
        if (userTickets && Array.isArray(userTickets)) {
          for (const ticketId of userTickets) {
            try {
              // Validate ticket ID before calling getTicketType
              if (!ticketId || ticketId.toString() === "0") {
                console.warn(`Skipping invalid ticket ID: ${ticketId}`);
                continue;
              }

              // Try to get the ticket type using the token ID
              // If this method doesn't exist, we'll fall back to a default approach
              let ticketTypeIndex = "0"; // Default to first ticket type

              try {
                // We need to determine the ticket type index for this specific ticket ID
                // Since we don't have a direct method to get ticket type from ticket ID,
                // we'll try a different approach - maybe the ticket ID itself contains the type info
                // or we need to use a different method

                // For now, let's assume ticket type 0 for all tickets
                // You might need to implement a different strategy based on your contract structure
                ticketTypeIndex = "0"; // Default to first ticket type

                // If you have a method to get ticket type from ticket ID, you can uncomment this:
                /*
                const ticketTypeInfo = await readContract({
                  contract: eventContract,
                  method:
                    "function getTicketTypeFromTokenId(uint256 tokenId) external view returns (uint256)",
                  params: [ticketId],
                });
                
                if (ticketTypeInfo !== undefined && ticketTypeInfo !== null) {
                  ticketTypeIndex = ticketTypeInfo.toString();
                }
                */
              } catch (methodError) {
                console.warn(
                  `Error determining ticket type for ticket ${ticketId}, using default type 0`
                );
                // If the method doesn't exist or fails, we'll use the default type
              }

              ticketDetails.push({
                ticketId: ticketId.toString(),
                ticketType: ticketTypeIndex,
              });
            } catch (error) {
              console.error(`Error processing ticket ${ticketId}:`, error);

              // Check if it's an "Invalid index" error or similar
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              if (
                errorMessage.includes("Invalid index") ||
                errorMessage.includes("execution reverted")
              ) {
                console.warn(
                  `Ticket ID ${ticketId} appears to be invalid, skipping...`
                );
                continue; // Skip this ticket instead of adding with default type
              }

              // For other errors, add with default type as fallback
              ticketDetails.push({
                ticketId: ticketId.toString(),
                ticketType: "0", // Default to first ticket type
              });
            }
          }
        }

        return ticketDetails;
      } catch (error) {
        console.error("Error fetching user tickets:", error);
        return [];
      }
    },
    enabled: !!account?.address && !!eventAddress,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Group tickets by type
  const ticketsByType =
    data?.reduce((acc, ticket) => {
      const type = ticket.ticketType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(ticket);
      return acc;
    }, {} as Record<string, any[]>) || {};

  return {
    tickets: data || [],
    ticketsByType,
    hasTickets: (data && data.length > 0) || false,
    ticketCount: data?.length || 0,
    isLoading,
    error,
    refetch,
  };
};

export default useGetUserTickets;
