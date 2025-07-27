import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface TransactionProgressProps {
  currentStep: string;
  ticketQuantity: number;
}

function TransactionProgress({
  currentStep,
  ticketQuantity,
}: TransactionProgressProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getStepIcon = (step: string) => {
    if (step.includes("Preparing")) return "⚙️";
    if (step.includes("Minting")) return "🎫";
    if (step.includes("Confirming")) return "⏳";
    if (step.includes("Waiting")) return "🔄";
    if (step.includes("Finalizing")) return "✨";
    return "🔄";
  };

  const getStepColor = (step: string) => {
    if (step.includes("Preparing")) return ["#3b82f6", "#1d4ed8"];
    if (step.includes("Minting")) return ["#8b5cf6", "#7c3aed"];
    if (step.includes("Confirming")) return ["#f59e0b", "#d97706"];
    if (step.includes("Waiting")) return ["#10b981", "#059669"];
    if (step.includes("Finalizing")) return ["#ef4444", "#dc2626"];
    return ["#6b7280", "#4b5563"];
  };

  return (
    <View style={styles.container}>
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
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={getStepColor(currentStep)}
              style={styles.iconGradient}
            >
              <Text style={styles.iconText}>{getStepIcon(currentStep)}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Spinning Ring */}
          <Animated.View
            style={[
              styles.spinningRing,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={["transparent", "rgba(34, 197, 94, 0.3)", "transparent"]}
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
                      ? "#22c55e"
                      : "rgba(255, 255, 255, 0.2)",
                },
              ]}
            />
          ))}
        </View>

        {/* Ticket Quantity Info */}
        <View style={styles.quantityInfo}>
          <Text style={styles.quantityText}>
            Purchasing {ticketQuantity} ticket{ticketQuantity > 1 ? "s" : ""}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  progressCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    gap: 20,
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
    shadowColor: "#22c55e",
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
  quantityInfo: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  quantityText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
});

export default TransactionProgress;
