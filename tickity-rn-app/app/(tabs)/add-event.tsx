import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "../../components/useColorScheme";
import Colors from "../../constants/Colors";

interface EventFormData {
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  ticketTypes: string[];
  ticketPrices: string[];
  ticketQuantities: string[];
  image: string;
}

const AddEvent = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme as keyof typeof Colors] ?? Colors.light;

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    ticketTypes: [""],
    ticketPrices: [""],
    ticketQuantities: [""],
    image: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, ""],
      ticketPrices: [...prev.ticketPrices, ""],
      ticketQuantities: [...prev.ticketQuantities, ""],
    }));
  };

  const removeTicketType = (index: number) => {
    if (formData.ticketTypes.length > 1) {
      setFormData((prev) => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
        ticketPrices: prev.ticketPrices.filter((_, i) => i !== index),
        ticketQuantities: prev.ticketQuantities.filter((_, i) => i !== index),
      }));
    }
  };

  const updateTicketField = (
    index: number,
    field: "ticketTypes" | "ticketPrices" | "ticketQuantities",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Event name is required");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Event description is required");
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert("Error", "Event location is required");
      return false;
    }
    if (!formData.startTime) {
      Alert.alert("Error", "Start time is required");
      return false;
    }
    if (!formData.endTime) {
      Alert.alert("Error", "End time is required");
      return false;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      Alert.alert("Error", "End time must be after start time");
      return false;
    }

    for (let i = 0; i < formData.ticketTypes.length; i++) {
      if (!formData.ticketTypes[i].trim()) {
        Alert.alert("Error", `Ticket type ${i + 1} is required`);
        return false;
      }
      if (
        !formData.ticketPrices[i] ||
        parseFloat(formData.ticketPrices[i]) <= 0
      ) {
        Alert.alert(
          "Error",
          `Valid price for ticket type ${i + 1} is required`
        );
        return false;
      }
      if (
        !formData.ticketQuantities[i] ||
        parseInt(formData.ticketQuantities[i]) <= 0
      ) {
        Alert.alert(
          "Error",
          `Valid quantity for ticket type ${i + 1} is required`
        );
        return false;
      }
    }

    return true;
  };

  const handleImageUpload = () => {
    // TODO: Implement image picker functionality
    Alert.alert(
      "Image Upload",
      "Image upload functionality will be implemented here. For now, you can enter an image URL.",
      [{ text: "OK" }]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement actual API call to create event

      Alert.alert("Success", "Event created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setFormData({
              name: "",
              description: "",
              location: "",
              startTime: "",
              endTime: "",
              ticketTypes: [""],
              ticketPrices: [""],
              ticketQuantities: [""],
              image: "",
            });
            setSelectedImage(null);
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Create New Event
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Fill in the details below to create your event
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <View style={styles.imageSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📷 Event Image
              </Text>
              <Text
                style={[
                  styles.imageSectionSubtitle,
                  { color: colorScheme === "dark" ? "#888" : "#666" },
                ]}
              >
                Start by adding a beautiful image for your event
              </Text>
            </View>

            {/* Image Preview */}
            {(selectedImage || formData.image) && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage || formData.image }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.imageInfo}>
                    <Text style={styles.imageInfoText}>Event Image</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setSelectedImage(null);
                    updateFormData("image", "");
                  }}
                >
                  <Text style={styles.removeImageButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1a1a1a" : "#ffffff",
                  borderColor: colorScheme === "dark" ? "#333" : "#e0e0e0",
                },
              ]}
              onPress={handleImageUpload}
            >
              <View style={styles.uploadContent}>
                <Text style={[styles.uploadIcon, { color: colors.text }]}>
                  📷
                </Text>
                <View style={styles.uploadTextContainer}>
                  <Text
                    style={[styles.uploadButtonText, { color: colors.text }]}
                  >
                    Start Here - Upload Event Image
                  </Text>
                  <Text
                    style={[
                      styles.uploadSubtext,
                      { color: colorScheme === "dark" ? "#888" : "#666" },
                    ]}
                  >
                    Choose a beautiful image to showcase your event
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Image URL Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Or enter image URL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                    color: colors.text,
                    borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                  },
                ]}
                value={formData.image}
                onChangeText={(text) => updateFormData("image", text)}
                placeholder="Enter image URL (optional)"
                placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Event Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                  color: colors.text,
                  borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                },
              ]}
              value={formData.name}
              onChangeText={(text) => updateFormData("name", text)}
              placeholder="Enter event name"
              placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
            />
          </View>

          {/* Event Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Description *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                  color: colors.text,
                  borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                },
              ]}
              value={formData.description}
              onChangeText={(text) => updateFormData("description", text)}
              placeholder="Describe your event"
              placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Location *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                  color: colors.text,
                  borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                },
              ]}
              value={formData.location}
              onChangeText={(text) => updateFormData("location", text)}
              placeholder="Enter event location"
              placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
            />
          </View>

          {/* Date and Time */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>
                Start Time *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                    color: colors.text,
                    borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                  },
                ]}
                value={formData.startTime}
                onChangeText={(text) => updateFormData("startTime", text)}
                placeholder="YYYY-MM-DD HH:MM"
                placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>
                End Time *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                    color: colors.text,
                    borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                  },
                ]}
                value={formData.endTime}
                onChangeText={(text) => updateFormData("endTime", text)}
                placeholder="YYYY-MM-DD HH:MM"
                placeholderTextColor={colorScheme === "dark" ? "#666" : "#999"}
              />
            </View>
          </View>

          {/* Ticket Types Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Ticket Types
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addTicketType}
              >
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8"]}
                  style={styles.addButtonGradient}
                >
                  <Text style={styles.addButtonText}>+ Add Type</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {formData.ticketTypes.map((type, index) => (
              <View key={index} style={styles.ticketTypeContainer}>
                <View style={styles.ticketTypeHeader}>
                  <Text
                    style={[styles.ticketTypeTitle, { color: colors.text }]}
                  >
                    Ticket Type {index + 1}
                  </Text>
                  {formData.ticketTypes.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeTicketType(index)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Type Name *
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                          color: colors.text,
                          borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                        },
                      ]}
                      value={type}
                      onChangeText={(text) =>
                        updateTicketField(index, "ticketTypes", text)
                      }
                      placeholder="e.g., VIP, General"
                      placeholderTextColor={
                        colorScheme === "dark" ? "#666" : "#999"
                      }
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Price (USDT) *
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                          color: colors.text,
                          borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                        },
                      ]}
                      value={formData.ticketPrices[index]}
                      onChangeText={(text) =>
                        updateTicketField(index, "ticketPrices", text)
                      }
                      placeholder="0.00"
                      placeholderTextColor={
                        colorScheme === "dark" ? "#666" : "#999"
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Quantity *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
                        color: colors.text,
                        borderColor: colorScheme === "dark" ? "#333" : "#ddd",
                      },
                    ]}
                    value={formData.ticketQuantities[index]}
                    onChangeText={(text) =>
                      updateTicketField(index, "ticketQuantities", text)
                    }
                    placeholder="Number of tickets"
                    placeholderTextColor={
                      colorScheme === "dark" ? "#666" : "#999"
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={
                isSubmitting ? ["#666666", "#444444"] : ["#22c55e", "#16a34a"]
              }
              style={styles.buttonGradient}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Creating Event..." : "Create Event"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  ticketTypeContainer: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ticketTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketTypeTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: "#ff4444",
    fontWeight: "600",
  },
  submitButton: {
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
    marginTop: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  uploadButton: {
    height: 80,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  uploadContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  uploadTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  uploadSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  imageInfo: {
    alignItems: "center",
  },
  imageInfoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  imageSectionHeader: {
    marginBottom: 16,
  },
  imageSectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
