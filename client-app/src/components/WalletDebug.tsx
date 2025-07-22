import React from "react";
// TODO: Migrate wallet hooks to new thirdweb/react SDK
// import { etherlinkTestnet } from "../config/thirdweb";
import { etherlinkTestnet } from "thirdweb/chains";

const WalletDebug: React.FC = () => {
  // const address = useAddress();
  // const chainId = useChainId();
  // const connectionStatus = useConnectionStatus();

  return (
    <div className="fixed bottom-4 right-4 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-sm text-[#FFFFFF] z-50">
      <h3 className="font-semibold mb-2">Wallet Debug Info</h3>
      <div className="space-y-1">
        <div>
          <span className="text-[#AAAAAA]">Status: </span>
          <span
            className={
              // connectionStatus === "connected"
              //   ? "text-[#00FF7F]"
              //   : "text-red-400"
              "text-red-400" // Placeholder for status
            }
          >
            {/* {connectionStatus} */}
            Not connected
          </span>
        </div>
        <div>
          <span className="text-[#AAAAAA]">Chain ID: </span>
          <span
            className={
              // chainId === etherlinkTestnet.chainId
              //   ? "text-[#00FF7F]"
              //   : "text-red-400"
              "text-red-400" // Placeholder for chain ID
            }
          >
            {/* {chainId}{" "} */}
            {/* {chainId === etherlinkTestnet.chainId
              ? "(Correct)"
              : "(Wrong Network)"} */}
            Not connected
          </span>
        </div>
        <div>
          <span className="text-[#AAAAAA]">Address: </span>
          <span className="text-[#FFFFFF]">
            {/* {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Not connected"} */}
            Not connected
          </span>
        </div>
        <div>
          <span className="text-[#AAAAAA]">Expected Chain: </span>
          <span className="text-[#00FF7F]">
            {etherlinkTestnet.id} ({etherlinkTestnet.name})
          </span>
        </div>
      </div>
    </div>
  );
};

export default WalletDebug;
