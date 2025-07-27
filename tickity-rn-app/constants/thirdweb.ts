import { createThirdwebClient } from "thirdweb";
import { etherlinkTestnet } from "thirdweb/chains";

export const chain = etherlinkTestnet;

const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID!;
const secretKey = process.env.EXPO_PUBLIC_THIRDWEB_SECRET_KEY!;
if (!clientId) {
  throw new Error(
    "Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID - make sure to set it in your .env file"
  );
}

export const client = createThirdwebClient({
  clientId,
  secretKey,
});
