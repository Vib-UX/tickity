import { createThirdwebClient, getContract } from "thirdweb";
import { etherlinkTestnet } from "thirdweb/chains";
import { USDT_CONTRACT_ADDRESS } from "./addresses";

export const chain = etherlinkTestnet;

// Use environment variables with fallbacks for development
// In production builds, these should be set via EAS build configuration
const clientId = "e815b7bc8066484753033e49b5f637f8";
const secretKey =
  "TLTWULf6K5QRGeh9Oh3nmeoqXRBJmCBMUy9B_RCid_NfmRSjV85xIYXmRmBwQKZ0ApGZAPOdfw0psbKEUm5mcA";

// Log the environment for debugging (remove in production)
console.log("Thirdweb Environment Check:", {
  hasClientId: !!clientId,
  hasSecretKey: !!secretKey,
  nodeEnv: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === "production",
});

// Validate that we have the required credentials
if (!clientId) {
  console.error(
    "Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID - make sure to set it in your .env file or EAS build configuration"
  );
}

if (!secretKey) {
  console.error(
    "Missing EXPO_PUBLIC_THIRDWEB_SECRET_KEY - make sure to set it in your .env file or EAS build configuration"
  );
}

// Create client with better error handling
export const client = createThirdwebClient({
  clientId: clientId,
  secretKey: secretKey,
});

export const usdcContract = getContract({
  client,
  address: USDT_CONTRACT_ADDRESS,
  chain: chain,
});
