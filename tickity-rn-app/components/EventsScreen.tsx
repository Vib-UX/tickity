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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width, height } = Dimensions.get("window");

// Mock data for categories
const categories = [
  { id: "1", name: "AI", icon: "🧠", color: "#FF69B4" },
  { id: "2", name: "Arts & Culture", icon: "🎨", color: "#90EE90" },
  { id: "3", name: "Climate", icon: "🌍", color: "#90EE90" },
  { id: "4", name: "Technology", icon: "💻", color: "#87CEEB" },
  { id: "5", name: "Music", icon: "🎵", color: "#DDA0DD" },
  { id: "6", name: "Sports", icon: "⚽", color: "#F0E68C" },
];

// Mock data for cities
const cities = [
  {
    id: "3",
    name: "San Francisco",
    image:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: "🌉",
  },
  {
    id: "4",
    name: "London",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: "🏰",
  },
  {
    id: "5",
    name: "New York",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: "🗽",
  },
  {
    id: "1",
    name: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1710582307396-5ca7b4390aa8?q=80&w=1867&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: "🏛️",
  },
  {
    id: "2",
    name: "Bengaluru",
    image:
      "https://images.unsplash.com/photo-1565018054866-968e244671af?q=80&w=2679&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: "🏛️",
  },
];

const EventsScreen = () => {
  const { data, isLoading, error, refetch } = useGetEvents();
  const router = useRouter();

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Text style={styles.categoryIconText}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCityItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.cityCard}>
      <Image source={{ uri: item.image }} style={styles.cityImage} />
      <View style={styles.cityOverlay}>
        <View style={styles.cityIconContainer}>
          <Text style={styles.cityIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.cityName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCalendarItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.calendarCard}
      onPress={() => router.push(`/${item.eventAddress}`)}
    >
      <View style={styles.calendarImageContainer}>
        <Image
          source={{
            uri: item.image,
          }}
          style={styles.calendarImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.calendarInfo}>
        <Text style={styles.calendarTitle}>
          {item.name || `Event #${item.eventAddress}`}
        </Text>
        <Text style={styles.calendarDescription} numberOfLines={2}>
          {item.description || "Amazing event experience awaits you"}
        </Text>
        <Text style={styles.calendarDate}>
          {format(new Date(Number(item.startTime) * 1000), "MMM d, yyyy") ||
            "Coming Soon"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#000000", "#1a1a1a", "#2d2d2d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* Cities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cities</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Text style={styles.viewAllArrow}>→</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={cities}
              renderItem={renderCityItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesList}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* Featured Calendars Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <Text style={styles.sectionSubtitle}>That We Love</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.loadingText}>
                  Loading featured events...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Error loading featured events
                </Text>
              </View>
            ) : (
              <FlatList
                data={(data as any)?.eventCreateds || []}
                renderItem={renderFeaturedCalendarItem}
                horizontal={false}
                scrollEnabled={false}
                contentContainerStyle={styles.calendarsList}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyStateText}>
                    No featured events available
                  </Text>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default EventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 4,
  },
  viewAllArrow: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Categories styles
  categoriesList: {
    paddingRight: 16,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "500",
  },

  // Cities styles
  citiesList: {
    paddingRight: 16,
  },
  cityCard: {
    width: 160,
    height: 100,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  cityImage: {
    width: "100%",
    height: "100%",
  },
  cityOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 12,
  },
  cityIconContainer: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  cityIcon: {
    fontSize: 16,
    color: "#ffffff",
  },
  cityName: {
    position: "absolute",
    bottom: 8,
    left: 8,
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },

  // Featured Calendars styles
  calendarsList: {
    gap: 16,
  },
  calendarCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  calendarImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  calendarImage: {
    width: "100%",
    height: "100%",
  },
  calendarInfo: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 4,
  },
  calendarDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 16,
  },
  calendarDate: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 4,
    fontWeight: "500",
  },

  // Events section styles
  eventsSection: {
    marginTop: 16,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  eventCardContent: {
    flex: 1,
  },
  eventImageContainer: {
    position: "relative",
    height: 120,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventInfo: {
    padding: 16,
    gap: 10,
  },
  eventTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 20,
  },
  eventDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
  },
  eventMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
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
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  viewDetailsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  viewDetailsButtonText: {
    color: "#ffffff",
    fontSize: 12,
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
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: "#ff6b6b",
    textAlign: "center",
  },
});
