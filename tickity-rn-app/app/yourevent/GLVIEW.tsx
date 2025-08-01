import Robot from "@/components/Robot";
import RobotSecond from "@/components/RobotSecond";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";

const { width } = Dimensions.get("window");

export default function GLVIEWAPP({
  onComplete,
}: {
  onComplete: (uri: string, tmpfile?: string) => void;
}) {
  const [imageUri, setImageUri] = useState<string>("");
  const params = useLocalSearchParams();
  const eventId = params.event as string;
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("front");
  const view_shot = useRef(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [pictureTaken, setPictureTaken] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCapturedImage, setShowCapturedImage] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Animation values
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const progressPulseAnim = useRef(new Animated.Value(1)).current;
  const progressRotateAnim = useRef(new Animated.Value(0)).current;

  const getCheckInStatus = async () => {
    try {
      if (!eventId) return;
      const checkInData = await AsyncStorage.getItem(`checkin_${eventId}`);
      if (checkInData) {
        setIsCheckedIn(true);
      }
    } catch (error) {
      console.error("Error getting check-in status:", error);
    }
  };

  const imageRef = useRef<Image>(null);

  // Check check-in status on component mount
  useEffect(() => {
    getCheckInStatus();
  }, [eventId]);

  const storeCheckIn = async () => {
    try {
      const checkInData = {
        eventId: eventId,
        timestamp: new Date().toISOString(),
        imageUri: capturedUri,
      };
      await AsyncStorage.setItem(
        `checkin_${eventId}`,
        JSON.stringify(checkInData)
      );
      setIsCheckedIn(true);
    } catch (error) {
      console.error("Error storing check-in:", error);
    }
  };

  const startProcessingAnimations = () => {
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startFadeInAnimation = () => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const startProgressAnimations = () => {
    // Pulse animation for progress
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressPulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(progressPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation for progress
    Animated.loop(
      Animated.timing(progressRotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const [capturedBase64, setCapturedBase64] = useState<string>("");
  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri);
    setIsProcessing(true);
    setCurrentStep("Capturing image...");
    startProcessingAnimations();
    startProgressAnimations();

    setTimeout(() => {
      setCurrentStep("Processing AR content...");
      view_shot?.current?.capture().then((uri) => {
        setCapturedUri(uri);
        setCurrentStep("Finalizing your AR experience...");
        setTimeout(() => {
          setPictureTaken(true);
          setIsProcessing(false);
          setShowCapturedImage(true);
          startFadeInAnimation();
        }, 1000);
      });
    }, 2000);
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.iconContainer}>
            <View style={styles.cameraIconWrapper}>
              <AntDesign name="camera" size={48} color="#34C759" />
            </View>
          </View>

          <Text style={styles.permissionTitle}>Camera Access Required</Text>

          <Text style={styles.permissionDescription}>
            Experience the AR realm of Tickity. We need access to your camera to
            capture amazing moments and create your personalized experience.
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <AntDesign name="checkcircle" size={20} color="#34C759" />
              <Text style={styles.featureText}>Take photos and videos</Text>
            </View>
            <View style={styles.featureItem}>
              <AntDesign name="checkcircle" size={20} color="#34C759" />
              <Text style={styles.featureText}>
                Create personalized content
              </Text>
            </View>
            <View style={styles.featureItem}>
              <AntDesign name="checkcircle" size={20} color="#34C759" />
              <Text style={styles.featureText}>Share your experiences</Text>
            </View>
          </View>

          <Pressable style={styles.grantButton} onPress={requestPermission}>
            <Text style={styles.grantButtonText}>Grant Camera Permission</Text>
            <AntDesign name="arrowright" size={20} color="white" />
          </Pressable>

          <Text style={styles.privacyNote}>
            Your privacy is important to us. We only access your camera when
            you're using this feature.
          </Text>
        </View>
      </View>
    );
  }

  const renderPicture = () => {
    return (
      <ViewShot
        ref={view_shot}
        onCapture={(uri) => {
          setImageUri(uri);
        }}
      >
        <Image
          source={{ uri: capturedUri ?? uri }}
          style={{ width: 350, height: 600 }}
        />
        {!pictureTaken && <RobotSecond />}
      </ViewShot>
    );
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={ref}
          mode={mode}
          facing={facing}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        >
          <Robot
            onComplete={() => {
              setShowEditOptions(true);
            }}
          />
        </CameraView>
        {showEditOptions && (
          <View style={styles.shutterContainer}>
            <Pressable onPress={toggleMode}>
              <Text style={styles.buttonText}></Text>
            </Pressable>
            <Pressable onPress={mode === "picture" ? takePicture : () => {}}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.shutterBtn,
                    {
                      opacity: pressed ? 0.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.shutterBtnInner,
                      {
                        backgroundColor: mode === "picture" ? "white" : "red",
                      },
                    ]}
                  />
                </View>
              )}
            </Pressable>
            <Pressable onPress={toggleFacing}>
              <FontAwesome6 name="rotate-left" size={32} color="white" />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}

      {/* Transaction Progress Modal */}
      {isProcessing && (
        <View style={styles.processingModal}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
            style={styles.progressCard}
          >
            {/* Animated Icon */}
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconBackground,
                  {
                    transform: [{ scale: progressPulseAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={["#34C759", "#22c55e"]}
                  style={styles.iconGradient}
                >
                  <Text style={styles.iconText}>📸</Text>
                </LinearGradient>
              </Animated.View>

              {/* Spinning Ring */}
              <Animated.View
                style={[
                  styles.spinningRing,
                  {
                    transform: [
                      {
                        rotate: progressRotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(52, 199, 89, 0.3)",
                    "transparent",
                  ]}
                  style={styles.ringGradient}
                />
              </Animated.View>
            </View>

            {/* Progress Text */}
            <View style={styles.textContainer}>
              <Text style={styles.stepText}>{currentStep}</Text>
              <Text style={styles.subtitleText}>
                Please don't close this screen
              </Text>
            </View>

            {/* Progress Dots */}
            <View style={styles.dotsContainer}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <View
                  key={dot}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        dot <= Math.ceil((currentStep.length / 20) * 5)
                          ? "#34C759"
                          : "rgba(255, 255, 255, 0.2)",
                    },
                  ]}
                />
              ))}
            </View>

            {/* AR Experience Info */}
            <View style={styles.arInfo}>
              <Text style={styles.arText}>Creating your AR experience</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Captured Image Modal */}
      {showCapturedImage && capturedUri && (
        <Animated.View
          style={[
            styles.capturedImageModal,
            {
              opacity: fadeAnimation,
            },
          ]}
        >
          <View style={styles.capturedImageContent}>
            <Text style={styles.capturedImageTitle}>Image Captured!</Text>
            <Image
              ref={imageRef}
              source={{ uri: capturedUri }}
              style={styles.capturedImage}
              resizeMode="contain"
            />
            <Text style={styles.capturedImageDescription}>
              Your AR experience is ready!
            </Text>
            <Pressable
              style={styles.continueButton}
              onPress={async () => {
                await storeCheckIn();
                setShowCapturedImage(false);
                // Capture base64 and pass it to parent
                if (imageRef.current) {
                  captureRef(imageRef, {
                    result: "tmpfile",
                    format: "jpg",
                  }).then((tmpfile) => {
                    // You can pass this base64 to parent if needed
                    setCapturedBase64(tmpfile);
                    onComplete(imageUri, tmpfile);
                  });
                }
              }}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <AntDesign name="arrowright" size={20} color="white" />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  permissionContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 30,
  },
  cameraIconWrapper: {
    backgroundColor: "#1A1A1A",
    borderRadius: 60,
    padding: 20,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 15,
    color: "#FFFFFF",
    textAlign: "center",
  },
  permissionDescription: {
    fontSize: 16,
    textAlign: "center",
    color: "#CCCCCC",
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  grantButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  grantButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  privacyNote: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  processingModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  processingContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    maxWidth: 300,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  processingIconContainer: {
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  processingDescription: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  processingSpinner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#34C759",
    marginHorizontal: 4,
  },
  capturedImageModal: {
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
  capturedImageContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 350,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  capturedImageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  capturedImage: {
    width: 280,
    height: 280,
    borderRadius: 15,
    marginBottom: 20,
  },
  capturedImageDescription: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  // Transaction Progress Styles
  progressCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    gap: 20,
    maxWidth: width - 40,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 32,
  },
  spinningRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  ringGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "transparent",
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
  },
  stepText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
  },
  subtitleText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  arInfo: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.3)",
  },
  arText: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
  },
  // Thank You Screen Styles
  thankYouModal: {
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
  thankYouContent: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 350,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.3)",
  },
  thankYouIconContainer: {
    marginBottom: 20,
  },
  thankYouIcon: {
    fontSize: 64,
  },
  thankYouTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#34C759",
    marginBottom: 15,
    textAlign: "center",
  },
  thankYouDescription: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  thankYouDetails: {
    width: "100%",
    marginBottom: 25,
    gap: 12,
  },
  thankYouDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  thankYouDetailLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  thankYouDetailValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  thankYouButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  thankYouButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  // Already Checked In Screen Styles
  alreadyCheckedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alreadyCheckedInContent: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 350,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.3)",
  },
  alreadyCheckedInIconContainer: {
    marginBottom: 20,
  },
  alreadyCheckedInIcon: {
    fontSize: 64,
  },
  alreadyCheckedInTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#34C759",
    marginBottom: 15,
    textAlign: "center",
  },
  alreadyCheckedInDescription: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  alreadyCheckedInDetails: {
    width: "100%",
    marginBottom: 25,
    gap: 12,
  },
  alreadyCheckedInDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  alreadyCheckedInDetailLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alreadyCheckedInDetailValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  alreadyCheckedInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  alreadyCheckedInButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  // NFT View Button Styles
  thankYouButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  alreadyCheckedInButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  viewNFTButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewNFTButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
