import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { createAuth } from "thirdweb/auth";
import { ConnectButton, ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { inAppWallet } from "thirdweb/wallets/in-app";

import { chain, client } from "../constants/thirdweb";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "facebook", "discord", "telegram", "email", "phone"],
      passkeyDomain: "thirdweb.com",
    },
    smartAccount: {
      chain: chain,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet", {
    appMetadata: {
      name: "Thirdweb RN Demo",
    },
    mobileConfig: {
      callbackURL: "com.thirdweb.demo://",
    },
    walletConfig: {
      options: "smartWalletOnly",
    },
  }),
  createWallet("me.rainbow"),
  createWallet("com.trustwallet.app"),
  createWallet("io.zerion.wallet"),
];

const thirdwebAuth = createAuth({
  domain: "localhost:3000",
  client,
});

// fake login state, this should be returned from the backend
let isLoggedIn = false;

export default function ThirdwebScreen() {
  const account = useActiveAccount();
  const theme = useColorScheme();
  return (
    <ScrollView>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Welcome to Tickity</Text>
        <Text style={styles.headerDescription}>
          Connect your wallet to start creating and managing events
        </Text>
      </View>
      {account ? (
        <ConnectButton
          client={client}
          theme={theme || "dark"}
          wallets={wallets}
          chain={chain}
        />
      ) : (
        <ConnectEmbed
          client={client}
          theme={theme || "dark"}
          chain={chain}
          wallets={wallets}
          auth={{
            async doLogin(params) {
              // fake delay
              await new Promise((resolve) => setTimeout(resolve, 2000));
              const verifiedPayload = await thirdwebAuth.verifyPayload(params);
              isLoggedIn = verifiedPayload.valid;
            },
            async doLogout() {
              isLoggedIn = false;
            },
            async getLoginPayload(params) {
              return thirdwebAuth.generatePayload(params);
            },
            async isLoggedIn(address) {
              return isLoggedIn;
            },
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  headerContainer: {
    paddingHorizontal: 36,
    paddingBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerDescription: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "space-evenly",
  },
  tableContainer: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  leftColumn: {
    flex: 1,
    textAlign: "left",
  },
  rightColumn: {
    flex: 1,
    textAlign: "right",
  },
});
