import useGetUserEvents from "@/hooks/useGetUserEvents";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width } = Dimensions.get("window");

const YourEventsScreen = () => {
  const { data, isLoading, error } = useGetUserEvents();
  console.log("error", error);
  const router = useRouter();

  const renderEventItem = ({ item }: { item: any }) => {
    const { hasTickets, ticketCount } = item;

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventCardContent}>
          {/* Event Image with Gradient Overlay */}
          <View style={styles.eventImageContainer}>
            <Image
              source={{
                uri:
                  item.event.image ||
                  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop",
              }}
              style={styles.eventImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.imageOverlay}
            />

            {/* Event Status Badge */}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {hasTickets
                  ? `${ticketCount} Ticket${ticketCount > 1 ? "s" : ""}`
                  : "No Tickets"}
              </Text>
            </View>
          </View>

          <View style={styles.eventInfo}>
            {/* Event Title and Description */}
            <View style={styles.titleSection}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.event.name || `Event #${item.event.eventAddress}`}
              </Text>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {item.event.description ||
                  "Amazing event experience awaits you"}
              </Text>
            </View>

            {/* Event Details Grid */}
            <View style={styles.eventDetailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>📅 Date</Text>
                <Text style={styles.detailValue}>
                  {format(
                    new Date(Number(item.event.startTime) * 1000),
                    "MMM d, yyyy"
                  ) || "Coming Soon"}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>📍 Location</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {item.event.location || "TBA"}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>🎫 Ticket ID</Text>
                <Text style={styles.detailValue}>
                  #{item.event.id.slice(-6)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>💰 Price</Text>
                <Text style={styles.detailValue}>
                  {item.event.ticketPrices?.[0]
                    ? `${item.event.ticketPrices[0]} USDT`
                    : "TBA"}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => {
                  // Navigate to your event screen
                  router.push(`/yourevent/${item.event.eventAddress}`);
                }}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.checkoutGradient}
                >
                  <Text style={styles.checkoutButtonText}>Checkout Event</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No events found</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#000000", "#1a1a1a", "#2d2d2d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading events</Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            <FlatList
              data={(data as any)?.events || []}
              renderItem={renderEventItem}
              ListHeaderComponent={() => (
                <View style={styles.eventsHeader}>
                  <Text style={styles.eventsTitle}>Your Events</Text>
                  <Text style={styles.eventsSubtitle}>
                    Your upcoming events
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.event.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              ListEmptyComponent={renderEmptyState}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default YourEventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "300",
    marginBottom: 8,
    textAlign: "center",
  },
  appName: {
    fontSize: 48,
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  signInButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: width * 0.7,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "600",
  },
  exploreButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: width * 0.7,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  exploreButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  eventsContainer: {
    flex: 1,
    width: "100%",
  },
  eventsHeader: {
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  eventsTitle: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "left",
    letterSpacing: 0.5,
  },
  eventsSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "left",
    lineHeight: 20,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventCard: {
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eventCardContent: {
    flex: 1,
  },
  eventImageContainer: {
    position: "relative",
    height: 140,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventInfo: {
    padding: 16,
    gap: 12,
  },
  titleSection: {
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  eventDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailItem: {
    width: "48%", // Two columns
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },
  actionButtons: {
    justifyContent: "center",
    marginTop: -10,
  },
  viewDetailsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  viewDetailsButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  checkoutButton: {
    width: "100%",
    borderRadius: 25,
    overflow: "hidden",
  },
  checkoutGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#ff6b6b",
    textAlign: "center",
  },
});
