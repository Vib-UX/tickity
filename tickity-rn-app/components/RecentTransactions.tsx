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

interface RecentTransaction {
  transactionHash: string;
  buyer: string;
  ticketTypeIndex: number;
  tokenId: string;
  timestamp: number;
  blockNumber: number;
}

interface RecentTransactionsProps {
  eventAddress: string;
  eventName?: string;
  ticketTypes?: string[];
  maxTransactions?: number;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  eventAddress,
  eventName,
  ticketTypes = [],
  maxTransactions = 5,
}) => {
  const account = useActiveAccount();
  const [transactions, setTransactions] = React.useState<RecentTransaction[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const eventContract = getContract({
          client,
          address: eventAddress,
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

        const recentTransactions: RecentTransaction[] = logs
          .map((log) => {
            const args = log.args as any;
            return {
              transactionHash: log.transactionHash,
              buyer: args?.buyer || "",
              ticketTypeIndex: parseInt(
                args?.ticketTypeIndex?.toString() || "0"
              ),
              tokenId: args?.tokenId?.toString() || "0",
              timestamp: log.blockTimestamp || Date.now() / 1000,
              blockNumber: log.blockNumber || 0,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxTransactions);

        setTransactions(recentTransactions);
      } catch (err) {
        console.error("Error fetching recent transactions:", err);
        setError("Failed to load recent transactions");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventAddress) {
      fetchTransactions();
    }
  }, [eventAddress, maxTransactions]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
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

  const handleTransactionPress = (transaction: RecentTransaction) => {
    const explorerUrl = `https://testnet.explorer.etherlink.com/tx/${transaction.transactionHash}`;
    WebBrowser.openBrowserAsync(explorerUrl);
  };

  const getTicketTypeName = (index: number) => {
    return ticketTypes[index] || `Type ${index + 1}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Purchases</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#22c55e" />
          <Text style={styles.loadingText}>Loading recent purchases...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Purchases</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Purchases</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent purchases</Text>
          <Text style={styles.emptySubtext}>Be the first to buy a ticket!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Purchases</Text>
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
              <Text style={styles.ticketType}>
                {getTicketTypeName(transaction.ticketTypeIndex)}
              </Text>
              <Text style={styles.timestamp}>
                {formatDate(transaction.timestamp)}
              </Text>
            </View>

            <View style={styles.transactionDetails}>
              <Text style={styles.buyerAddress}>
                {formatAddress(transaction.buyer)}
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    minWidth: 160,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  transactionHeader: {
    marginBottom: 8,
  },
  ticketType: {
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
  buyerAddress: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
    marginBottom: 2,
    fontFamily: "monospace",
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

export default RecentTransactions;
