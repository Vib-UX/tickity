import { USDT_CONTRACT_ADDRESS } from "@/constants/addresses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { etherlinkTestnet } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import { Chain, createWalletClient, erc20Abi, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const FAUCET_PRIVATE_KEY =
  "0x97f65f1edd6e09d66064555bea873ab627f4d7df59c2fea199a165596455a5c2";

const useGetUSDT = () => {
  const thirdwebAccount = useActiveAccount();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!thirdwebAccount?.address) {
        throw new Error("No wallet connected");
      }

      const account = privateKeyToAccount(FAUCET_PRIVATE_KEY);

      const viemClient = createWalletClient({
        account,
        chain: etherlinkTestnet as unknown as Chain,
        transport: http("https://rpc.ankr.com/etherlink_testnet"),
      });

      await viemClient.writeContract({
        account,
        abi: erc20Abi,
        chain: etherlinkTestnet as unknown as Chain,
        address: USDT_CONTRACT_ADDRESS,
        functionName: "transfer",
        args: [thirdwebAccount.address, BigInt(1000000)],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usdtBalance", thirdwebAccount?.address],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    getUsdt: mutation.mutate,
    getUsdtAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export default useGetUSDT;
