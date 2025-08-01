import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface NFTModalProps {
  visible: boolean;
  onClose: () => void;
  onDone?: () => void;
  nftImage?: string;
  eventName?: string;
  ticketQuantity: number;
  transactionHash?: string;
  onRefetch?: () => void;
}

function NFTModal({
  visible,
  onClose,
  onDone,
  nftImage,
  eventName,
  ticketQuantity,
  transactionHash,
  onRefetch,
}: NFTModalProps) {
  const defaultNFTImage =
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop";

  const handleTransactionPress = () => {
    if (transactionHash) {
      const explorerUrl = `https://testnet.explorer.etherlink.com/tx/${transactionHash}`;
      WebBrowser.openBrowserAsync(explorerUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#000000", "#1a1a1a", "#2d2d2d"]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎉 Purchase Successful!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* NFT Image */}
            <View style={styles.nftContainer}>
              <View style={styles.nftImageContainer}>
                <Image
                  source={{
                    uri: nftImage || defaultNFTImage,
                  }}
                  style={styles.nftImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.nftImageOverlay}
                />
                <View style={styles.nftBadge}>
                  <Text style={styles.nftBadgeText}>NFT</Text>
                </View>
              </View>
            </View>

            {/* Success Message */}
            <View style={styles.successMessage}>
              <Text style={styles.successTitle}>
                {ticketQuantity} Ticket{ticketQuantity > 1 ? "s" : ""} Minted!
              </Text>
              <Text style={styles.successSubtitle}>
                Your ticket{ticketQuantity > 1 ? "s" : ""} have been minted as
                NFT{ticketQuantity > 1 ? "s" : ""} and sent to your wallet
              </Text>
            </View>

            {/* Event Details */}
            <View style={styles.eventDetailsCard}>
              <Text style={styles.cardTitle}>Event Details</Text>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>Event:</Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.eventDetailValue}
                >
                  {eventName || "Unknown Event"}
                </Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>Quantity:</Text>
                <Text style={styles.eventDetailValue}>
                  {ticketQuantity} ticket{ticketQuantity > 1 ? "s" : ""}
                </Text>
              </View>
              {transactionHash && (
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailLabel}>Transaction:</Text>
                  <TouchableOpacity
                    onPress={handleTransactionPress}
                    style={styles.transactionContainer}
                  >
                    <Text style={styles.transactionHash}>
                      {transactionHash.slice(0, 6)}...
                      {transactionHash.slice(-4)}
                    </Text>
                    <Text style={styles.externalLinkIcon}>↗</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.cardTitle}>What's Next?</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Check your wallet for the ticket NFT
                  {ticketQuantity > 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2</Text>
                <Text style={styles.instructionText}>
                  Present your NFT at the event entrance
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Enjoy your event experience!
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                // Trigger refetch for optimistic updates
                if (onRefetch) {
                  onRefetch();
                }
                if (onDone) {
                  onDone();
                } else {
                  onClose();
                }
              }}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  nftContainer: {
    alignItems: "center",
  },
  nftImageContainer: {
    position: "relative",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#22c55e",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  nftImage: {
    width: "100%",
    height: "100%",
  },
  nftImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  nftBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  nftBadgeText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  successMessage: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 24,
    color: "#22c55e",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  eventDetailsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  eventDetailLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  eventDetailValue: {
    fontSize: 14,
    color: "#ffffff",
    maxWidth: 200,
    fontWeight: "600",
  },
  transactionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  transactionHash: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
    fontFamily: "monospace",
    textDecorationLine: "underline",
  },
  externalLinkIcon: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
  },
  instructionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 24,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  primaryButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default NFTModal;
