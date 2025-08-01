import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThirdwebProvider } from "thirdweb/react";

interface ThirdwebWrapperProps {
  children: React.ReactNode;
}

const ThirdwebWrapper: React.FC<ThirdwebWrapperProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have the required environment variables
    const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID;
    const secretKey = process.env.EXPO_PUBLIC_THIRDWEB_SECRET_KEY;

    if (!clientId || !secretKey) {
      console.warn("Thirdweb credentials not found in environment variables");
      // Still allow the app to continue with fallback values
    }

    setIsInitialized(true);
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Thirdweb initialization failed</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing Thirdweb...</Text>
      </View>
    );
  }

  return <ThirdwebProvider>{children}</ThirdwebProvider>;
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#ff6b6b",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
});

export default ThirdwebWrapper;
