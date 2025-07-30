import { chain, client } from "@/constants/thirdweb";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getContract, getContractEvents } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

interface UserLatestTransaction {
  transactionHash: string;
  eventAddress: string;
  eventName?: string;
  ticketType?: string;
  timestamp: number;
  blockNumber: number;
}

interface UserLatestTransactionsProps {
  maxTransactions?: number;
}

const UserLatestTransactions: React.FC<UserLatestTransactionsProps> = ({
  maxTransactions = 5,
}) => {
  const account = useActiveAccount();
  const [transactions, setTransactions] = React.useState<
    UserLatestTransaction[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get all events to check for user transactions
        const eventsResponse = await fetch(
          "https://api.studio.thegraph.com/query/48211/tickity/v0.0.1",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              query {
                eventCreateds {
                  eventAddress
                  name
                  ticketTypes
                  ticketPrices
                }
              }
            `,
            }),
          }
        );

        const eventsData = await eventsResponse.json();
        const events = eventsData.data?.eventCreateds || [];

        const userTransactions: UserLatestTransaction[] = [];

        // Check each event for user transactions
        for (const event of events) {
          try {
            const eventContract = getContract({
              client,
              address: event.eventAddress,
              chain: chain,
            });

            const logs = await getContractEvents({
              contract: eventContract,
              events: [
                {
                  // @ts-ignore
                  name: "TicketPurchased",
                  inputs: [
                    {
                      name: "buyer",
                      type: "address",
                    },
                    {
                      name: "ticketTypeIndex",
                      type: "uint256",
                    },
                    {
                      name: "tokenId",
                      type: "uint256",
                    },
                  ],
                },
              ],
              queryFilter: {
                fromBlock: "earliest",
                toBlock: "latest",
              },
            });

            // Filter logs for this user
            const userLogs = logs.filter((log) => {
              const args = log.args as any;
              return (
                args?.buyer?.toLowerCase() === account.address.toLowerCase()
              );
            });

            // Convert logs to UserLatestTransaction objects
            for (const log of userLogs) {
              const args = log.args as any;
              const ticketTypeIndex = args?.ticketTypeIndex || 0;
              const ticketType =
                event.ticketTypes?.[ticketTypeIndex] ||
                `Type ${ticketTypeIndex}`;

              userTransactions.push({
                transactionHash: log.transactionHash,
                eventAddress: event.eventAddress,
                eventName: event.name,
                ticketType,
                timestamp: Date.now(), // Using current timestamp as fallback
                blockNumber: Number(log.blockNumber),
              });
            }
          } catch (error) {
            console.warn(
              `Error fetching transactions for event ${event.eventAddress}:`,
              error
            );
            // Continue with other events
          }
        }

        // Sort by timestamp (newest first) and limit
        const sortedTransactions = userTransactions
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxTransactions);

        setTransactions(sortedTransactions);
      } catch (err) {
        console.error("Error fetching user transactions:", err);
        setError("Failed to load your transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTransactions();
  }, [account?.address, maxTransactions]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTransactionHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const handleTransactionPress = (transaction: UserLatestTransaction) => {
    const explorerUrl = `https://testnet.explorer.etherlink.com/tx/${transaction.transactionHash}`;
    WebBrowser.openBrowserAsync(explorerUrl);
  };

  if (!account) {
    return null; // Don't show anything if user is not connected
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Recent Purchases</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#22c55e" />
          <Text style={styles.loadingText}>Loading your purchases...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Recent Purchases</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Recent Purchases</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No purchases yet</Text>
          <Text style={styles.emptySubtext}>Buy tickets to see them here!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Recent Purchases</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            key={`${transaction.transactionHash}-${index}`}
            style={styles.transactionCard}
            onPress={() => handleTransactionPress(transaction)}
          >
            <View style={styles.transactionHeader}>
              <Text style={styles.eventName} numberOfLines={1}>
                {transaction.eventName || "Unknown Event"}
              </Text>
              <Text style={styles.timestamp}>
                {formatDate(transaction.timestamp)}
              </Text>
            </View>

            <View style={styles.transactionDetails}>
              <Text style={styles.ticketType}>
                {transaction.ticketType} Ticket
              </Text>
              <Text style={styles.transactionHash}>
                {formatTransactionHash(transaction.transactionHash)}
              </Text>
            </View>

            <View style={styles.viewOnExplorer}>
              <Text style={styles.viewOnExplorerText}>View →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  transactionCard: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  transactionHeader: {
    marginBottom: 8,
  },
  eventName: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
  },
  transactionDetails: {
    marginBottom: 8,
  },
  ticketType: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionHash: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: "monospace",
  },
  viewOnExplorer: {
    alignItems: "center",
  },
  viewOnExplorerText: {
    fontSize: 10,
    color: "#3b82f6",
    fontWeight: "500",
  },
});

export default UserLatestTransactions;
