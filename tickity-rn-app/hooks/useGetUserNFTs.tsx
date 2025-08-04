import getEvents from "@/constants/subgraph";
import { chain, client } from "@/constants/thirdweb";
import { useQuery } from "@tanstack/react-query";
import { getContract, readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

interface UserNFT {
  ticketId: string;
  ticketType: string;
  eventName: string;
  eventImage?: string;
  eventAddress: string;
  purchaseDate?: string;
  tokenURI?: string;
  metadata?: any;
}

const useGetUserNFTs = () => {
  const account = useActiveAccount();

  const {
    data: allNFTs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userNFTs", account?.address],
    queryFn: async () => {
      try {
        if (!account?.address) {
          return [];
        }

        const events = await getEvents();
        const nfts: UserNFT[] = [];

        // For each event, check if user has tickets
        for (const event of events.eventCreateds) {
          try {
            const eventContract = getContract({
              client: client,
              address: event.eventAddress,
              chain: chain,
            });

            // Get user's tickets for this event
            const userTickets = await readContract({
              contract: eventContract,
              method:
                "function getUserTickets(address user) external view returns (uint256[] memory)",
              params: [account.address],
            });

            if (userTickets && userTickets.length > 0) {
              // For each ticket, get the actual NFT data
              for (let i = 0; i < userTickets.length; i++) {
                try {
                  const ticketId = userTickets[i].toString();

                  // Get ticket type from the contract
                  let ticketType = "Standard";
                  try {
                    const ticketTypeResult = await readContract({
                      contract: eventContract,
                      method:
                        "function getTicketType(uint256 tokenId) external view returns (uint256)",
                      params: [BigInt(ticketId)],
                    });

                    // Map ticket type index to readable name
                    const typeIndex = Number(ticketTypeResult);
                    if (typeIndex === 0) ticketType = "Standard";
                    else if (typeIndex === 1) ticketType = "Premium";
                    else if (typeIndex === 2) ticketType = "VIP";
                    else ticketType = `Type ${typeIndex}`;
                  } catch (typeError) {
                    console.log(
                      `Could not get ticket type for ${ticketId}, using default`
                    );
                  }

                  // Try to get token URI for metadata
                  let tokenURI = "";
                  let metadata = null;
                  try {
                    tokenURI = await readContract({
                      contract: eventContract,
                      method:
                        "function tokenURI(uint256 tokenId) external view returns (string)",
                      params: [BigInt(ticketId)],
                    });

                    if (tokenURI) {
                      // Fetch metadata if URI is available
                      try {
                        const response = await fetch(tokenURI);
                        metadata = await response.json();
                      } catch (metadataError) {
                        console.log(`Could not fetch metadata for ${ticketId}`);
                      }
                    }
                  } catch (uriError) {
                    console.log(`Could not get token URI for ${ticketId}`);
                  }

                  nfts.push({
                    ticketId,
                    ticketType,
                    eventName: event.name,
                    eventImage: event.image,
                    eventAddress: event.eventAddress,
                    purchaseDate: event.createdAt,
                    tokenURI,
                    metadata,
                  });
                } catch (ticketError) {
                  console.error(
                    `Error processing ticket ${i} for event ${event.name}:`,
                    ticketError
                  );
                }
              }
            }
          } catch (error) {
            console.error(
              `Error fetching tickets for event ${event.eventAddress}:`,
              error
            );
          }
        }

        return nfts;
      } catch (error) {
        console.error("Error fetching user NFTs:", error);
        return [];
      }
    },
    enabled: !!account?.address,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    nfts: allNFTs || [],
    hasNFTs: (allNFTs && allNFTs.length > 0) || false,
    nftCount: allNFTs?.length || 0,
    isLoading,
    error,
    refetch,
  };
};

export default useGetUserNFTs;
