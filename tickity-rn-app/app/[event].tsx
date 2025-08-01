import SignInBottomSheet, {
  SignInBottomSheetRef,
} from "@/components/bottomsheet/SignInBottomSheet";
import NFTModal from "@/components/NFTModal";
import TransactionProgress from "@/components/TransactionProgress";
import { chain, client, usdcContract } from "@/constants/thirdweb";
import useGetEvents from "@/hooks/useGetEvents";
import useGetUSDT from "@/hooks/useGetUSDT";
import useGetUSDTBalance from "@/hooks/useGetUSDTBalance";
import useGetUserTickets from "@/hooks/useGetUserTickets";
import { Event } from "@/types/event";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getContract, getContractEvents, prepareContractCall } from "thirdweb";
import { approve } from "thirdweb/extensions/erc20";
import { useActiveAccount, useSendCalls } from "thirdweb/react";
import { formatNumber } from "thirdweb/utils";

// Define purchase states
type PurchaseState = "idle" | "loading" | "success" | "error";

const EventPage = () => {
  const params = useLocalSearchParams();
  const eventId = params.event as string;
  const navigation = useNavigation();

  // Add error handling for useActiveAccount
  let account;
  try {
    account = useActiveAccount();
  } catch (error) {
    console.error("useActiveAccount error:", error);
    // Fallback to null account
    account = null;
  }

  const { data, isLoading, error } = useGetEvents();
  const signInBottomSheetRef = useRef<SignInBottomSheetRef>(null);

  const id = eventId.split("-")[0];

  const eventContract = getContract({
    client,
    address: id,
    chain: chain,
  });

  const {
    balance: usdtBalance,
    isLoading: isLoadingBalance,
    refetch: refetchUSDTBalance,
  } = useGetUSDTBalance();

  // Get user tickets for this event

  // Purchase state management
  const [purchaseState, setPurchaseState] = useState<PurchaseState>("idle");
  const [purchaseError, setPurchaseError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>("");

  // NFT Modal state
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");

  // Ticket quantity state
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");

  // USDT Get mutation
  const {
    getUsdt,
    isLoading: isGettingUsdt,
    isSuccess: isGetUsdtSuccess,
    isError: isGetUsdtError,
    error: getUsdtError,
    reset: resetGetUsdt,
  } = useGetUSDT();

  const event = useMemo(() => {
    if (!data || !eventId) return null;
    const events = data.eventCreateds;
    if (!events || !Array.isArray(events)) return null;
    return events.find(
      (event: Event) => event.eventAddress === eventId
    ) as Event;
  }, [data, eventId]);

  const { mutateAsync: sendCalls } = useSendCalls();

  const {
    hasTickets,
    ticketCount,
    ticketsByType,
    isLoading: isLoadingTickets,
    refetch: refetchUserTickets,
  } = useGetUserTickets(event?.eventAddress);

  // Reset success state after delay
  useEffect(() => {
    if (isGetUsdtSuccess) {
      const timer = setTimeout(() => {
        resetGetUsdt();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isGetUsdtSuccess, resetGetUsdt]);

  useLayoutEffect(() => {
    if (
      event?.ticketTypes &&
      event.ticketTypes.length > 0 &&
      !selectedTicketType
    ) {
      setSelectedTicketType(event.ticketTypes[0]);
    }
  }, [event, selectedTicketType]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: event?.name || `Event #${eventId?.slice(-6) || "N/A"}`,
    });
  }, [navigation, eventId, event]);

  // Handle quantity changes
  const incrementQuantity = () => {
    setTicketQuantity((prev) => Math.min(prev + 1, 10)); // Max 10 tickets
  };

  const decrementQuantity = () => {
    setTicketQuantity((prev) => Math.max(prev - 1, 1)); // Min 1 ticket
  };

  const selectedTicketIndex =
    event?.ticketTypes?.findIndex((type) => type === selectedTicketType) ?? 0;
  const selectedTicketPrice = event?.ticketPrices?.[selectedTicketIndex]
    ? BigInt(event.ticketPrices[selectedTicketIndex])
    : 0n;

  const totalPrice = selectedTicketPrice * BigInt(ticketQuantity);

  const purchaseTicket = async () => {
    try {
      console.log(event?.eventId, "eventId");
      setTransactionHash("");
      setPurchaseState("loading");
      setPurchaseError("");
      setCurrentStep("Preparing transaction...");

      if (!event) {
        throw new Error("Event not found");
      }

      const approveAmount = selectedTicketPrice * BigInt(ticketQuantity);

      const sendTx1 = approve({
        contract: usdcContract,
        amount: formatNumber(Number(approveAmount), 6),
        spender: eventContract.address,
      });

      const sendTx2 = prepareContractCall({
        contract: eventContract,
        method:
          "function purchaseTicket(uint256 ticketTypeIndex) external payable",
        params: [BigInt(selectedTicketIndex)],
      });
      await sendCalls({
        calls: [sendTx1, sendTx2],
      });
      refetchUSDTBalance();
      setCurrentStep("Finalizing your NFT tickets...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPurchaseState("success");
      setPurchaseError("");
      setShowNFTModal(true);
      refetchUserTickets();
    } catch (error) {
      console.log("error", error);

      // Only execute the fallback logic if the error contains the specific message
      if (
        error instanceof Error &&
        error.message.includes("Failed to get user operation receipt")
      ) {
        setCurrentStep("Fetching user operations...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
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
              ],
            },
          ],
          queryFilter: {
            fromBlock: "earliest",
            toBlock: "latest",
          },
        });
        const latestLog = logs[0].transactionHash;
        const tx = logs[logs.length - 1];
        console.log({
          latestLog,
          tx: tx.transactionHash,
        });
        if (tx.transactionHash) {
          setTransactionHash(tx.transactionHash);
          setCurrentStep("Finalizing your NFT tickets...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setPurchaseState("success");
          setPurchaseError("");
          setShowNFTModal(true);
          refetchUserTickets();
          return;
        }
      }

      setPurchaseError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setTimeout(() => {
        setPurchaseState("idle");
        setPurchaseError("");
        setCurrentStep("");
      }, 5000);
    }
  };

  const handleBuyTicket = async () => {
    if (!account) {
      signInBottomSheetRef.current?.snapToIndex(0);
      console.log("Please connect your wallet first");
      return;
    }

    // Check if user has enough USDT balance
    if (usdtBalance < totalPrice) {
      setPurchaseState("error");
      setPurchaseError(
        "Insufficient USDT balance. Please get more USDT to purchase tickets."
      );
      setTimeout(() => {
        setPurchaseState("idle");
        setPurchaseError("");
      }, 5000);
      return;
    }

    if (purchaseState === "loading") {
      return; // Prevent multiple clicks
    }

    await purchaseTicket();
  };

  const handleCloseNFTModal = () => {
    setShowNFTModal(false);
    setPurchaseState("idle");
    setPurchaseError("");
    setTransactionHash("");
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
    const usdtPrice = parseFloat(price.toString()) / Math.pow(10, 6);
    return `${usdtPrice.toFixed(2)} USDT`;
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
    <LinearGradient
      colors={["#000000", "#1a1a1a", "#2d2d2d"]}
      style={styles.container}
    >
      <SignInBottomSheet ref={signInBottomSheetRef} />
      {/* NFT Modal */}
      <NFTModal
        visible={showNFTModal}
        onClose={handleCloseNFTModal}
        nftImage={event?.image}
        eventName={event?.name}
        ticketQuantity={ticketQuantity}
        transactionHash={transactionHash}
        onRefetch={refetchUserTickets}
      />

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
              {event.name || `Event #${event.id.slice(-6)}`}
            </Text>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>Live Event</Text>
            </View>
          </View>

          {/* USDT Success Message - Show above the balance card */}
          {!hasTickets && isGetUsdtSuccess && (
            <View style={styles.usdtSuccessContainer}>
              <Text style={styles.usdtSuccessText}>✅ USDT Received!</Text>
            </View>
          )}

          {/* USDT Balance Display - Only show if user hasn't purchased tickets */}
          {!hasTickets && (
            <View style={styles.balanceContainer}>
              <View style={styles.balanceIconContainer}>
                <Text style={styles.balanceIcon}>💰</Text>
              </View>
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Your USDT Balance</Text>
                <Text style={styles.balanceValue}>
                  {!account
                    ? "Connect wallet"
                    : `${
                        parseFloat(usdtBalance.toString()) / Math.pow(10, 6)
                      } USDT`}
                </Text>
                {/* Error messages integrated into balance content */}
                {isGetUsdtError && getUsdtError && (
                  <Text style={styles.balanceErrorText}>
                    ❌ {getUsdtError.message}
                  </Text>
                )}
              </View>
              {account ? (
                <TouchableOpacity
                  style={[
                    styles.getUsdtButton,
                    isGettingUsdt && styles.getUsdtButtonDisabled,
                    isGetUsdtSuccess && styles.getUsdtButtonSuccess,
                    isGetUsdtError && styles.getUsdtButtonError,
                  ]}
                  onPress={() => {
                    getUsdt();
                    refetchUSDTBalance();
                  }}
                  disabled={isGettingUsdt}
                >
                  {isGettingUsdt ? (
                    <View style={styles.getUsdtButtonLoading}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.getUsdtButtonText}>
                        Getting USDT...
                      </Text>
                    </View>
                  ) : isGetUsdtSuccess ? (
                    <Text style={styles.getUsdtButtonText}>
                      USDT Received! ✓
                    </Text>
                  ) : isGetUsdtError ? (
                    <Text style={styles.getUsdtButtonText}>
                      Failed - Try Again
                    </Text>
                  ) : (
                    <Text style={styles.getUsdtButtonText}>Get USDT</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.connectWalletButton}
                  onPress={() => signInBottomSheetRef.current?.snapToIndex(0)}
                >
                  <Text style={styles.connectWalletButtonText}>
                    Connect Wallet
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 3. Ticket Types Section - Only show if user hasn't purchased tickets */}
          {!hasTickets && event.ticketTypes && event.ticketTypes.length > 0 && (
            <View style={styles.ticketTypesCard}>
              <View style={styles.ticketTypesHeader}>
                <Text style={styles.ticketTypesTitle}>🎫 Ticket Types</Text>
                <Text style={styles.ticketTypesSubtitle}>
                  Select your preferred ticket type
                </Text>
              </View>

              <View style={styles.ticketTypesContent}>
                {event.ticketTypes.map((ticketType, index) => {
                  const price = event.ticketPrices?.[index] || "0";
                  const quantity = event.ticketQuantities?.[index] || "0";
                  const isSelected = selectedTicketType === ticketType;

                  return (
                    <TouchableOpacity
                      key={ticketType}
                      style={[
                        styles.ticketTypeOption,
                        isSelected && styles.ticketTypeOptionSelected,
                      ]}
                      onPress={() => setSelectedTicketType(ticketType)}
                    >
                      <View style={styles.ticketTypeContent}>
                        <View style={styles.ticketTypeHeader}>
                          <Text
                            style={[
                              styles.ticketTypeName,
                              isSelected && styles.ticketTypeNameSelected,
                            ]}
                          >
                            {ticketType}
                          </Text>
                          {isSelected && (
                            <View style={styles.selectedIndicator}>
                              <Text style={styles.selectedIndicatorText}>
                                ✓
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.ticketTypeDetails}>
                          <Text
                            style={[
                              styles.ticketTypePrice,
                              isSelected && styles.ticketTypePriceSelected,
                            ]}
                          >
                            {formatPrice(BigInt(price))}
                          </Text>
                          {parseInt(quantity) > 0 && (
                            <Text
                              style={[
                                styles.ticketTypeQuantity,
                                isSelected && styles.ticketTypeQuantitySelected,
                              ]}
                            >
                              {quantity} available
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 4. User Tickets Status */}
          {account && (isLoadingTickets || hasTickets) && (
            <>
              {isLoadingTickets ? (
                <View style={styles.loadingTicketsContainer}>
                  <ActivityIndicator size="small" color="#22c55e" />
                  <Text style={styles.loadingTicketsText}>
                    Checking your tickets...
                  </Text>
                </View>
              ) : hasTickets ? (
                <View style={styles.myTicketsContainer}>
                  <View style={styles.myTicketsHeader}>
                    <Text style={styles.myTicketsIcon}>🎫</Text>
                    <Text style={styles.myTicketsTitle}>My Tickets</Text>
                  </View>

                  <View style={styles.myTicketsContent}>
                    <View style={styles.myTicketsInfo}>
                      <Text style={styles.myTicketsCount}>
                        {ticketCount} Ticket{ticketCount > 1 ? "s" : ""}
                      </Text>
                      <Text style={styles.myTicketsStatus}>✓ Confirmed</Text>
                    </View>

                    <View style={styles.myTicketsDetails}>
                      <View style={styles.myTicketsDetail}>
                        <Text style={styles.myTicketsDetailLabel}>Event</Text>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.myTicketsDetailValue}
                        >
                          {event?.name || "Event"}
                        </Text>
                      </View>

                      <View style={styles.myTicketsDetail}>
                        <Text style={styles.myTicketsDetailLabel}>Status</Text>
                        <Text style={styles.myTicketsDetailValue}>Active</Text>
                      </View>
                    </View>

                    {/* Ticket Types Breakdown */}
                    {Object.keys(ticketsByType).length > 0 && (
                      <View style={styles.ticketTypesBreakdown}>
                        <Text style={styles.ticketTypesBreakdownTitle}>
                          Your Ticket Types
                        </Text>
                        {Object.entries(ticketsByType).map(
                          ([typeIndex, tickets]) => {
                            const typeIndexNum = parseInt(typeIndex);
                            const ticketTypes = event?.ticketTypes || [];
                            const ticketPrices = event?.ticketPrices || [];

                            // Validate that the type index is within bounds
                            const isValidTypeIndex =
                              typeIndexNum >= 0 &&
                              typeIndexNum < ticketTypes.length;

                            const ticketTypeName = isValidTypeIndex
                              ? ticketTypes[typeIndexNum]
                              : `Type ${typeIndexNum + 1}`;

                            const ticketPrice =
                              isValidTypeIndex && ticketPrices[typeIndexNum]
                                ? formatPrice(
                                    BigInt(ticketPrices[typeIndexNum])
                                  )
                                : "Free";

                            return (
                              <View
                                key={typeIndex}
                                style={styles.ticketTypeItem}
                              >
                                <View style={styles.ticketTypeItemHeader}>
                                  <Text style={styles.ticketTypeItemName}>
                                    {ticketTypeName}
                                  </Text>
                                  <Text style={styles.ticketTypeItemCount}>
                                    {tickets.length}{" "}
                                    {tickets.length === 1
                                      ? "ticket"
                                      : "tickets"}
                                  </Text>
                                </View>
                                <View style={styles.ticketTypeItemDetails}>
                                  <Text style={styles.ticketTypeItemPrice}>
                                    {ticketPrice}
                                  </Text>
                                  <Text style={styles.ticketTypeItemIds}>
                                    IDs:{" "}
                                    {tickets
                                      .map((t) => t.ticketId.slice(-4))
                                      .join(", ")}
                                  </Text>
                                </View>
                              </View>
                            );
                          }
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ) : null}
            </>
          )}

          {/* 5. Buy Tickets Section - Only show if user hasn't purchased tickets */}
          {!hasTickets && (
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
                    {formatPrice(totalPrice)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 1. About Section */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionLabel}>About This Event</Text>
            <Text style={styles.eventDescription}>
              {event.description ||
                "An amazing event experience awaits you. Join us for an unforgettable time with great music, food, and entertainment."}
            </Text>
          </View>

          {/* 2. Event Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Event Details</Text>

            <View style={styles.detailCard}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>📅</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatDate(event.startTime)}
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
                  {event.location || "TBA"}
                </Text>
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
                    {formatPrice(selectedTicketPrice)}
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
                    {selectedTicketType
                      ? event?.ticketQuantities?.[selectedTicketIndex] || "0"
                      : event?.ticketQuantities?.[0] || "Unlimited"}
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

      {/* Transaction Progress or Buy Ticket Button */}
      <View style={styles.bottomContainer}>
        {/* Transaction Progress */}
        {purchaseState === "loading" && (
          <TransactionProgress
            currentStep={currentStep}
            ticketQuantity={ticketQuantity}
          />
        )}

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

        {/* Buy Ticket Button - Only show when not loading and user hasn't purchased tickets */}
        {!hasTickets && purchaseState !== "loading" && (
          <TouchableOpacity
            style={[
              styles.buyTicketButton,
              (!account || usdtBalance < totalPrice) &&
                styles.buyTicketButtonDisabled,
              purchaseState === "success" && styles.buyTicketButtonSuccess,
              purchaseState === "error" && styles.buyTicketButtonError,
            ]}
            onPress={handleBuyTicket}
            disabled={usdtBalance < totalPrice}
          >
            <LinearGradient
              colors={
                purchaseState === "success"
                  ? ["#4ade80", "#22c55e"]
                  : purchaseState === "error"
                  ? ["#f87171", "#ef4444"]
                  : account
                  ? ["#22c55e", "#16a34a"]
                  : ["#666666", "#444444"]
              }
              style={styles.buttonGradient}
            >
              <Text style={styles.buyTicketButtonText}>
                {purchaseState === "success"
                  ? "Tickets Purchased!"
                  : purchaseState === "error"
                  ? "Try Again"
                  : !account
                  ? "Connect Wallet to Buy"
                  : usdtBalance < totalPrice
                  ? "Insufficient USDT Balance"
                  : `Buy ${ticketQuantity} Ticket${
                      ticketQuantity > 1 ? "s" : ""
                    }`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

export default EventPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#ff6b6b",
    fontWeight: "600",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 18,
  },
  heroContainer: {
    position: "relative",
    height: 120,
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
    padding: 8,
    gap: 12,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 28,
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
    padding: 14,
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
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  detailsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 10,
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
    marginTop: 12,
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
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  organizerCard: {
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
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  successSubtext: {
    color: "rgba(34, 197, 94, 0.8)",
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  successMessageContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  successMessageText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  // Button state styles
  buyTicketButtonSuccess: {
    opacity: 0.9,
  },
  buyTicketButtonError: {
    opacity: 0.9,
  },
  ticketSelectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ticketSelectionHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  ticketSelectionTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 2,
  },
  ticketSelectionSubtitle: {
    fontSize: 12,
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
    fontSize: 16,
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
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  // Ticket Types Styles
  ticketTypesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ticketTypesHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  ticketTypesTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 2,
  },
  ticketTypesSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  ticketTypesContent: {
    gap: 12,
  },
  ticketTypeOption: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  ticketTypeOptionSelected: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  ticketTypeContent: {
    flex: 1,
  },
  ticketTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketTypeName: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    flex: 1,
  },
  ticketTypeNameSelected: {
    color: "#22c55e",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIndicatorText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  ticketTypeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketTypePrice: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "700",
  },
  ticketTypePriceSelected: {
    color: "#22c55e",
  },
  ticketTypeQuantity: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ticketTypeQuantitySelected: {
    color: "rgba(34, 197, 94, 0.8)",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 16,
  },
  balanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  balanceIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  balanceSuccessText: {
    fontSize: 11,
    color: "#22c55e",
    fontWeight: "500",
    marginTop: 4,
  },
  balanceErrorText: {
    fontSize: 11,
    color: "#ef4444",
    fontWeight: "500",
    marginTop: 4,
  },
  getUsdtButton: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  getUsdtButtonText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  getUsdtButtonDisabled: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.2)",
    opacity: 0.6,
  },
  getUsdtButtonSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.3)",
    borderColor: "rgba(34, 197, 94, 0.5)",
  },
  getUsdtButtonError: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  getUsdtButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectWalletButton: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  connectWalletButtonText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // User Tickets Styles
  userTicketsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 12,
  },
  loadingTicketsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadingTicketsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 8,
  },
  purchasedTicketsContainer: {
    alignItems: "center",
  },
  purchasedTicketsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  purchasedTicketsIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  purchasedTicketsTitle: {
    fontSize: 18,
    color: "#22c55e",
    fontWeight: "600",
  },
  purchasedTicketsSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 12,
  },
  purchasedTicketsBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  purchasedTicketsBadgeText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // My Tickets Styles
  myTicketsContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  myTicketsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  myTicketsIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  myTicketsTitle: {
    fontSize: 18,
    color: "#22c55e",
    fontWeight: "600",
  },
  myTicketsContent: {
    gap: 12,
  },
  myTicketsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  myTicketsCount: {
    fontSize: 16,
    color: "#22c55e",
    fontWeight: "600",
  },
  myTicketsStatus: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "500",
  },
  myTicketsDetails: {
    gap: 8,
  },
  myTicketsDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 8,
  },
  myTicketsDetailLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  myTicketsDetailValue: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500",
    maxWidth: 200,
  },
  // Ticket Types Breakdown Styles
  ticketTypesBreakdown: {
    marginTop: 12,
    gap: 8,
  },
  ticketTypesBreakdownTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  ticketTypeItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ticketTypeItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ticketTypeItemName: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
  ticketTypeItemCount: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ticketTypeItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketTypeItemPrice: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500",
  },
  ticketTypeItemIds: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: "monospace",
  },
  // USDT Success Message Styles
  usdtSuccessContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  usdtSuccessText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
});
