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

export default function EyeScreen({ navigation }) {
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showImageOptions, setShowImageOptions] = useState(false)
const getPermissions = async (type = 'camera') => {
  try {
    if (type === 'camera') {
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync()
      if (cameraPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permission from device settings to take photos.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK' }
            ]
          )
          return false
        }
      }
    } else {
      const mediaPermission = await ImagePicker.getMediaLibraryPermissionsAsync()
      if (mediaPermission.status !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert(
            'Gallery Permission Required',
            'Please enable gallery permission from device settings to select photos.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK' }
            ]
          )
          return false
        }
      }
    }
    return true
  } catch (error) {
    console.error('Permission error:', error)
    return false
  }
}

// ✅ Fixed pickImage function
const pickImage = async (fromCamera = false) => {
  try {
    console.log(`Eye ${fromCamera ? 'Camera' : 'Gallery'} selected`)

    // Get permissions
    const hasPermission = await getPermissions(fromCamera ? 'camera' : 'gallery')
    if (!hasPermission) {
      setShowImageOptions(false)
      return
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Optimize for network
      base64: false,
      exif: false,
    }

    console.log('Launching eye image picker...')

    let result
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync(options)
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options)
    }

    console.log('Eye image picker result:', {
      canceled: result.canceled,
      hasAssets: !!result.assets,
      assetsLength: result.assets?.length
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]
      console.log('Eye image selected:', {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize
      })

      setPhoto(asset.uri)
      setResult(null)
      setShowImageOptions(false)
      
      // Auto analyze with delay
      setTimeout(() => {
        uploadImage(asset)
      }, 300)
    } else {
      console.log('Eye image picker canceled')
      setShowImageOptions(false)
    }
  } catch (error) {
    console.error('Eye image picker error:', error)
    setShowImageOptions(false)
    Alert.alert(
      'Error', 
      `Failed to ${fromCamera ? 'take photo' : 'select image'}. Please try again.`
    )
  }
}

// ✅ Fixed uploadImage function
const uploadImage = async (asset) => {
  if (!asset && !photo) {
    Alert.alert("Error", "Please select a photo first!")
    return
  }

  const imageSource = asset?.uri || photo
  console.log('Uploading eye image to backend:', imageSource)
  console.log('Eye API Endpoint:', `${BASE_URL}/api/predict/eye`)

  setLoading(true)
  setResult(null)
  
  try {
    // Create FormData
    const formData = new FormData()
    
    // File extension and MIME type
    const uriParts = imageSource.split('.')
    const fileType = uriParts[uriParts.length - 1].toLowerCase()
    const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg'
    
    console.log('Eye file info:', { fileType, mimeType })

    // Append file to FormData (using "image" as per eye API)
    formData.append('image', {
      uri: imageSource,
      name: `eye_${Date.now()}.${fileType}`,
      type: mimeType,
    })

    console.log('Making eye analysis API request...')

    // API call WITHOUT Content-Type header (let FormData handle it)
    const response = await fetch(`${BASE_URL}/api/predict/eye`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // DON'T set Content-Type for FormData
      },
    })

    console.log('Eye API response status:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Eye API Response:', JSON.stringify(data, null, 2))

    if (data) {
      setResult(data)
    } else {
      throw new Error('Empty response from eye analysis server')
    }

  } catch (error) {
    console.error('Eye API Error:', error)
    
    let errorMessage = 'Network error occurred'
    if (error.message.includes('fetch')) {
      errorMessage = 'Unable to connect to server. Check your internet connection.'
    } else if (error.message.includes('HTTP error')) {
      errorMessage = 'Server error occurred. Please try again later.'
    }

    Alert.alert('Eye Analysis Failed', errorMessage)
    setResult({ error: errorMessage })
  } finally {
    setLoading(false)
  }
}


  // Helper function to get condition info
  const getConditionInfo = (condition) => {
    const conditions = {
      normal: {
        icon: "checkmark-circle",
        color: "#4CAF50",
        title: "Normal Eye",
        description: "Your eye appears healthy with no visible abnormalities detected.",
        severity: "Low Risk",
        recommendations: [
          "Continue regular eye check-ups",
          "Maintain good eye hygiene",
          "Use UV protection sunglasses",
          "Follow healthy lifestyle habits"
        ]
      },
      cataract: {
        icon: "eye",
        color: "#FF9800",
        title: "Cataract Detected",
        description: "Cataract is a clouding of the lens in your eye, which can cause vision problems.",
        severity: "Medium Risk",
        recommendations: [
          "Consult an ophthalmologist",
          "Consider surgical options if severe",
          "Use brighter lighting when reading",
          "Regular monitoring of vision changes"
        ]
      },
      glaucoma: {
        icon: "warning",
        color: "#F44336",
        title: "Glaucoma Suspected",
        description: "Glaucoma is a serious eye condition that can lead to vision loss if untreated.",
        severity: "High Risk",
        recommendations: [
          "Seek immediate medical attention",
          "Regular eye pressure monitoring",
          "Follow prescribed treatment plan",
          "Avoid activities that increase eye pressure"
        ]
      },
      "diabetic retinopathy": {
        icon: "medical",
        color: "#E91E63",
        title: "Diabetic Retinopathy",
        description: "A diabetes complication that affects eyes, caused by damage to blood vessels.",
        severity: "High Risk",
        recommendations: [
          "Immediate consultation with eye specialist",
          "Better diabetes management",
          "Regular retinal examinations",
          "Monitor blood sugar levels closely"
        ]
      },
      eyelid: {
        icon: "eye-outline",
        color: "#3F51B5",
        title: "Eyelid Condition",
        description: "Issues with the eyelid such as swelling, infection, or drooping may be present.",
        severity: "Medium Risk",
        recommendations: [
          "Apply warm compresses",
          "Maintain eyelid hygiene",
          "Consult doctor if symptoms persist",
          "Avoid rubbing or touching eyes"
        ]
      },
      conjunctivitis: {
        icon: "eyedrop",
        color: "#9C27B0",
        title: "Conjunctivitis",
        description: "Also known as pink eye, it causes redness, itching, and discharge due to infection or allergies.",
        severity: "Medium Risk",
        recommendations: [
          "Use prescribed eye drops",
          "Maintain good hand hygiene",
          "Avoid touching or rubbing eyes",
          "Replace contact lenses if used"
        ]
      },
    }

    return (
      conditions[condition?.toLowerCase()] || {
        icon: "help-circle",
        color: "#9E9E9E",
        title: "Unknown Condition",
        description: "The analysis result is unclear. Please consult with an eye specialist.",
        severity: "Unknown",
        recommendations: [
          "Consult an eye specialist",
          "Get comprehensive eye examination",
          "Monitor any changes in vision"
        ]
      }
    )
  }

  const conditionInfo = result?.predicted_class ? getConditionInfo(result.predicted_class) : null

  const renderResult = () => {
    if (!result || result.error) return null
    
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons name="medical" size={32} color="#7475B4" />
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
            <Text style={styles.resultSectionTitle}>Risk Level:</Text>
            <Text style={[styles.resultDetailText, { color: conditionInfo.color, fontWeight: '600' }]}>
              {conditionInfo.severity}
            </Text>
          </View>

          {/* Confidence */}
          {result.confidence && (
            <View style={styles.conditionSection}>
              <Text style={styles.resultSectionTitle}>Confidence:</Text>
              <Text style={styles.resultDetailText}>{(result.confidence).toFixed(1)}%</Text>
            </View>
          )}

          {/* Recommendations */}
          <View style={styles.conditionSection}>
            <Text style={styles.resultSectionTitle}>Recommendations:</Text>
            {conditionInfo.recommendations.map((rec, index) => (
              <View key={index} style={styles.bulletRow}>
                <Ionicons
                  name="ellipse"
                  size={6}
                  color="#7475B4"
                  style={{ marginTop: 8, marginRight: 8 }}
                />
                <Text style={styles.resultDetailText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Emergency notice for serious conditions */}
          {["glaucoma", "diabetic retinopathy"].includes(result.predicted_class?.toLowerCase()) && (
            <View style={styles.urgentNotice}>
              <Ionicons name="warning" size={16} color="#F44336" />
              <Text style={styles.urgentText}>
                This condition requires immediate medical attention!
              </Text>
            </View>
          )}

          <Text style={styles.recommendationText}>
            ⚠️ This analysis is for informational purposes only. Please consult an ophthalmologist for professional diagnosis and treatment.
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
        <Text style={styles.headerTitle}>Eye Health Scanner</Text>
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
            Our AI analyzes your eye image to detect possible signs of various eye conditions. 
            For best results, take a clear photo in good lighting with your eye wide open and clearly visible.
          </Text>
        </View>

        {/* Upload Section */}
        {!photo ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="eye-outline" size={64} color="#7475B4" />
            </View>
            <Text style={styles.uploadTitle}>Upload Your Eye Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Take a clear photo of your eye or choose from gallery
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
              <Image source={{ uri: photo }} style={styles.image} />
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
            <Text style={styles.loadingText}>Analyzing your eye photo...</Text>
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
                setPhoto(null)
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
              <Text style={styles.tipText}>Keep your eye wide open during capture</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Fill the frame with your eye area</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Hold camera steady and avoid shadows</Text>
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
              onPress={() => pickImage(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="camera" size={28} color="#2196F3" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use camera to capture eye photo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickImage(false)}
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
    backgroundColor: "rgba(116, 117, 180, 0.1)",
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
    backgroundColor: "rgba(116, 117, 180, 0.05)",
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
  urgentNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  urgentText: {
    fontSize: 14,
    color: "#F44336",
    fontWeight: "600",
    marginLeft: 8,
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