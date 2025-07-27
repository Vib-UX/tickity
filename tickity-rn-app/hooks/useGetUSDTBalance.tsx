import { USDT_CONTRACT_ADDRESS } from "@/constants/addresses";
import { chain, client } from "@/constants/thirdweb";
import { useQuery } from "@tanstack/react-query";
import { getContract, readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

// USDT contract address (you may need to update this for your specific network)

const useGetUSDTBalance = () => {
  const account = useActiveAccount();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["usdtBalance", account?.address],
    queryFn: async () => {
      if (!account?.address) {
        throw new Error("No wallet connected");
      }

      const usdtContract = getContract({
        client,
        address: USDT_CONTRACT_ADDRESS,
        chain: chain,
      });

      const balance = await readContract({
        contract: usdtContract,
        method: "function balanceOf(address) external view returns (uint256)",
        params: [account.address],
      });

      return balance;
    },
    enabled: !!account?.address,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    balance: data || BigInt(0),
    isLoading,
    error,
    refetch,
  };
};

export default useGetUSDTBalance;
