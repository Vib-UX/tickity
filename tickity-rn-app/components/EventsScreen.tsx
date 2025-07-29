import useGetEvents from "@/hooks/useGetEvents";
import { Event } from "@/types/event";
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
const { width, height } = Dimensions.get("window");

const EventsScreen = () => {
  const { data, isLoading, error } = useGetEvents();
  const router = useRouter();

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={styles.eventCardContent}>
        <View style={styles.eventImageContainer}>
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>
            {item.name || `Event #${item.eventAddress}`}
          </Text>
          <Text style={styles.eventDescription}>
            {item.description || "Amazing event experience awaits you"}
          </Text>

          <View style={styles.eventMetaRow}>
            <View style={styles.eventMetaItem}>
              <Text style={styles.eventMetaLabel}>Date</Text>
              <Text style={styles.eventMetaValue}>
                {format(
                  new Date(Number(item.startTime) * 1000),
                  "MMM d, yyyy"
                ) || "Coming Soon"}
              </Text>
            </View>
            <View style={styles.eventMetaItem}>
              <Text style={styles.eventMetaLabel}>ID</Text>
              <Text style={styles.eventMetaValue}>#{item.id.slice(-6)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => router.push(`/${item.eventAddress}`)}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
              data={(data as any)?.eventCreateds || []}
              renderItem={renderEventItem}
              ListHeaderComponent={() => (
                <View style={styles.eventsHeader}>
                  <Text style={styles.eventsTitle}>Discover Events</Text>
                  <Text style={styles.eventsSubtitle}>
                    Discover amazing events happening around you
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
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

export default EventsScreen;

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
    marginBottom: 24,
    marginTop: 10,
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
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 22,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    width: "100%",
  },
  eventCardContent: {
    flex: 1,
  },
  eventImageContainer: {
    position: "relative",
    height: 160,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  eventInfo: {
    padding: 20,
    gap: 12,
  },
  eventTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 24,
  },
  eventDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  eventMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  eventMetaItem: {
    flex: 1,
  },
  eventMetaLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  eventMetaValue: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500",
  },
  viewDetailsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  viewDetailsButtonText: {
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
    fontSize: 16,
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
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
  },
});
