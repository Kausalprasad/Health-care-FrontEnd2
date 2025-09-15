"use client"

import { useState } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { BASE_URL } from "../../config/config"

const { width } = Dimensions.get("window")

export default function SkinAnalysisScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)

  // Pick photo from gallery or camera
  const pickPhoto = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permission.status !== "granted") {
      Alert.alert("Permission needed", "Please allow permissions to continue!")
      return
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
        })

    if (!result.canceled) {
      const asset = result.assets[0]
      setImageUri(asset.uri)
      setResult(null) // Clear previous result
      setShowImageOptions(false)
      sendToBackend(asset) // Auto-analyze after selection
    }
  }

  // Send image to backend using FormData
  const sendToBackend = async (asset) => {
    if (!asset && !imageUri) return Alert.alert("Select a photo first!")

    setLoading(true)
    const formData = new FormData()
    formData.append("image", {
      uri: asset?.uri || imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    })

    try {
      const response = await fetch(`${BASE_URL}/api/skin/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const data = await response.json()
      console.log("✅ Skin analysis result:", data)

      // Show result in UI if data exists
      if (data.data) {
        const analysis = data.data
        setResult({
          class: analysis.class,
          confidence: (analysis.confidence * 100).toFixed(1),
          rawConfidence: analysis.confidence,
        })
      } else {
        Alert.alert("Error", data.message || "Something went wrong!")
        setResult({ error: "Analysis failed. Please try again." })
      }
    } catch (error) {
      console.error("Skin analysis error:", error)
      Alert.alert("Error", "Something went wrong!")
      setResult({ error: "Network error. Please check your connection." })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get skin condition info
  const getSkinConditionInfo = (condition) => {
    const conditions = {
      acne: {
        icon: "warning",
        color: "#FF9800",
        title: "Acne Detected",
        description: "Common skin condition characterized by pimples, blackheads, and whiteheads.",
        severity: "Mild to Moderate",
        recommendations: [
          "Use gentle, non-comedogenic cleansers",
          "Apply topical treatments with salicylic acid",
          "Avoid touching or picking at affected areas",
          "Consider consulting a dermatologist",
        ],
      },
      melanoma: {
        icon: "alert-circle",
        color: "#F44336",
        title: "Melanoma Suspected",
        description: "A serious form of skin cancer that requires immediate medical attention.",
        severity: "High Risk",
        recommendations: [
          "Consult a dermatologist immediately",
          "Avoid sun exposure",
          "Monitor for changes in size, color, or shape",
          "Consider biopsy if recommended",
        ],
      },
      eczema: {
        icon: "medical",
        color: "#E91E63",
        title: "Eczema Detected",
        description: "A condition that makes skin red, inflamed, and itchy.",
        severity: "Moderate",
        recommendations: [
          "Use fragrance-free moisturizers",
          "Avoid known triggers",
          "Apply topical corticosteroids as prescribed",
          "Keep skin hydrated",
        ],
      },
      psoriasis: {
        icon: "layers",
        color: "#9C27B0",
        title: "Psoriasis Detected",
        description: "An autoimmune condition causing rapid skin cell buildup.",
        severity: "Chronic Condition",
        recommendations: [
          "Use prescribed topical treatments",
          "Moisturize regularly",
          "Manage stress levels",
          "Follow up with dermatologist",
        ],
      },
      normal: {
        icon: "checkmark-circle",
        color: "#4CAF50",
        title: "Healthy Skin",
        description: "Your skin appears healthy with no visible abnormalities detected.",
        severity: "Normal",
        recommendations: [
          "Continue current skincare routine",
          "Use sunscreen daily",
          "Maintain good hygiene",
          "Regular skin self-examinations",
        ],
      },
      // Additional conditions from original code...
      actinic: {
        icon: "sun",
        color: "#FF7043",
        title: "Actinic Keratosis",
        description: "Rough, scaly patches caused by sun exposure. May develop into skin cancer.",
        severity: "Precancerous",
        recommendations: [
          "Consult dermatologist",
          "Use sunscreen daily",
          "Avoid prolonged sun exposure",
        ],
      },
      atopic: {
        icon: "droplet",
        color: "#00BCD4",
        title: "Atopic Dermatitis",
        description: "Chronic eczema condition causing dry, itchy skin.",
        severity: "Chronic",
        recommendations: [
          "Keep skin moisturized",
          "Avoid allergens and irritants",
          "Consult dermatologist for treatment",
        ],
      },
      benign: {
        icon: "shield",
        color: "#8BC34A",
        title: "Benign Lesion",
        description: "Non-cancerous skin growth, generally harmless.",
        severity: "Low Risk",
        recommendations: ["Monitor for changes", "Consult doctor if appearance changes"],
      },
      carcinoma: {
        icon: "alert-circle",
        color: "#C62828",
        title: "Carcinoma Suspected",
        description: "A type of skin cancer that requires medical evaluation.",
        severity: "High Risk",
        recommendations: [
          "Seek immediate dermatological consultation",
          "Avoid sun exposure",
          "Biopsy if recommended",
        ],
      },
      dermatitis: {
        icon: "droplet",
        color: "#FFB300",
        title: "Dermatitis",
        description: "Inflammation of the skin, often leading to rash, redness, or itching.",
        severity: "Moderate",
        recommendations: [
          "Avoid triggers",
          "Use soothing creams",
          "Consult dermatologist if severe",
        ],
      },
      keratosis: {
        icon: "layers",
        color: "#6A1B9A",
        title: "Keratosis",
        description: "Thickened, scaly patches of skin caused by excess keratin buildup.",
        severity: "Variable",
        recommendations: [
          "Consult dermatologist",
          "Consider cryotherapy or topical treatment",
        ],
      },
      melanocytic: {
        icon: "circle",
        color: "#283593",
        title: "Melanocytic Nevus",
        description: "Common mole made up of melanocyte cells, usually benign.",
        severity: "Low Risk",
        recommendations: [
          "Monitor for irregular borders or color changes",
          "Consult dermatologist if changing",
        ],
      },
      nevus: {
        icon: "circle",
        color: "#3F51B5",
        title: "Nevus",
        description: "Medical term for a mole or birthmark, typically harmless.",
        severity: "Low Risk",
        recommendations: ["Monitor appearance", "Seek advice if irregular"],
      },
      squamous: {
        icon: "alert-circle",
        color: "#D32F2F",
        title: "Squamous Cell Carcinoma",
        description: "A type of skin cancer that may spread if untreated.",
        severity: "High Risk",
        recommendations: [
          "Seek immediate medical consultation",
          "Avoid sun exposure",
          "Consider biopsy if recommended",
        ],
      },
      vascular: {
        icon: "droplet",
        color: "#AD1457",
        title: "Vascular Lesion",
        description: "Abnormal blood vessels in the skin, may be benign or require treatment.",
        severity: "Variable",
        recommendations: [
          "Consult dermatologist",
          "Laser therapy may be considered",
        ],
      },
    }

    return (
      conditions[condition?.toLowerCase()] || {
        icon: "help-circle",
        color: "#9E9E9E",
        title: "Unknown Condition",
        description: "The analysis result is unclear. Please consult with a dermatologist.",
        severity: "Unknown",
        recommendations: [
          "Consult a dermatologist",
          "Get a professional skin examination",
        ],
      }
    )
  }

  const conditionInfo = result?.class ? getSkinConditionInfo(result.class) : null

  const renderResult = () => {
    if (!result || result.error) return null
    
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="medical" size={32} color="#2E8B57" />
          <Text style={styles.resultTitle}>Analysis Result</Text>
        </View>
        
        <View style={styles.resultContent}>
          {/* Main Condition */}
          <View style={styles.conditionSection}>
            <Text style={styles.resultSectionTitle}>Condition:</Text>
            <Text style={styles.resultDetailText}>{conditionInfo.title}</Text>
          </View>

          {/* Description */}
          <View style={styles.conditionSection}>
            <Text style={styles.resultSectionTitle}>Description:</Text>
            <Text style={styles.resultDetailText}>{conditionInfo.description}</Text>
          </View>

          {/* Severity */}
          <View style={styles.conditionSection}>
            <Text style={styles.resultSectionTitle}>Severity:</Text>
            <Text style={[styles.resultDetailText, { color: conditionInfo.color, fontWeight: '600' }]}>
              {conditionInfo.severity}
            </Text>
          </View>

          {/* Confidence */}
          <View style={styles.conditionSection}>
            <Text style={styles.resultSectionTitle}>Confidence:</Text>
            <Text style={styles.resultDetailText}>{result.confidence}%</Text>
          </View>

          {/* Recommendations */}
          <View style={styles.conditionSection}>
            <Text style={styles.resultSectionTitle}>Recommendations:</Text>
            {conditionInfo.recommendations.map((rec, index) => (
              <View key={index} style={styles.bulletRow}>
                <Ionicons
                  name="ellipse"
                  size={6}
                  color="#2E8B57"
                  style={{ marginTop: 8, marginRight: 8 }}
                />
                <Text style={styles.resultDetailText}>{rec}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.recommendationText}>
            ⚠️ This analysis is for informational purposes only. Please consult a dermatologist for professional diagnosis and treatment.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newAnalysisButton}
          onPress={() => setShowImageOptions(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color="#2E8B57" />
          <Text style={styles.newAnalysisText}>Analyze Another Photo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skin Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#7475B4" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Our AI analyzes your skin image to detect possible signs of various skin conditions. 
            For best results, take a clear photo in good lighting with the affected area clearly visible.
          </Text>
        </View>

        {/* Upload Section */}
        {!imageUri ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera-outline" size={64} color="#7475B4" />
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
              <View style={[styles.uploadButtonGradient, { backgroundColor: "#7475B4" }]}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Select Photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Uploaded Image</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
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

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7475B4" />
            <Text style={styles.loadingText}>Analyzing your skin photo...</Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        )}

        {/* Result */}
        {renderResult()}

        {/* Error State */}
        {result?.error && (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons name="warning-outline" size={32} color="#FF5722" />
            </View>
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorText}>{result.error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setResult(null)
                setImageUri(null)
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.uploadButtonGradient, { backgroundColor: "#F44336" }]}>
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.uploadButtonText}>Try Again</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips Section */}
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
              <Text style={styles.tipText}>Focus on the affected skin area</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Fill the frame with the skin area</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Avoid shadows and reflections</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Photo Options */}
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
                <Text style={styles.optionSubtitle}>Use camera to capture skin photo</Text>
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
                <Text style={styles.optionSubtitle}>Select existing photo from gallery</Text>
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
  )
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
    borderColor: "#E0E0E0",
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
  uploadSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
    backgroundColor: "rgba(46, 139, 87, 0.1)",
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
    backgroundColor: "rgba(46, 139, 87, 0.05)",
  },
  conditionSection: {
    marginBottom: 15,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7475B4",
    marginBottom: 8,
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
    backgroundColor: "rgba(46, 139, 87, 0.1)",
    borderRadius: 10,
  },
  newAnalysisText: {
    fontSize: 14,
    color: "#2E8B57",
    fontWeight: "600",
    marginLeft: 8,
  },
  errorCard: {
    backgroundColor: "#FFEBEE",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  errorIcon: {
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#B71C1C",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  // Modal styles
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
})