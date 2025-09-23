import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { BASE_URL } from "../../config/config";

const { width } = Dimensions.get('window')

const HairCheckScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)

  // ✅ Pick photo (Camera/Gallery) — iOS and Android compatible
// ✅ Expo-specific permission handling
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

// ✅ Fixed pickPhoto function - Auto close modal
const pickPhoto = async (fromCamera = false) => {
  try {
    console.log(`Hair ${fromCamera ? 'Camera' : 'Gallery'} selected`)

    // Get permissions
    const hasPermission = await getPermissions(fromCamera ? 'camera' : 'gallery')
    if (!hasPermission) {
      // ✅ Close modal if permission denied
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

    console.log('Launching hair image picker...')

    let result
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync(options)
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options)
    }

    console.log('Hair image picker result:', {
      canceled: result.canceled,
      hasAssets: !!result.assets,
      assetsLength: result.assets?.length
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]
      console.log('Hair image selected:', {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize
      })

      setImageUri(asset.uri)
      setResult(null)
      
      // ✅ IMPORTANT: Close modal when image selected
      setShowImageOptions(false)
      
      // Auto analyze with delay
      setTimeout(() => {
        sendToBackend(asset)
      }, 300)
    } else {
      console.log('Hair image picker canceled')
      // ✅ IMPORTANT: Close modal even when canceled
      setShowImageOptions(false)
    }
  } catch (error) {
    console.error('Hair image picker error:', error)
    // ✅ IMPORTANT: Close modal on error too
    setShowImageOptions(false)
    Alert.alert(
      'Error', 
      `Failed to ${fromCamera ? 'take photo' : 'select image'}. Please try again.`
    )
  }
}

// ✅ Fixed sendToBackend function (same as before)
const sendToBackend = async (asset) => {
  if (!asset && !imageUri) {
    Alert.alert("Error", "Please select a photo first!")
    return
  }

  const imageSource = asset?.uri || imageUri
  console.log('Sending hair image to backend:', imageSource)
  console.log('Hair API Endpoint:', `${BASE_URL}/api/hair/predict`)

  setLoading(true)
  
  try {
    // Create FormData
    const formData = new FormData()
    
    // File extension and MIME type
    const uriParts = imageSource.split('.')
    const fileType = uriParts[uriParts.length - 1].toLowerCase()
    const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg'
    
    console.log('Hair file info:', { fileType, mimeType })

    // Append file to FormData (using "image" as per hair API)
    formData.append('image', {
      uri: imageSource,
      name: `hair_${Date.now()}.${fileType}`,
      type: mimeType,
    })

    console.log('Making hair analysis API request...')

    // API call WITHOUT Content-Type header (let FormData handle it)
    const response = await fetch(`${BASE_URL}/api/hair/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // DON'T set Content-Type for FormData
      },
    })

    console.log('Hair API response status:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Hair API Response:', JSON.stringify(data, null, 2))

    if (data) {
      setResult(data)
    } else {
      throw new Error('Empty response from hair analysis server')
    }

  } catch (error) {
    console.error('Hair API Error:', error)
    
    let errorMessage = 'Network error occurred'
    if (error.message.includes('fetch')) {
      errorMessage = 'Unable to connect to server. Check your internet connection.'
    } else if (error.message.includes('HTTP error')) {
      errorMessage = 'Server error occurred. Please try again later.'
    }

    Alert.alert('Hair Analysis Failed', errorMessage)
    setResult({ error: errorMessage })
  } finally {
    setLoading(false)
  }
}
  // ✅ Get condition color and icon
  const getConditionStyle = (condition) => {
    const lowerCondition = condition?.toLowerCase() || ''
    
    if (lowerCondition.includes('healthy') || lowerCondition.includes('normal')) {
      return { color: '#4CAF50', icon: 'checkmark-circle', bgColor: '#E8F5E8' }
    } else if (lowerCondition.includes('dandruff')) {
      return { color: '#FF9800', icon: 'warning', bgColor: '#FFF3E0' }
    } else if (lowerCondition.includes('loss') || lowerCondition.includes('thinning')) {
      return { color: '#F44336', icon: 'alert-circle', bgColor: '#FFEBEE' }
    } else if (lowerCondition.includes('dry')) {
      return { color: '#2196F3', icon: 'water', bgColor: '#E3F2FD' }
    } else {
      return { color: '#8B4513', icon: 'medical', bgColor: '#F3E5F5' }
    }
  }

  // ✅ Get recommendation based on condition
  const getRecommendation = (condition) => {
    const lowerCondition = condition?.toLowerCase() || ''
    
    if (lowerCondition.includes('healthy') || lowerCondition.includes('normal')) {
      return "✅ Your hair appears healthy! Continue your current hair care routine."
    } else if (lowerCondition.includes('dandruff')) {
      return "⚠️ Consider using anti-dandruff shampoo and consult a dermatologist if condition persists."
    } else if (lowerCondition.includes('loss') || lowerCondition.includes('thinning')) {
      return "⚠️ Hair loss detected. Consider consulting a trichologist or dermatologist for proper treatment."
    } else if (lowerCondition.includes('dry')) {
      return "💧 Use moisturizing hair products and consider deep conditioning treatments."
    } else {
      return "📋 For proper diagnosis and treatment, consider consulting a hair care professional."
    }
  }

  // ✅ Render analysis result
  const renderResult = () => {
    if (!result) return null

    if (result.error) {
      return (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="alert-circle" size={32} color="#F44336" />
            <Text style={styles.resultTitle}>Analysis Error</Text>
          </View>
          <View style={[styles.resultContent, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.resultText, { color: '#D32F2F' }]}>
              {result.error}
            </Text>
          </View>
        </View>
      )
    }

    const { class: condition, confidence } = result
    const confidencePercent = Math.round(confidence * 100)
    const isHighConfidence = confidencePercent >= 70
    const conditionStyle = getConditionStyle(condition)

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons 
            name={conditionStyle.icon} 
            size={32} 
            color={conditionStyle.color} 
          />
          <Text style={styles.resultTitle}>Analysis Result</Text>
        </View>

        <View style={[styles.resultContent, { backgroundColor: conditionStyle.bgColor }]}>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.resultSectionTitle}>Condition:</Text>
            <Text style={styles.resultDetailText}>{condition}</Text>
          </View>
          
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence Level:</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${confidencePercent}%`,
                    backgroundColor: isHighConfidence ? "#4CAF50" : "#FF9800"
                  }
                ]} 
              />
            </View>
            <Text style={[styles.confidenceText, { color: isHighConfidence ? "#4CAF50" : "#FF9800" }]}>
              {confidencePercent}%
            </Text>
          </View>

          <Text style={styles.recommendationText}>
            ⚠️ This analysis is for informational purposes only. Please consult
            a doctor for professional advice.
          </Text>

          <Text style={styles.recommendationText}>
            {getRecommendation(condition)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.newAnalysisButton}
          onPress={() => setShowImageOptions(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color="#8B4513" />
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
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scalp Analysis</Text>
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
            Our AI analyzes your hair and scalp condition to detect various hair health issues. 
            For best results, take a clear photo of your hair and scalp in good lighting.
          </Text>
        </View>

        {/* Upload Section */}
        {!imageUri ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="camera-outline" size={64} color="#000000" />
            </View>
            <Text style={styles.uploadTitle}>Upload Your Hair Photo</Text>
            <Text style={styles.uploadSubtitle}>
              Take a clear photo of your hair and scalp or choose from gallery
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

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7475B4" />
            <Text style={styles.loadingText}>Analyzing your hair photo...</Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        )}

        {/* Result Section */}
        {renderResult()}

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
              <Text style={styles.tipText}>Show both hair and scalp clearly</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Keep hair clean and styled naturally</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Avoid shadows and hair products that hide scalp</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
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
                <Text style={styles.optionSubtitle}>Use camera to capture hair photo</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#7475B4",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  placeholder: { width: 40 },
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
    fontFamily: "Poppins_400Regular",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
  },
  uploadSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
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
    fontFamily: "Poppins_400Regular",
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
    backgroundColor: "rgba(139, 69, 19, 0.1)",
    borderRadius: 20,
  },
  changeImageText: {
    fontSize: 14,
    color: "#8B4513",
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
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
    marginTop: 8,
  },
  resultDetailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    flex: 1,
  },
  confidenceContainer: {
    marginBottom: 15,
    marginTop: 15,
  },
  confidenceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 5,
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
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
    backgroundColor: "rgba(139, 69, 19, 0.1)",
    borderRadius: 10,
  },
  newAnalysisText: {
    fontSize: 14,
    color: "#8B4513",
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
    fontFamily: "Poppins_400Regular",
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
})

export default HairCheckScreen