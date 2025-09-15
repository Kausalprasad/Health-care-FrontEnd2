import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "../../config/config";

const { width } = Dimensions.get("window");

export default function CosmeticScreen({ navigation }) {
  const [skinType, setSkinType] = useState("oily");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Pick image from gallery or camera
  const pickPhoto = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert("Permission needed", "Please allow permissions to continue!");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      setShowImageOptions(false);
      // Auto analyze after selecting image
      handlePredict(result.assets[0].uri);
    }
  };

  // Upload and predict using fetch
  const handlePredict = async (imageUri = null) => {
    const uri = imageUri || image;
    if (!uri) return Alert.alert("No Image", "Please select or capture an image first!");

    setLoading(true);

    const formData = new FormData();
    formData.append("image", {
      uri: uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    formData.append("skin_type", skinType);

    try {
      const response = await fetch(`${BASE_URL}/api/cosmetic/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();
      console.log("✅ Cosmetic prediction result:", data);
      setResult(data);
    } catch (err) {
      console.error("Cosmetic prediction error:", err);
      Alert.alert("Error", "Prediction failed. Please try again!");
      setResult({ error: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  // Get skin type info
  const getSkinTypeInfo = (type) => {
    const skinTypes = {
      oily: {
        icon: "water",
        color: "#2196F3",
        title: "Oily Skin",
        description: "Produces excess sebum, often shiny with enlarged pores",
      },
      dry: {
        icon: "leaf-outline",
        color: "#FF9800",
        title: "Dry Skin",
        description: "Lacks moisture, may feel tight or flaky",
      },
      normal: {
        icon: "sparkles",
        color: "#4CAF50",
        title: "Normal Skin",
        description: "Well-balanced, neither too oily nor too dry",
      },
    };
    return skinTypes[type] || skinTypes.normal;
  };

  // Get condition info
  const getConditionInfo = (condition) => {
    const conditions = {
      eyebags: {
        icon: "eye-outline",
        color: "#9C27B0",
        title: "Eye Bags",
        description: "Puffiness or swelling under the eyes",
      },
      acne: {
        icon: "alert-circle-outline",
        color: "#FF5722",
        title: "Acne",
        description: "Inflammatory skin condition with breakouts",
      },
      wrinkles: {
        icon: "time-outline",
        color: "#795548",
        title: "Wrinkles",
        description: "Fine lines and aging signs",
      },
      dark_spots: {
        icon: "contrast-outline",
        color: "#607D8B",
        title: "Dark Spots",
        description: "Hyperpigmentation and uneven skin tone",
      },
    };
    return conditions[condition?.toLowerCase()] || {
      icon: "medical-outline",
      color: "#9C27B0",
      title: condition || "Analyzed",
      description: "Skin condition detected",
    };
  };

  // Render result with same structure as tongue checker
  const renderValue = (value, key) => {
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
      return (
        <View key={key} style={{ marginTop: 8 }}>
          <Text style={styles.resultSectionTitle}>{key}:</Text>
          {value.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons
                name="ellipse"
                size={6}
                color="#7475B4"
                style={{ marginTop: 8, marginRight: 8 }}
              />
              <Text style={styles.resultDetailText}>{String(item)}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (typeof value === "object") {
      return (
        <View key={key} style={{ marginTop: 8 }}>
          <Text style={styles.resultSectionTitle}>{key}:</Text>
          {Object.entries(value).map(([subKey, subValue]) => (
            <View key={subKey} style={{ marginLeft: 12, marginTop: 4 }}>
              <Text style={styles.resultDetailText}>
                <Text style={{ fontWeight: "600" }}>{subKey}:</Text>{" "}
                {String(subValue)}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View key={key} style={{ marginTop: 8 }}>
        <Text style={styles.resultSectionTitle}>{key}:</Text>
        <Text style={styles.resultDetailText}>{String(value)}</Text>
      </View>
    );
  };

  const renderResult = () => {
    if (!result) return null;
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="medical" size={32} color="#7475B4" />
          <Text style={styles.resultTitle}>Analysis Result</Text>
        </View>
        <View style={styles.resultContent}>
          {Object.entries(result)
            .filter(([key]) => key !== "error")
            .map(([key, value]) => renderValue(value, key))}
          <Text style={styles.recommendationText}>
            ⚠️ This analysis is for guidance only and should not replace professional skincare consultation.
            Always consult with a dermatologist for serious skin concerns.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newAnalysisButton}
          onPress={() => setShowImageOptions(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color="#7475B4" />
          <Text style={styles.newAnalysisText}>Analyze Another Photo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header - Same as tongue checker */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skin Condition Detector</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card - Same as tongue checker */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#7475B4" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Our AI analyzes your skin image to detect possible signs of
            various skin conditions. For best results, take a clear photo in
            good lighting.
          </Text>
        </View>

        {/* Skin Type Selector - Updated to Card Selection */}
        <View style={styles.skinTypeSection}>
          <Text style={styles.sectionTitle}>Select your skin type</Text>
          
          <View style={styles.skinTypeCardsContainer}>
            {/* Oily Skin Card */}
            <TouchableOpacity
              style={[
                styles.skinTypeSelectCard,
                skinType === 'oily' && styles.selectedCard
              ]}
              onPress={() => setSkinType('oily')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons 
                  name="water" 
                  size={32} 
                  color={skinType === 'oily' ? "#2196F3" : "#666"} 
                />
              </View>
              <Text style={[
                styles.cardTitle,
                skinType === 'oily' && styles.selectedCardTitle
              ]}>
                Oily Skin
              </Text>
            </TouchableOpacity>

            {/* Normal Skin Card */}
            <TouchableOpacity
              style={[
                styles.skinTypeSelectCard,
                skinType === 'normal' && styles.selectedCard
              ]}
              onPress={() => setSkinType('normal')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons 
                  name="sparkles" 
                  size={32} 
                  color={skinType === 'normal' ? "#4CAF50" : "#666"} 
                />
              </View>
              <Text style={[
                styles.cardTitle,
                skinType === 'normal' && styles.selectedCardTitle
              ]}>
                Normal Skin
              </Text>
            </TouchableOpacity>

            {/* Dry Skin Card */}
            <TouchableOpacity
              style={[
                styles.skinTypeSelectCard,
                skinType === 'dry' && styles.selectedCard
              ]}
              onPress={() => setSkinType('dry')}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons 
                  name="leaf-outline" 
                  size={32} 
                  color={skinType === 'dry' ? "#FF9800" : "#666"} 
                />
              </View>
              <Text style={[
                styles.cardTitle,
                skinType === 'dry' && styles.selectedCardTitle
              ]}>
                Dry Skin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload Section - Same as tongue checker */}
        {!image ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera-outline" size={64} color="#000000" />
            </View>
            <Text style={styles.uploadTitle}>Upload Your Skin Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Take a clear photo of your skin or choose from gallery
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowImageOptions(true)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.uploadButtonGradient,
                  { backgroundColor: "#7475B4" },
                ]}
              >
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Select Photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Uploaded Image</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => setShowImageOptions(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#7475B4" />
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading - Same as tongue checker */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7475B4" />
            <Text style={styles.loadingText}>Analyzing your skin photo...</Text>
            <Text style={styles.loadingSubtext}>
              This may take a few seconds
            </Text>
          </View>
        )}

        {/* Error State */}
        {result?.error && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="warning-outline" size={32} color="#FF5722" />
              <Text style={styles.resultTitle}>Analysis Failed</Text>
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultDetailText}>{result.error}</Text>
            </View>
            <TouchableOpacity
              style={styles.newAnalysisButton}
              onPress={() => {
                setResult(null);
                setImage(null);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color="#7475B4" />
              <Text style={styles.newAnalysisText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result - Same structure as tongue checker */}
        {renderResult()}

        {/* Tips Section - Same as tongue checker */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Photography Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Use natural lighting or bright indoor light</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Show the skin area clearly in the frame</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Focus on areas of concern</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Avoid shadows and reflections</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal - Same as tongue checker */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Photo Source</Text>
              <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickPhoto(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="camera" size={28} color="#2196F3" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>
                  Use camera to capture skin photo
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickPhoto(false)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E8F5E8" }]}>
                <Ionicons name="images" size={28} color="#4CAF50" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>
                  Select existing photo from gallery
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.modalNote}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.modalNoteText}>Your photos are processed securely and not stored</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#7475B4",
  },
  backButton: { 
    padding: 8 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#fff" 
  },
  placeholder: { 
    width: 40 
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7475B4",
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  skinTypeSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  // New Card-based Selection Styles
  skinTypeCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  skinTypeSelectCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  selectedCard: {
    borderColor: "#7475B4",
    backgroundColor: "#F8F9FF",
  },
  cardIconContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  selectedCardTitle: {
    color: "#7475B4",
  },
  uploadSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: "#EAEAF8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  uploadButton: {
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  imageSection: {
    marginBottom: 25,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: width - 80,
    height: width - 80,
    borderRadius: 15,
    marginBottom: 15,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    borderRadius: 20,
  },
  changeImageText: {
    fontSize: 14,
    color: "#7475B4",
    fontWeight: "600",
    marginLeft: 5,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  resultContent: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    backgroundColor: "#F8F9FF",
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7475B4",
    marginBottom: 8,
    marginTop: 8,
  },
  resultDetailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    flex: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    fontStyle: "italic",
  },
  newAnalysisButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    borderRadius: 10,
  },
  newAnalysisText: {
    fontSize: 14,
    color: "#7475B4",
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  tipsList: {
    marginLeft: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  modalNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  modalNoteText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: "500",
  },
  errorHelpText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
});