import { etherlinkTestnet } from "../config/thirdweb";

// Network configuration for MetaMask
export const etherlinkNetworkConfig = {
  chainId: `0x${etherlinkTestnet.chainId.toString(16)}`,
  chainName: etherlinkTestnet.name,
  nativeCurrency: etherlinkTestnet.nativeCurrency,
  rpcUrls: etherlinkTestnet.rpc,
  blockExplorerUrls: ["https://testnet-explorer.etherlink.com"],
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;
};

// Check if user is on the correct network
export const isCorrectNetwork = (chainId: number): boolean => {
  return chainId === etherlinkTestnet.chainId;
};

// Add Etherlink testnet to MetaMask
export const addEtherlinkToMetaMask = async (): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [etherlinkNetworkConfig],
    });
  } catch (error) {
    console.error("Failed to add network to MetaMask:", error);
    throw error;
  }
};

// Switch to Etherlink testnet
export const switchToEtherlink = async (): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: etherlinkNetworkConfig.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await addEtherlinkToMetaMask();
    } else {
      throw switchError;
    }
  }
};

// Get current network info
export const getCurrentNetwork = async (): Promise<{
  chainId: number;
  name: string;
} | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    return {
      chainId: parseInt(chainId, 16),
      name: etherlinkTestnet.name,
    };
  } catch (error) {
    console.error("Failed to get current network:", error);
    return null;
  }
};

// Request account access
export const requestAccountAccess = async (): Promise<string[]> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts;
  } catch (error) {
    console.error("Failed to request account access:", error);
    throw error;
  }
};
