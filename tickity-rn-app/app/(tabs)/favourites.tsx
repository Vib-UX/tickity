import AnimatedNFTCard from "@/components/AnimatedNFTCard";
import useGetUserNFTs from "@/hooks/useGetUserNFTs";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const Favourites = () => {
  const { nfts, hasNFTs, nftCount, isLoading, error, refetch } =
    useGetUserNFTs();

  const renderNFTCard = ({ item, index }: { item: any; index: number }) => (
    <AnimatedNFTCard
      ticketId={item.ticketId}
      ticketType={item.ticketType}
      eventName={item.eventName}
      eventImage={item.eventImage}
      purchaseDate={item.purchaseDate}
      tokenURI={item.tokenURI}
      metadata={item.metadata}
      index={index}
      onPress={() => {
        // Navigate to NFT details or event page
        router.push(`/yourevent/${item.eventAddress}`);
      }}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.emptyGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.emptyContent}>
          <Text style={styles.emptyEmoji}>🎫</Text>
          <Text style={styles.emptyTitle}>No NFTs Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your minted NFTs will appear here
          </Text>
          <Text style={styles.emptyDescription}>
            Purchase tickets to events and they'll be displayed as beautiful
            NFTs in your collection
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My NFT Collection</Text>
      <Text style={styles.subtitle}>
        {hasNFTs
          ? `You have ${nftCount} minted NFT${nftCount !== 1 ? "s" : ""}`
          : "Your minted NFTs will appear here"}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading your NFTs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "Failed to load your NFTs"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasNFTs ? (
        <FlatList
          data={nfts}
          renderItem={renderNFTCard}
          keyExtractor={(item) => item.ticketId}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#fff"
              colors={["#fff"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.container}>
          {renderHeader()}
          {renderEmptyState()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyGradient: {
    borderRadius: 20,
    padding: 2,
    width: "100%",
    maxWidth: 300,
  },
  emptyContent: {
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default Favourites;
