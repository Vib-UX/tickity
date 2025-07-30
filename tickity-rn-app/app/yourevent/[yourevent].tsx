import SignInBottomSheet, {
  SignInBottomSheetRef,
} from "@/components/bottomsheet/SignInBottomSheet";
import NFTModal from "@/components/NFTModal";
import useGetUserEvents from "@/hooks/useGetUserEvents";
import { Event } from "@/types/event";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useActiveAccount } from "thirdweb/react";

// Define checkout states
type CheckoutState = "initial" | "verifying" | "stepper" | "completed";
type StepperStep = "email" | "location" | "selfie" | "ready";

const YourEventPage = () => {
  const params = useLocalSearchParams();
  const eventId = params.yourevent as string;
  const navigation = useNavigation();
  const account = useActiveAccount();
  const { data, isLoading, error } = useGetUserEvents();
  const signInBottomSheetRef = useRef<SignInBottomSheetRef>(null);

  // State management
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("initial");
  const [currentStepperStep, setCurrentStepperStep] =
    useState<StepperStep>("email");
  const [emailVerified, setEmailVerified] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [showSuccessUI, setShowSuccessUI] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const event = useMemo(() => {
    if (!data || !eventId) return null;
    const events = (data as any)?.events || [];
    const eventWithTickets = events.find(
      (item: any) => item.event.eventAddress === eventId
    );
    return eventWithTickets?.event as Event;
  }, [data, eventId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: event?.name || `Event #${eventId?.slice(-6) || "N/A"}`,
    });
  }, [navigation, eventId, event]);

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

  const handleVerifyEvent = async () => {
    if (!account) {
      signInBottomSheetRef.current?.snapToIndex(0);
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      // Simulate event verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCheckoutState("stepper");
    } catch (error) {
      setVerificationError("Failed to verify event. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailVerification = () => {
    // Simulate email verification
    setEmailVerified(true);
    setCurrentStepperStep("location");
  };

  const handleLocationCheck = async () => {
    try {
      // Check if we're on a device (not simulator)
      if (Platform.OS === "android") {
        // Note: In a real app, you might want to check if running on emulator
        // For now, we'll proceed with location request
      }

      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to verify your presence at the event. Please enable location access in your device settings."
        );
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Simulate location verification (in real app, you'd check against event coordinates)
      console.log("Current location:", location);

      // For demo purposes, we'll assume location is verified
      setLocationVerified(true);
      setCurrentStepperStep("selfie");

      Alert.alert(
        "Location Verified",
        "Your location has been verified successfully!"
      );
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(
        "Location Error",
        "Failed to get your location. Please try again."
      );
    }
  };

  const handleSelfieCapture = () => {
    // Simulate selfie capture
    setSelfieTaken(true);
    setSelfieImage(
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
    );
    setCurrentStepperStep("ready");
  };

  const handleCompleteCheckout = () => {
    setShowNFTModal(true);
  };

  const handleCloseNFTModal = () => {
    setShowNFTModal(false);
    setShowSuccessUI(true);
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
              The event you're looking for doesn't exist or you don't have
              tickets for it.
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

        {/* NFT Modal */}
        <NFTModal
          visible={showNFTModal}
          onClose={handleCloseNFTModal}
          nftImage={event?.image}
          eventName={event?.name}
          ticketQuantity={1}
          transactionHash=""
          onRefetch={() => {}}
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
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.name || `Event #${event.id.slice(-6)}`}
              </Text>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Your Event</Text>
              </View>
            </View>

            {/* Event Details */}
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

              <View style={styles.detailCard}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>🎫</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Your Tickets</Text>
                  <Text style={styles.detailValue}>1 Ticket Confirmed</Text>
                </View>
              </View>
            </View>

            {/* Stepper - Only show after verification starts */}
            {checkoutState !== "initial" && (
              <View style={styles.stepperSection}>
                <Text style={styles.stepperTitle}>Checkout Process</Text>
                <Text style={styles.stepperSubtitle}>
                  Complete these steps to checkout at the event
                </Text>

                <View style={styles.stepperContainer}>
                  {/* Email Verification Step */}
                  <View style={styles.stepContainer}>
                    <View
                      style={[
                        styles.stepIcon,
                        currentStepperStep === "email" && styles.stepIconActive,
                        emailVerified && styles.stepIconCompleted,
                      ]}
                    >
                      <Text style={styles.stepNumber}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Email Verification</Text>
                      <Text style={styles.stepDescription}>
                        Verify your email address for event notifications
                      </Text>
                      {currentStepperStep === "email" && !emailVerified && (
                        <TouchableOpacity
                          style={styles.stepButton}
                          onPress={handleEmailVerification}
                        >
                          <Text style={styles.stepButtonText}>
                            Verify Email
                          </Text>
                        </TouchableOpacity>
                      )}
                      {emailVerified && (
                        <Text style={styles.stepCompleted}>✓ Verified</Text>
                      )}
                    </View>
                  </View>

                  {/* Location Check Step */}
                  <View style={styles.stepContainer}>
                    <View
                      style={[
                        styles.stepIcon,
                        currentStepperStep === "location" &&
                          styles.stepIconActive,
                        locationVerified && styles.stepIconCompleted,
                      ]}
                    >
                      <Text style={styles.stepNumber}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>
                        Location Verification
                      </Text>
                      <Text style={styles.stepDescription}>
                        You need to be within 100m of the event location
                      </Text>
                      {currentStepperStep === "location" &&
                        !locationVerified && (
                          <TouchableOpacity
                            style={styles.stepButton}
                            onPress={handleLocationCheck}
                          >
                            <Text style={styles.stepButtonText}>
                              Check Location
                            </Text>
                          </TouchableOpacity>
                        )}
                      {locationVerified && (
                        <Text style={styles.stepCompleted}>
                          ✓ Location Verified
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Selfie Step */}
                  <View style={styles.stepContainer}>
                    <View
                      style={[
                        styles.stepIcon,
                        currentStepperStep === "selfie" &&
                          styles.stepIconActive,
                        selfieTaken && styles.stepIconCompleted,
                      ]}
                    >
                      <Text style={styles.stepNumber}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Take Selfie</Text>
                      <Text style={styles.stepDescription}>
                        Take a selfie to verify your identity at the event
                      </Text>
                      {currentStepperStep === "selfie" && !selfieTaken && (
                        <TouchableOpacity
                          style={styles.stepButton}
                          onPress={handleSelfieCapture}
                        >
                          <Text style={styles.stepButtonText}>Take Selfie</Text>
                        </TouchableOpacity>
                      )}
                      {selfieTaken && selfieImage && (
                        <View style={styles.selfieContainer}>
                          <Image
                            source={{ uri: selfieImage }}
                            style={styles.selfieImage}
                            resizeMode="cover"
                          />
                          <Text style={styles.stepCompleted}>
                            ✓ Selfie Captured
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Ready Step */}
                  <View style={styles.stepContainer}>
                    <View
                      style={[
                        styles.stepIcon,
                        currentStepperStep === "ready" && styles.stepIconActive,
                        currentStepperStep === "ready" &&
                          styles.stepIconCompleted,
                      ]}
                    >
                      <Text style={styles.stepNumber}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Ready to Checkout</Text>
                      <Text style={styles.stepDescription}>
                        All checks completed. You can now checkout at the event.
                      </Text>
                      {currentStepperStep === "ready" &&
                        emailVerified &&
                        locationVerified &&
                        selfieTaken && (
                          <TouchableOpacity
                            style={styles.transactButton}
                            onPress={handleCompleteCheckout}
                          >
                            <LinearGradient
                              colors={["#22c55e", "#16a34a"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.transactGradient}
                            >
                              <Text style={styles.transactButtonText}>
                                Transact
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        )}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Success UI */}
            {showSuccessUI && (
              <View style={styles.successUISection}>
                <View style={styles.successUIContainer}>
                  <View style={styles.successIconContainer}>
                    <Text style={styles.successIcon}>🎉</Text>
                  </View>
                  <Text style={styles.successTitle}>
                    Successfully Checked In!
                  </Text>
                  <Text style={styles.successSubtitle}>
                    You have been successfully verified and checked in to the
                    event.
                  </Text>

                  <View style={styles.successDetails}>
                    <View style={styles.successDetailItem}>
                      <Text style={styles.successDetailLabel}>Event</Text>
                      <Text
                        style={styles.successDetailValue}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {event?.name || "Event"}
                      </Text>
                    </View>
                    <View style={styles.successDetailItem}>
                      <Text style={styles.successDetailLabel}>
                        Check-in Time
                      </Text>
                      <Text style={styles.successDetailValue}>
                        {new Date().toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={styles.successDetailItem}>
                      <Text style={styles.successDetailLabel}>Status</Text>
                      <Text style={styles.successDetailValue}>Active</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => setShowSuccessUI(false)}
                  >
                    <LinearGradient
                      colors={["#22c55e", "#16a34a"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.continueGradient}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* About Section */}
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionLabel}>About This Event</Text>
              <Text style={styles.eventDescription}>
                {event.description ||
                  "An amazing event experience awaits you. Join us for an unforgettable time with great music, food, and entertainment."}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        {checkoutState === "initial" && (
          <View style={styles.bottomActionContainer}>
            <TouchableOpacity
              style={[
                styles.startVerificationButton,
                isVerifying && styles.startVerificationButtonDisabled,
              ]}
              onPress={handleVerifyEvent}
              disabled={isVerifying}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startVerificationGradient}
              >
                {isVerifying ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <Text style={styles.startVerificationButtonText}>
                    Start Verification
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {verificationError && (
              <Text style={styles.errorText}>{verificationError}</Text>
            )}
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default YourEventPage;

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
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 32,
    flex: 1,
    marginRight: 12,
    flexShrink: 1,
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
    fontSize: 16,
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
  buyTicketButtonSuccess: {
    opacity: 0.9,
  },
  buyTicketButtonError: {
    opacity: 0.9,
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
  // Ticket Types Styles
  ticketTypesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ticketTypesHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  ticketTypesTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 2,
  },
  ticketTypesSubtitle: {
    fontSize: 13,
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
    fontSize: 16,
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
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "700",
  },
  ticketTypePriceSelected: {
    color: "#22c55e",
  },
  ticketTypeQuantity: {
    fontSize: 12,
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
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
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
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
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
    fontSize: 20,
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
    fontSize: 18,
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
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
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
    fontSize: 16,
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
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  ticketTypeItemIds: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: "monospace",
  },
  verifySection: {
    marginTop: 20,
    alignItems: "center",
  },
  verifyTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
  },
  verifySubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: 16,
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  stepperSection: {
    marginTop: 20,
    alignItems: "center",
  },
  stepperTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
  },
  stepperSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: 16,
  },
  stepperContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepIconActive: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  stepIconCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  stepNumber: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 8,
  },

  stepCompleted: {
    fontSize: 12,
    color: "rgba(34, 197, 94, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  startVerificationSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  startVerificationButton: {
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
    width: "100%",
  },
  startVerificationButtonDisabled: {
    opacity: 0.6,
  },
  startVerificationGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  startVerificationButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  stepperSectionInitial: {
    opacity: 0.4,
  },
  stepButton: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    marginTop: 8,
  },
  stepButtonText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transactButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 12,
  },
  transactGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  transactButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  selfieContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  selfieImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  successUISection: {
    marginTop: 20,
  },
  successUIContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
    alignItems: "center",
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    color: "#22c55e",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  successDetails: {
    width: "100%",
    marginBottom: 24,
  },
  successDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  successDetailLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
    marginRight: 8,
  },
  successDetailValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
    flexShrink: 1,
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: "100%",
  },
  continueGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bottomActionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
});
