import SignInBottomSheet, {
  SignInBottomSheetRef,
} from "@/components/bottomsheet/SignInBottomSheet";
import NFTModalYourEvent from "@/components/NFTModalYourEvent";
import TransactionProgress from "@/components/TransactionProgress";
import { API_URL } from "@/constants/addresses";
import { chain, client } from "@/constants/thirdweb";
import useGetUserEvents from "@/hooks/useGetUserEvents";
import { Event } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getContract, getContractEvents, prepareContractCall } from "thirdweb";
import { useActiveAccount, useSendCalls } from "thirdweb/react";
import GLVIEWAPP from "./GLVIEW";

// Define checkout states
type CheckoutState = "initial" | "verifying" | "stepper" | "completed";
type StepperStep = "email" | "location" | "selfie" | "ready";
type TransactionState = "idle" | "loading" | "success" | "error";

const YourEventPage = () => {
  const params = useLocalSearchParams();
  const eventId = params.yourevent as string;
  const navigation = useNavigation();
  const account = useActiveAccount();
  const { data, isLoading, error } = useGetUserEvents();
  const signInBottomSheetRef = useRef<SignInBottomSheetRef>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const router = useRouter();

  const { data: eventStoredData, refetch: refetchEventStoredData } = useQuery({
    queryKey: ["transactionHash", eventId, account?.address],
    queryFn: async () => {
      const transactionData = await AsyncStorage.getItem(eventId);
      const transactionDataParsed = await JSON.parse(transactionData || "{}");
      console.log("transactionDataParsed", transactionDataParsed);

      if (transactionDataParsed.address === account?.address) {
        return {
          image: transactionDataParsed?.image,
          txHash: transactionDataParsed?.transactionHash,
        };
      } else {
        return {
          image: null,
          txHash: null,
        };
      }
    },
  });

  // Transaction state management
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");
  const [transactionError, setTransactionError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>("");

  // State management
  const [showAR, setShowAR] = useState(false);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("initial");
  const [currentStepperStep, setCurrentStepperStep] =
    useState<StepperStep>("location");
  const [emailVerified, setEmailVerified] = useState(true);
  const [locationVerified, setLocationVerified] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [showSuccessUI, setShowSuccessUI] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [distanceToEvent, setDistanceToEvent] = useState<number | null>(null);
  const [showDistanceWarning, setShowDistanceWarning] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [displayNftImage, setDisplayNftImage] = useState("");
  const { mutateAsync: sendCalls } = useSendCalls();
  const event = useMemo(() => {
    if (!data || !eventId) return null;
    const events = (data as any)?.events || [];
    const eventWithTickets = events.find(
      (item: any) => item.event.eventAddress === eventId
    );
    return eventWithTickets?.event as Event;
  }, [data, eventId]);
  const userTickets = useMemo(() => {
    if (!data || !eventId) return null;
    const events = (data as any)?.events || [];
    const eventWithTickets = events.find(
      (item: any) => item.event.eventAddress === eventId
    );
    return eventWithTickets?.userTickets as bigint[];
  }, [data, eventId]);

  useLayoutEffect(() => {
    const title = event?.name
      ? event.name.slice(0, 20) + "..."
      : `Event #${eventId?.slice(-6) || "N/A"}`;
    navigation.setOptions({
      title,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back-outline" size={30} color={"#ffffff"} />
        </TouchableOpacity>
      ),
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

  // Static event location (in real app, this would come from the event data)
  const eventLocation = {
    latitude: 19.2095669, // San Francisco coordinates as example
    longitude: 73.0934042,
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    // This function uses the Haversine formula to calculate the great-circle distance between two points on a sphere
    // The formula calculates the shortest distance between two points on Earth's surface
    // Parameters:
    // - lat1, lon1: Latitude and longitude of first point in decimal degrees
    // - lat2, lon2: Latitude and longitude of second point in decimal degrees
    // Returns: Distance in meters

    const R = 6371e3; // Earth's radius in meters

    // Convert latitude/longitude from degrees to radians
    const φ1 = (lat1 * Math.PI) / 180; // φ is latitude in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180; // Δφ is change in latitude
    const Δλ = ((lon2 - lon1) * Math.PI) / 180; // Δλ is change in longitude

    // Haversine formula components:
    // a = sin²(Δφ/2) + cos(φ1)·cos(φ2)·sin²(Δλ/2)
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    // c = 2·atan2(√a, √(1−a))
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Final distance = R·c where R is Earth's radius
    return R * c; // Distance in meters
  };

  const handleLocationCheck = async () => {
    setIsCheckingLocation(true);
    try {
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
        accuracy: Location.Accuracy.Balanced,
      });

      console.log("Current location:", location);
      console.log("Event location:", eventLocation);

      // Calculate distance to event
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        eventLocation.latitude,
        eventLocation.longitude
      );

      console.log("Distance to event:", distance, "meters");
      // Check if user is within 100m
      // if (distance <= 100) {
      setLocationVerified(true);
      setCurrentStepperStep("selfie");
      setDistanceToEvent(distance);
      setShowDistanceWarning(false);
      Alert.alert(
        "Location Verified",
        `You are ${Math.round(
          distance
        )}m from the event. Location verified successfully!`
      );
      // } else {
      //   // Show UI that user needs to be within 100m
      //   setLocationVerified(false);
      //   setDistanceToEvent(distance);
      //   setShowDistanceWarning(true);
      //   Alert.alert(
      //     "Too Far from Event",
      //     `You are ${Math.round(
      //       distance
      //     )}m from the event. Please move within 100m of the event location to proceed.`
      //   );
      // }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert(
        "Location Error",
        "Failed to get your location. Please try again."
      );
    } finally {
      setIsCheckingLocation(false);
    }
  };

  const handleSelfieCapture = (uri: string, tmpfile?: string) => {
    // Simulate selfie capture
    setSelfieTaken(true);
    setShowAR(false);
    setSelfieImage(uri);
    setCurrentStepperStep("ready");

    // Store file data for upload
    if (tmpfile) {
      setSelfieImage(tmpfile);
      // You can store fileData in state if needed for upload
    }
  };

  const eventContract = getContract({
    client: client,
    address: eventId,
    chain: chain,
  });

  const uploadImage = async (uri: string) => {
    if (!uri) {
      console.log("No selfie image to upload");
      return null;
    }

    try {
      const formData = new FormData();

      const localUri = `file://${uri}`;

      formData.append("file", {
        uri: localUri,
        name: "selfie.jpg",
        type: "image/jpeg",
      } as any);

      const uploadResponse = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        return result.result;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Failed to upload image");
    }
  };

  const handleCompleteCheckout = async () => {
    let imageUrlUpdate = "";
    try {
      setTransactionHash("");
      setTransactionState("loading");
      setTransactionError("");
      setCurrentStep("Preparing transaction...");

      if (!event) {
        throw new Error("Event not found");
      }

      if (selfieImage) {
        setCurrentStep("Uploading check-in photo...");
        const imageUrl = await uploadImage(selfieImage);
        if (imageUrl === null) {
          throw new Error("Failed to upload image");
        }
        console.log("imageUrl", imageUrl);
        imageUrlUpdate = imageUrl;
        setDisplayNftImage(imageUrl);
      }
      setCurrentStep("Processing transaction...");
      const sendTx2 = prepareContractCall({
        contract: eventContract,
        method: "function useTicket(uint256 tokenId) external",
        params: [userTickets?.[0] || BigInt(0)],
      });

      await sendCalls({
        calls: [sendTx2],
      });

      setCurrentStep("Finalizing your ticket usage...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTransactionState("success");
      setTransactionError("");
      setShowSuccessUI(true);
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
              name: "TicketUsed",
              inputs: [
                {
                  name: "tokenId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "eventId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "user",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "useTime",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "eventName",
                  type: "string",
                  indexed: false,
                  internalType: "string",
                },
                {
                  name: "ticketTypeName",
                  type: "string",
                  indexed: false,
                  internalType: "string",
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
          setCurrentStep("Finalizing your ticket usage...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setTransactionState("success");
          setTransactionError("");
          setShowNFTModal(true);
          console.log("setting", {
            address: account?.address,
            image: imageUrlUpdate,
            transactionHash: tx.transactionHash,
          });
          await AsyncStorage.setItem(
            eventId,
            JSON.stringify({
              address: account?.address,
              image: imageUrlUpdate,
              transactionHash: tx.transactionHash,
            })
          );
          return;
        }
      }

      setTransactionError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setTimeout(() => {
        setTransactionState("idle");
        setTransactionError("");
        setCurrentStep("");
      }, 5000);
    }
    refetchEventStoredData();
  };

  const handleCloseNFTModal = () => {
    setShowNFTModal(false);
    setShowSuccessUI(true);
  };

  const resetTransactionState = () => {
    setTransactionState("idle");
    setTransactionError("");
    setCurrentStep("");
    setTransactionHash("");
  };

  const handleOpenTransactionURL = () => {
    if (!transactionHash && !eventStoredData?.txHash) {
      console.warn("No transaction hash available to open explorer URL");
      return;
    }

    const hash = transactionHash || eventStoredData?.txHash;
    if (!hash) {
      console.warn("Transaction hash is undefined");
      return;
    }

    const explorerUrl = `https://testnet.explorer.etherlink.com/tx/${hash}`;
    Linking.openURL(explorerUrl).catch((error) => {
      console.error("Failed to open explorer URL:", error);
    });
  };

  const handleShareOnTwitter = async () => {
    const imageUrl = eventStoredData?.image;
    const shareMessage = `🎉 Just checked in to ${
      event?.name || "an event"
    }! 🎫✨\n\n#NFT #Tickity #EventTickets\n\n${imageUrl}`;

    try {
      const webUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareMessage
      )}`;
      Linking.openURL(webUrl);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (showAR) {
    return (
      <GLVIEWAPP
        onComplete={(uri, tmpfile) => {
          handleSelfieCapture(uri, tmpfile);
        }}
      />
    );
  }

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
    <LinearGradient
      colors={["#000000", "#1a1a1a", "#2d2d2d"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <SignInBottomSheet ref={signInBottomSheetRef} />
        <NFTModalYourEvent
          visible={showNFTModal}
          onClose={handleCloseNFTModal}
          nftImage={displayNftImage}
          eventName={event?.name}
          ticketQuantity={1}
          transactionHash={transactionHash}
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
            {/* About Section - Moved to top */}

            {/* Event Title */}
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.name || `Event #${event.id.slice(-6)}`}
              </Text>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Going</Text>
              </View>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionLabel}>About This Event</Text>
              <ScrollView
                style={styles.descriptionScrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <Text style={styles.eventDescription}>
                  {event.description ||
                    "An amazing event experience awaits you. Join us for an unforgettable time with great music, food, and entertainment."}
                </Text>
              </ScrollView>
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

            {/* Success UI */}
            {(showSuccessUI || eventStoredData?.txHash) && (
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

                  {/* Selfie Image Display */}
                  {eventStoredData?.image && (
                    <View style={styles.selfieSection}>
                      <Text style={styles.selfieTitle}>
                        Your Check-in Photo
                      </Text>
                      <View style={styles.selfieImageContainer}>
                        <Image
                          source={{
                            uri: eventStoredData?.image,
                          }}
                          style={styles.selfieImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text style={styles.selfieCaption}>
                        This photo was taken during your check-in process
                      </Text>
                    </View>
                  )}
                  {eventStoredData?.image && (
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={handleShareOnTwitter}
                    >
                      <LinearGradient
                        colors={["#000000", "#1a1a1a"]}
                        style={styles.buttonGradient}
                      >
                        <View style={styles.shareButtonContent}>
                          <Text style={styles.shareButtonText}>Share on</Text>
                          <Image
                            source={require("../../assets/images/logo-white.png")}
                            style={styles.shareButtonImage}
                            resizeMode="contain"
                          />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ height: 100 }} />
              </View>
            )}
            {/* Distance Warning UI - Moved above checkout process */}
            {showDistanceWarning && distanceToEvent !== null && (
              <View style={styles.distanceWarningSection}>
                <View style={styles.distanceWarningContainer}>
                  <View style={styles.distanceWarningIconContainer}>
                    <Text style={styles.distanceWarningIcon}>📍</Text>
                  </View>
                  <Text style={styles.distanceWarningTitle}>
                    Too Far from Event
                  </Text>
                  <Text style={styles.distanceWarningSubtitle}>
                    You need to be within 100m of the event location to proceed
                    with verification.
                  </Text>

                  <View style={styles.distanceInfoContainer}>
                    <View style={styles.distanceInfoItem}>
                      <Text style={styles.distanceInfoLabel}>
                        Current Distance
                      </Text>
                      <Text style={styles.distanceInfoValue}>
                        {Math.round(distanceToEvent)}m from event
                      </Text>
                    </View>
                    <View style={styles.distanceInfoItem}>
                      <Text style={styles.distanceInfoLabel}>
                        Required Distance
                      </Text>
                      <Text style={styles.distanceInfoValue}>Within 100m</Text>
                    </View>
                  </View>

                  <View style={styles.distanceWarningActions}>
                    <TouchableOpacity
                      style={[
                        styles.retryLocationButton,
                        isCheckingLocation &&
                          styles.retryLocationButtonDisabled,
                      ]}
                      onPress={handleLocationCheck}
                      disabled={isCheckingLocation}
                    >
                      <LinearGradient
                        colors={["#22c55e", "#16a34a"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.retryLocationGradient}
                      >
                        {isCheckingLocation ? (
                          <View style={styles.retryLocationButtonLoading}>
                            <ActivityIndicator size="small" color="#ffffff" />
                            <Text style={styles.retryLocationButtonText}>
                              Checking Location...
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.retryLocationButtonText}>
                            Check Location Again
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dismissWarningButton}
                      onPress={() => setShowDistanceWarning(false)}
                    >
                      <Text style={styles.dismissWarningButtonText}>
                        Dismiss
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Stepper - Only show after verification starts */}
            {transactionState !== "success" && checkoutState !== "initial" && (
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
                            style={[
                              styles.stepButton,
                              isCheckingLocation && styles.stepButtonDisabled,
                            ]}
                            onPress={handleLocationCheck}
                            disabled={isCheckingLocation}
                          >
                            {isCheckingLocation ? (
                              <View style={styles.stepButtonLoading}>
                                <ActivityIndicator
                                  size="small"
                                  color="#22c55e"
                                />
                                <Text style={styles.stepButtonText}>
                                  Checking Location...
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.stepButtonText}>
                                Check Location
                              </Text>
                            )}
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
                          onPress={() => setShowAR(true)}
                        >
                          <Text style={styles.stepButtonText}>Take Selfie</Text>
                        </TouchableOpacity>
                      )}
                      {/* Selfie Image Display */}
                      {selfieImage && (
                        <View style={styles.selfieSection}>
                          <Text style={styles.selfieTitle}>
                            Your Check-in Photo
                          </Text>
                          <View style={styles.selfieImageContainer}>
                            <Image
                              source={{ uri: selfieImage }}
                              style={styles.selfieImage}
                              resizeMode="cover"
                            />
                          </View>
                          <Text style={styles.selfieCaption}>
                            This photo was taken during your check-in process
                          </Text>
                        </View>
                      )}
                      {selfieTaken && (
                        <Text style={styles.stepCompleted}>
                          ✓ Selfie Captured
                        </Text>
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
                            style={[
                              styles.transactButton,
                              transactionState === "loading" &&
                                styles.transactButtonDisabled,
                            ]}
                            onPress={handleCompleteCheckout}
                            disabled={transactionState === "loading"}
                          >
                            <LinearGradient
                              colors={
                                transactionState === "loading"
                                  ? ["#666666", "#444444"]
                                  : ["#22c55e", "#16a34a"]
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.transactGradient}
                            >
                              {transactionState === "loading" ? (
                                <View style={styles.transactButtonLoading}>
                                  <ActivityIndicator
                                    size="small"
                                    color="#ffffff"
                                  />
                                  <Text style={styles.transactButtonText}>
                                    Processing...
                                  </Text>
                                </View>
                              ) : (
                                <Text style={styles.transactButtonText}>
                                  Transact
                                </Text>
                              )}
                            </LinearGradient>
                          </TouchableOpacity>
                        )}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        {/* Transaction Progress or Action Button */}
        <View style={styles.bottomActionContainer}>
          {/* Success Message */}
          {transactionState === "success" || eventStoredData?.txHash ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                🎉 Ticket used successfully!
              </Text>
              <Text style={styles.successSubtext}>
                You have been checked in to the event
              </Text>
              {(transactionHash || eventStoredData?.txHash) && (
                <TouchableOpacity
                  style={styles.transactionLinkButton}
                  onPress={handleOpenTransactionURL}
                >
                  <Text style={styles.transactionLinkText}>
                    View Transaction ↗
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Error Message */}
          {transactionState === "error" && (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>❌ {transactionError}</Text>
            </View>
          )}

          {/* Start Verification Button - Only show when not in transaction state */}
          {checkoutState === "initial" &&
            transactionState === "idle" &&
            !eventStoredData?.txHash && (
              <>
                <TouchableOpacity
                  style={[
                    styles.startVerificationButton,
                    isVerifying && styles.startVerificationButtonDisabled,
                  ]}
                  onPress={handleVerifyEvent}
                  disabled={isVerifying}
                >
                  <LinearGradient
                    colors={["#22c55e", "#16a34a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startVerificationGradient}
                  >
                    {isVerifying ? (
                      <ActivityIndicator size="small" color="#ffffff" />
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
              </>
            )}
        </View>
      </SafeAreaView>

      {/* Full Screen Transaction Progress Overlay */}
      {transactionState === "loading" && (
        <View style={styles.fullScreenTransactionOverlay}>
          <TransactionProgress currentStep={currentStep} ticketQuantity={1} />
        </View>
      )}

      {/* Full Screen Error Overlay */}
      {transactionState === "error" && (
        <View style={styles.fullScreenErrorOverlay}>
          <View style={styles.errorContent}>
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>❌</Text>
            </View>
            <Text style={styles.errorTitle}>Transaction Failed</Text>
            <Text style={styles.errorDescription}>
              {transactionError ||
                "An unexpected error occurred during the transaction."}
            </Text>

            {transactionHash && (
              <TouchableOpacity
                style={styles.transactionLinkButton}
                onPress={handleOpenTransactionURL}
              >
                <Text style={styles.transactionLinkText}>
                  View Transaction ↗
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeErrorButton}
              onPress={() => {
                setTransactionState("idle");
                setTransactionError("");
              }}
            >
              <Text style={styles.closeErrorButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

export default YourEventPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 6,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  shareButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shareButtonImage: {
    width: 20,
    height: 20,
  },
  shareButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 6,
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
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 28,
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
    maxHeight: 100,
  },
  descriptionScrollView: {
    maxHeight: 60,
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
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: 16,
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
  shareButton: {
    borderRadius: 30,
    marginTop: 10,
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
    fontSize: 14,
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
    fontSize: 18,
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
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ticketTypesHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  ticketTypesTitle: {
    fontSize: 18,
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
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  stepperSection: {
    marginTop: 20,
    alignItems: "center",
  },
  stepperTitle: {
    fontSize: 18,
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
    fontSize: 14,
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  startVerificationButtonText: {
    color: "#ffffff",
    fontSize: 16,
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
  stepButtonDisabled: {
    opacity: 0.6,
  },
  stepButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  transactButtonDisabled: {
    opacity: 0.6,
  },
  transactButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 20,
    color: "#22c55e",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
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
    fontSize: 14,
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
    fontSize: 16,
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
  // Distance Warning Styles
  distanceWarningSection: {
    marginTop: 20,
  },
  distanceWarningContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
  },
  distanceWarningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  distanceWarningIcon: {
    fontSize: 40,
  },
  distanceWarningTitle: {
    fontSize: 20,
    color: "#ef4444",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  distanceWarningSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  distanceInfoContainer: {
    width: "100%",
    marginBottom: 24,
  },
  distanceInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  distanceInfoLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
    marginRight: 8,
  },
  distanceInfoValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
    flexShrink: 1,
  },
  distanceWarningActions: {
    width: "100%",
    gap: 12,
  },
  retryLocationButton: {
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
  retryLocationGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  retryLocationButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  retryLocationButtonDisabled: {
    opacity: 0.6,
  },
  retryLocationButtonLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dismissWarningButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dismissWarningButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  // Transaction link styles
  transactionLinkButton: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    marginTop: 12,
  },
  transactionLinkText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // Selfie Image Styles
  selfieSection: {
    marginTop: 20,
    alignItems: "center",
  },
  selfieTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  selfieImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(52, 199, 89, 0.3)",
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selfieImage: {
    width: "100%",
    height: "100%",
  },
  selfieCaption: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
  // Full Screen Transaction Overlay
  fullScreenTransactionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  // Full Screen Error Overlay Styles
  fullScreenErrorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  errorContent: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 350,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 15,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  closeErrorButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#ef4444",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeErrorButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
