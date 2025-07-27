import SignInBottomSheet, {
  SignInBottomSheetRef,
} from "@/components/bottomsheet/SignInBottomSheet";
import { chain, client } from "@/constants/thirdweb";
import useGetEvents from "@/hooks/useGetEvents";
import useGetTicketPrice from "@/hooks/useGetTicketPrice";
import { Event } from "@/types/event";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getContract, prepareContractCall } from "thirdweb";
import { useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";

const { width, height } = Dimensions.get("window");

// Define purchase states
type PurchaseState = "idle" | "loading" | "success" | "error";

const EventPage = () => {
  const params = useLocalSearchParams();
  const eventId = params.event as string;
  const navigation = useNavigation();
  const account = useActiveAccount();
  const { data, isLoading, error } = useGetEvents();
  const signInBottomSheetRef = useRef<SignInBottomSheetRef>(null);
  const sendMutation = useSendAndConfirmTransaction();

  // Purchase state management
  const [purchaseState, setPurchaseState] = useState<PurchaseState>("idle");
  const [purchaseError, setPurchaseError] = useState<string>("");

  // Ticket quantity state
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // Find the specific event from the events data
  const event = useMemo(() => {
    if (!data || !eventId) return null;
    const events = (data as any)?.eventCreateds;
    if (!events || !Array.isArray(events)) return null;
    return events.find(
      (event: Event) => event.eventAddress === eventId
    ) as Event;
  }, [data, eventId]);

  // Use useQuery for ticket price
  const {
    ticketPrice,
    isLoading: isLoadingPrice,
    error: priceError,
  } = useGetTicketPrice({
    eventId,
    enabled: !!event,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        event?.eventName ||
        event?.title ||
        `Event #${eventId?.slice(-6) || "N/A"}`,
    });
  }, [navigation, eventId, event]);

  // Handle quantity changes
  const incrementQuantity = () => {
    setTicketQuantity((prev) => Math.min(prev + 1, 10)); // Max 10 tickets
  };

  const decrementQuantity = () => {
    setTicketQuantity((prev) => Math.max(prev - 1, 1)); // Min 1 ticket
  };

  // Calculate total price
  const totalPrice = ticketPrice * BigInt(ticketQuantity);

  // Mock API call for ticket purchase
  const purchaseTicket = async () => {
    try {
      setPurchaseState("loading");
      setPurchaseError("");

      if (!event) {
        throw new Error("Event not found");
      }

      const id = eventId.split("-")[0];
      const eventContract = getContract({
        client,
        address: id,
        chain: chain,
      });

      // Purchase multiple tickets in a loop
      for (let i = 0; i < ticketQuantity; i++) {
        const transaction = prepareContractCall({
          contract: eventContract,
          method:
            "function purchaseTicket(uint256 ticketTypeIndex) external payable",
          params: [BigInt(0)],
          value: ticketPrice,
        });

        await sendMutation.mutateAsync({ ...transaction });
      }

      setPurchaseState("success");
      setPurchaseError("");
    } catch (error) {
      setPurchaseState("error");
      setPurchaseError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );

      // Reset error state after 5 seconds
      setTimeout(() => {
        setPurchaseState("idle");
        setPurchaseError("");
      }, 5000);
    }
  };

  const handleBuyTicket = async () => {
    if (!account) {
      signInBottomSheetRef.current?.snapToIndex(0);
      console.log("Please connect your wallet first");
      return;
    }

    if (purchaseState === "loading") {
      return; // Prevent multiple clicks
    }

    await purchaseTicket();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Coming Soon";
    try {
      const date = new Date(parseInt(dateString) * 1000);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Coming Soon";
    }
  };

  const formatPrice = (price?: string | bigint) => {
    if (!price || price === BigInt(0)) return "Free";
    const ethPrice = parseFloat(price.toString()) / Math.pow(10, 18);
    return `${ethPrice.toFixed(4)} ETH`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#000000", "#1a1a1a", "#2d2d2d"]}
          style={styles.container}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading event details...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#000000", "#1a1a1a", "#2d2d2d"]}
          style={styles.container}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Event not found</Text>
            <Text style={styles.errorSubtext}>
              The event you're looking for doesn't exist or has been removed.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#000000", "#1a1a1a", "#2d2d2d"]}
        style={styles.container}
      >
        <SignInBottomSheet ref={signInBottomSheetRef} />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <Image
              source={{
                uri:
                  event.image ||
                  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop",
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.heroOverlay}
            />
          </View>

          {/* Event Content */}
          <View style={styles.content}>
            {/* Event Title */}
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>
                {event.eventName ||
                  event.title ||
                  `Event #${event.id.slice(-6)}`}
              </Text>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Live Event</Text>
              </View>
            </View>

            {/* 3. Buy Tickets Section */}
            <View style={styles.ticketSelectionCard}>
              <View style={styles.ticketSelectionHeader}>
                <Text style={styles.ticketSelectionTitle}>🎫 Buy Tickets</Text>
                <Text style={styles.ticketSelectionSubtitle}>
                  Choose how many tickets you'd like to purchase
                </Text>
              </View>

              <View style={styles.ticketSelectionContent}>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      ticketQuantity <= 1 && styles.quantityButtonDisabled,
                    ]}
                    onPress={decrementQuantity}
                    disabled={ticketQuantity <= 1}
                  >
                    <Text
                      style={[
                        styles.quantityButtonText,
                        ticketQuantity <= 1 &&
                          styles.quantityButtonTextDisabled,
                      ]}
                    >
                      −
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityNumber}>{ticketQuantity}</Text>
                    <Text style={styles.quantityLabel}>tickets</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      ticketQuantity >= 10 && styles.quantityButtonDisabled,
                    ]}
                    onPress={incrementQuantity}
                    disabled={ticketQuantity >= 10}
                  >
                    <Text
                      style={[
                        styles.quantityButtonText,
                        ticketQuantity >= 10 &&
                          styles.quantityButtonTextDisabled,
                      ]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.priceDisplay}>
                  <Text style={styles.priceLabel}>Total Price</Text>
                  <Text style={styles.priceValue}>
                    {isLoadingPrice ? "Loading..." : formatPrice(totalPrice)}
                  </Text>
                </View>
              </View>
            </View>
            {/* 1. About Section */}
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionLabel}>About This Event</Text>
              <Text style={styles.eventDescription}>
                {event.eventDescription ||
                  event.description ||
                  "An amazing event experience awaits you. Join us for an unforgettable time with great music, food, and entertainment."}
              </Text>
            </View>

            {/* 2. Event Details Section */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Event Details</Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailIcon}>📅</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(event.eventDate || event.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailIcon}>📍</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {event.eventLocation || "TBA"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailIcon}>💰</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Ticket Price</Text>
                    <Text style={styles.detailValue}>
                      {isLoadingPrice ? "Loading..." : formatPrice(ticketPrice)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailIcon}>🎫</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Available</Text>
                    <Text style={styles.detailValue}>
                      {event.maxTickets || "Unlimited"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Organizer Info - Part of Event Details */}
              {event.organizer && (
                <View style={styles.organizerCard}>
                  <View style={styles.organizerHeader}>
                    <View style={styles.organizerIconContainer}>
                      <Text style={styles.organizerIcon}>👤</Text>
                    </View>
                    <View style={styles.organizerContent}>
                      <Text style={styles.organizerLabel}>Event Organizer</Text>
                      <Text style={styles.organizerValue}>
                        {event.organizer.slice(0, 6)}...
                        {event.organizer.slice(-4)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Buy Ticket Button */}
        <View style={styles.bottomContainer}>
          {/* Success Message */}
          {purchaseState === "success" && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                🎉 {ticketQuantity} ticket{ticketQuantity > 1 ? "s" : ""}{" "}
                purchased successfully!
              </Text>
              <Text style={styles.successSubtext}>
                Check your wallet for the ticket NFT
                {ticketQuantity > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {/* Error Message */}
          {purchaseState === "error" && (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>❌ {purchaseError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.buyTicketButton,
              !account && styles.buyTicketButtonDisabled,
              purchaseState === "loading" && styles.buyTicketButtonLoading,
              purchaseState === "success" && styles.buyTicketButtonSuccess,
              purchaseState === "error" && styles.buyTicketButtonError,
            ]}
            onPress={handleBuyTicket}
            disabled={purchaseState === "loading" || isLoadingPrice}
          >
            <LinearGradient
              colors={
                purchaseState === "success"
                  ? ["#4ade80", "#22c55e"]
                  : purchaseState === "error"
                  ? ["#f87171", "#ef4444"]
                  : purchaseState === "loading"
                  ? ["#6b7280", "#4b5563"]
                  : account
                  ? ["#22c55e", "#16a34a"]
                  : ["#666666", "#444444"]
              }
              style={styles.buttonGradient}
            >
              {purchaseState === "loading" ? (
                <View style={styles.loadingButtonContent}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.buyTicketButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.buyTicketButtonText}>
                  {purchaseState === "success"
                    ? "Tickets Purchased!"
                    : purchaseState === "error"
                    ? "Try Again"
                    : account
                    ? `Buy ${ticketQuantity} Ticket${
                        ticketQuantity > 1 ? "s" : ""
                      }`
                    : "Connect Wallet to Buy"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default EventPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Reduced since ticket selection is now in main content
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 20,
    color: "#ff6b6b",
    fontWeight: "600",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 20,
  },
  heroContainer: {
    position: "relative",
    height: 150,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    padding: 10,
    gap: 16,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 32,
    flex: 1,
    marginRight: 12,
  },
  eventBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  eventBadgeText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descriptionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  descriptionLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 24,
  },
  detailsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  organizerCard: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  organizerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  organizerIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  organizerContent: {
    flex: 1,
  },
  organizerLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  organizerValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  eventIdCard: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  eventIdHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventIdIcon: {
    fontSize: 20,
    color: "#ffffff",
    marginRight: 8,
  },
  eventIdLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventIdValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    gap: 12,
  },

  buyTicketButton: {
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
  buyTicketButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buyTicketButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  // Success and error message styles
  successContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  successText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  successSubtext: {
    color: "rgba(34, 197, 94, 0.8)",
    fontSize: 14,
    textAlign: "center",
  },
  errorMessageContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  errorMessageText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  // Button state styles
  buyTicketButtonLoading: {
    opacity: 0.7,
  },
  buyTicketButtonSuccess: {
    opacity: 0.9,
  },
  buyTicketButtonError: {
    opacity: 0.9,
  },
  loadingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ticketSelectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ticketSelectionHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  ticketSelectionTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 2,
  },
  ticketSelectionSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  ticketSelectionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "500",
  },
  quantityButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  quantityDisplay: {
    minWidth: 80,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quantityNumber: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
  quantityLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceDisplay: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  priceLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
});
