import { chain, client } from "@/constants/thirdweb";
import { useQuery } from "@tanstack/react-query";
import { getContract, readContract } from "thirdweb";

interface UseGetTicketPriceProps {
  eventId: string;
  enabled?: boolean;
}

const useGetTicketPrice = ({
  eventId,
  enabled = true,
}: UseGetTicketPriceProps) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ticketPrice", eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const id = eventId.split("-")[0];
      const eventContract = getContract({
        client,
        address: id,
        chain: chain,
      });

      const price = await readContract({
        contract: eventContract,
        method:
          "function ticketPrices(uint256) external view returns (uint256)",
        params: [BigInt(0)],
      });

      console.log(price, "price");
      return price;
    },
    enabled: enabled && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    ticketPrice: data || BigInt(0),
    isLoading,
    error,
    refetch,
  };
};

export default useGetTicketPrice;
