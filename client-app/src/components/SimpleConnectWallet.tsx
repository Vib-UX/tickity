import React from "react";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "../config/thirdweb";

const SimpleConnectWallet: React.FC = () => {
  return <ConnectButton client={client} wallets={wallets} />;
};

export default SimpleConnectWallet;
