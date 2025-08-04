import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NFTCardProps {
  ticketId: string;
  ticketType: string;
  eventName?: string;
  eventImage?: string;
  purchaseDate?: string;
  tokenURI?: string;
  metadata?: any;
  onPress?: () => void;
}

const { width } = Dimensions.get("window");

const NFTCard: React.FC<NFTCardProps> = ({
  ticketId,
  ticketType,
  eventName = "Event Ticket",
  eventImage,
  purchaseDate,
  tokenURI,
  metadata,
  onPress,
}) => {
  const gradients = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#a8edea", "#fed6e3"],
  ];

  const gradientIndex = parseInt(ticketId) % gradients.length;
  const selectedGradient = gradients[gradientIndex];

  // Determine ticket type display
  const getTicketTypeDisplay = (type: string) => {
    if (type.includes("VIP")) return "VIP";
    if (type.includes("Premium")) return "Premium";
    if (type.includes("Standard")) return "Standard";
    return type;
  };

  const ticketTypeDisplay = getTicketTypeDisplay(ticketType);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={selectedGradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NFT</Text>
            </View>
            <Text style={styles.ticketId}>#{ticketId}</Text>
          </View>

          <View style={styles.imageContainer}>
            {metadata?.image ? (
              <Image
                source={{ uri: metadata.image }}
                style={styles.eventImage}
              />
            ) : eventImage ? (
              <Image source={{ uri: eventImage }} style={styles.eventImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>🎫</Text>
              </View>
            )}
          </View>

          <View style={styles.details}>
            <Text style={styles.eventName} numberOfLines={2}>
              {metadata?.name || eventName}
            </Text>
            <View style={styles.ticketTypeContainer}>
              <View style={styles.ticketTypeBadge}>
                <Text style={styles.ticketTypeText}>{ticketTypeDisplay}</Text>
              </View>
            </View>
            {purchaseDate && (
              <Text style={styles.purchaseDate}>
                Purchased: {new Date(purchaseDate).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.chainIndicator}>
              <View style={styles.chainDot} />
              <Text style={styles.chainText}>Ethereum</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 16,
    padding: 1,
  },
  cardContent: {
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    borderRadius: 15,
    padding: 12,
    height: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  ticketId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ccc",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
  },
  details: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  ticketTypeContainer: {
    marginBottom: 4,
  },
  ticketTypeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ticketTypeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  purchaseDate: {
    fontSize: 10,
    color: "#aaa",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  chainIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  chainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 4,
  },
  chainText: {
    fontSize: 10,
    color: "#ccc",
  },
});

export default NFTCard;
