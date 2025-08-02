import useGetUSDTBalance from "@/hooks/useGetUSDTBalance";
import useRefreshOnFocus from "@/hooks/useRefetchFocus";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createAuth } from "thirdweb/auth";
import { etherlink } from "thirdweb/chains";
import { ConnectButton, ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { inAppWallet } from "thirdweb/wallets/in-app";
import { chain, client } from "../../constants/thirdweb";

const { width } = Dimensions.get("window");

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "facebook", "discord", "telegram", "email", "phone"],
      passkeyDomain: "thirdweb.com",
    },
    executionMode: {
      mode: "EIP7702",
      sponsorGas: true,
    },
    smartAccount: {
      chain: chain,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
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

export default function AccountScreen() {
  const account = useActiveAccount();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const {
    balance: usdtBalance,
    isLoading: isLoadingBalance,
    refetch,
  } = useGetUSDTBalance();

  useRefreshOnFocus(async () => {
    refetch();
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: bigint) => {
    return `${parseFloat(balance.toString()) / Math.pow(10, 6)} USDT`;
  };

  return (
    <LinearGradient
      colors={["#000000", "#1a1a1a", "#2d2d2d"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#22c55e"
              colors={["#22c55e"]}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account</Text>
            <Text style={styles.headerSubtitle}>
              Manage your wallet and preferences
            </Text>
          </View>

          {account ? (
            <View style={styles.accountContainer}>
              {/* Wallet Info Card */}
              <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <View style={styles.walletIconContainer}>
                    <Text style={styles.walletIcon}>👛</Text>
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletLabel}>Connected Wallet</Text>
                    <Text style={styles.walletAddress}>
                      {formatAddress(account.address)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Balance Card */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceIcon}>💰</Text>
                  <Text style={styles.balanceTitle}>USDT Balance</Text>
                </View>
                <Text style={styles.balanceValue}>
                  {isLoadingBalance ? (
                    <ActivityIndicator size="small" color="#22c55e" />
                  ) : (
                    formatBalance(usdtBalance)
                  )}
                </Text>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActionsCard}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => router.push("/(tabs)/favourites")}
                  >
                    <Text style={styles.quickActionIcon}>🎫</Text>
                    <Text style={styles.quickActionText}>My Tickets</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => router.push("/(tabs)/explore")}
                  >
                    <Text style={styles.quickActionIcon}>📅</Text>
                    <Text style={styles.quickActionText}>My Events</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => {
                      // TODO: Navigate to settings when available
                      console.log("Settings pressed");
                    }}
                  >
                    <Text style={styles.quickActionIcon}>⚙️</Text>
                    <Text style={styles.quickActionText}>Settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => {
                      // TODO: Navigate to help when available
                      console.log("Help pressed");
                    }}
                  >
                    <Text style={styles.quickActionIcon}>❓</Text>
                    <Text style={styles.quickActionText}>Help</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.recentActivityCard}>
                <Text style={styles.recentActivityTitle}>Recent Activity</Text>
                <View style={styles.recentActivityList}>
                  <TouchableOpacity
                    style={styles.recentActivityItem}
                    onPress={() => router.push("/(tabs)/explore")}
                  >
                    <View style={styles.recentActivityIconContainer}>
                      <Text style={styles.recentActivityIcon}>🎉</Text>
                    </View>
                    <View style={styles.recentActivityContent}>
                      <Text style={styles.recentActivityTitle}>
                        View All Events
                      </Text>
                      <Text style={styles.recentActivitySubtitle}>
                        Discover and attend events
                      </Text>
                    </View>
                    <Text style={styles.recentActivityArrow}>→</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.recentActivityItem}
                    onPress={() => router.push("/(tabs)/favourites")}
                  >
                    <View style={styles.recentActivityIconContainer}>
                      <Text style={styles.recentActivityIcon}>🎫</Text>
                    </View>
                    <View style={styles.recentActivityContent}>
                      <Text style={styles.recentActivityTitle}>My Tickets</Text>
                      <Text style={styles.recentActivitySubtitle}>
                        View your purchased tickets
                      </Text>
                    </View>
                    <Text style={styles.recentActivityArrow}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Wallet Connection */}
              <View style={styles.walletConnectionCard}>
                <ConnectButton
                  client={client}
                  theme="dark"
                  wallets={wallets}
                  chain={chain}
                  accountAbstraction={{
                    chain: etherlink,
                    sponsorGas: true,
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.connectContainer}>
              <View style={styles.connectHeader}>
                <Text style={styles.connectIcon}>🔗</Text>
                <Text style={styles.connectTitle}>Connect Your Wallet</Text>
                <Text style={styles.connectSubtitle}>
                  Connect your wallet to start buying tickets and managing your
                  account
                </Text>
              </View>

              <ConnectEmbed
                client={client}
                theme="dark"
                chain={chain}
                wallets={wallets}
                accountAbstraction={{
                  chain: etherlink,
                  sponsorGas: true,
                }}
                auth={{
                  async doLogin(params) {
                    const verifiedPayload = await thirdwebAuth.verifyPayload(
                      params
                    );
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
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
  },
  accountContainer: {
    paddingHorizontal: 20,
    gap: 14,
  },
  walletCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletIcon: {
    fontSize: 24,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  balanceCard: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  balanceTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 24,
    color: "#22c55e",
    fontWeight: "700",
  },
  quickActionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  quickActionsTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 14,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: (width - 80) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
    textAlign: "center",
  },
  walletConnectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  connectContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  connectHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  connectIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  connectTitle: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  connectSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  // Recent Activity Styles
  recentActivityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  recentActivityTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 14,
  },
  recentActivityList: {
    gap: 12,
  },
  recentActivityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  recentActivityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentActivityIcon: {
    fontSize: 20,
  },
  recentActivityContent: {
    flex: 1,
  },
  recentActivitySubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  recentActivityArrow: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
  },
});
