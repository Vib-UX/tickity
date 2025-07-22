// import React, { useState } from "react";
// import {
//   useActiveAccount,
//   useActiveWalletConnectionStatus,
//   useActiveWalletChain,
//   useSwitchActiveWalletChain,
// } from "thirdweb/react";
// import { etherlinkTestnet } from "../config/thirdweb";
// import {
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   RefreshCw,
//   ExternalLink,
// } from "lucide-react";

// const MetaMaskTroubleshooter: React.FC = () => {
//   const account = useActiveAccount();
//   const connectionStatus = useActiveWalletConnectionStatus();
//   const chain = useActiveWalletChain();
//   const switchChain = useSwitchActiveWalletChain();
//   const [isExpanded, setIsExpanded] = useState(false);

//   const isCorrectNetwork = chain?.id === etherlinkTestnet.chainId;
//   const isConnected = connectionStatus === "connected";

//   const handleSwitchNetwork = async () => {
//     try {
//       await switchChain(etherlinkTestnet);
//     } catch (error) {
//       console.error("Failed to switch network:", error);
//     }
//   };

//   const addNetworkToMetaMask = () => {
//     if (typeof window.ethereum !== "undefined") {
//       window.ethereum.request({
//         method: "wallet_addEthereumChain",
//         params: [
//           {
//             chainId: `0x${etherlinkTestnet.chainId.toString(16)}`,
//             chainName: etherlinkTestnet.name,
//             nativeCurrency: etherlinkTestnet.nativeCurrency,
//             rpcUrls: etherlinkTestnet.rpc,
//             blockExplorerUrls: ["https://testnet-explorer.etherlink.com"],
//           },
//         ],
//       });
//     }
//   };

//   const troubleshootingSteps = [
//     {
//       title: "MetaMask Extension",
//       description: "Make sure MetaMask is installed and unlocked",
//       check: () => typeof window.ethereum !== "undefined",
//       fix: () => window.open("https://metamask.io/download/", "_blank"),
//       fixText: "Download MetaMask",
//     },
//     {
//       title: "Wallet Connection",
//       description: "Connect your wallet using the Connect Wallet button",
//       check: () => isConnected,
//       fix: null,
//       fixText: "Connect Wallet",
//     },
//     {
//       title: "Network Configuration",
//       description: "Switch to Etherlink Testnet (Chain ID: 128123)",
//       check: () => isCorrectNetwork,
//       fix: handleSwitchNetwork,
//       fixText: "Switch Network",
//     },
//     {
//       title: "Add Network to MetaMask",
//       description: "If Etherlink Testnet is not available, add it manually",
//       check: () => isCorrectNetwork,
//       fix: addNetworkToMetaMask,
//       fixText: "Add Network",
//     },
//   ];

//   return (
//     <div className="fixed bottom-4 left-4 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 text-sm text-[#FFFFFF] z-50 max-w-md">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="font-semibold flex items-center gap-2">
//           <AlertTriangle className="w-4 h-4 text-yellow-400" />
//           Connection Issues
//         </h3>
//         <button
//           onClick={() => setIsExpanded(!isExpanded)}
//           className="text-[#AAAAAA] hover:text-[#FFFFFF]"
//         >
//           {isExpanded ? "−" : "+"}
//         </button>
//       </div>

//       {/* Status Summary */}
//       <div className="space-y-2 mb-3">
//         <div className="flex items-center gap-2">
//           <span className="text-[#AAAAAA]">Status:</span>
//           {isConnected ? (
//             <CheckCircle className="w-4 h-4 text-[#00FF7F]" />
//           ) : (
//             <XCircle className="w-4 h-4 text-red-400" />
//           )}
//           <span className={isConnected ? "text-[#00FF7F]" : "text-red-400"}>
//             {connectionStatus}
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="text-[#AAAAAA]">Network:</span>
//           {isCorrectNetwork ? (
//             <CheckCircle className="w-4 h-4 text-[#00FF7F]" />
//           ) : (
//             <XCircle className="w-4 h-4 text-red-400" />
//           )}
//           <span
//             className={isCorrectNetwork ? "text-[#00FF7F]" : "text-red-400"}
//           >
//             {chain?.id} {isCorrectNetwork ? "(Correct)" : "(Wrong Network)"}
//           </span>
//         </div>
//         {account?.address && (
//           <div className="flex items-center gap-2">
//             <span className="text-[#AAAAAA]">Address:</span>
//             <span className="text-[#FFFFFF]">
//               {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Troubleshooting Steps */}
//       {isExpanded && (
//         <div className="space-y-3 border-t border-[#333333] pt-3">
//           <h4 className="font-medium text-[#FFFFFF]">Troubleshooting Steps:</h4>
//           {troubleshootingSteps.map((step, index) => (
//             <div key={index} className="space-y-2">
//               <div className="flex items-start gap-2">
//                 {step.check() ? (
//                   <CheckCircle className="w-4 h-4 text-[#00FF7F] mt-0.5" />
//                 ) : (
//                   <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
//                 )}
//                 <div className="flex-1">
//                   <div className="font-medium text-[#FFFFFF]">{step.title}</div>
//                   <div className="text-[#AAAAAA] text-xs">
//                     {step.description}
//                   </div>
//                   {!step.check() && step.fix && (
//                     <button
//                       onClick={step.fix}
//                       className="mt-1 text-xs bg-[#00FF7F] text-[#1A1A1A] px-2 py-1 rounded hover:bg-[#00E676] transition-colors"
//                     >
//                       {step.fixText}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Quick Actions */}
//       <div className="flex gap-2 mt-3 pt-3 border-t border-[#333333]">
//         <button
//           onClick={() => window.location.reload()}
//           className="flex items-center gap-1 text-xs bg-[#333333] text-[#FFFFFF] px-2 py-1 rounded hover:bg-[#444444] transition-colors"
//         >
//           <RefreshCw className="w-3 h-3" />
//           Refresh
//         </button>
//         <button
//           onClick={() =>
//             window.open(
//               "https://docs.thirdweb.com/react/connectwallet",
//               "_blank"
//             )
//           }
//           className="flex items-center gap-1 text-xs bg-[#333333] text-[#FFFFFF] px-2 py-1 rounded hover:bg-[#444444] transition-colors"
//         >
//           <ExternalLink className="w-3 h-3" />
//           Docs
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MetaMaskTroubleshooter;
