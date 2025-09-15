
import { useState, useEffect } from "react"
import {
  Platform,
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
  Image, // Import Image for displaying images
  ActivityIndicator, // For loading indicator
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import * as WebBrowser from "expo-web-browser" // For opening PDFs in browser/viewer
import { getAuth } from "firebase/auth" // Assuming Firebase is initialized elsewhere

const { width } = Dimensions.get("window")
import { BASE_URL } from "../../config/config";
// Adjust path as per folder structure


export default function VaultDashboard({ navigation }) {
  const [storageUsed, setStorageUsed] = useState(0) // Dynamic storage usage
  const [totalStorage] = useState(10) // GB, mock value
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [files, setFiles] = useState([]) // State for fetched files
  const [isPicking, setIsPicking] = useState(false) // For upload loading state
  const [lastUploadedFileName, setLastUploadedFileName] = useState("") // To name AI report
  const [showImageViewer, setShowImageViewer] = useState(false) // State for image viewer modal
  const [currentImageUri, setCurrentImageUri] = useState(null) // State for image URI in viewer
  const [isLoadingFiles, setIsLoadingFiles] = useState(true) // Loading state for fetching files

  const auth = getAuth()
  const userEmail = auth.currentUser?.email // Get user email from Firebase Auth

  // ✅ Fetch user files from backend

  const getAuthToken = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      return token
    }
    throw new Error('No authenticated user')
  } catch (error) {
    console.error('Failed to get auth token:', error)
    throw error
  }
}

  const fetchUserFiles = async () => {
  setIsLoadingFiles(true)
  try {
    if (!userEmail) {
      console.warn("User email not available for fetching files.")
      setFiles([])
      return
    }
    
    const token = await getAuthToken() // Get the Firebase ID token
    
    const res = await fetch(`${BASE_URL}/api/files?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Add authorization header
        'Content-Type': 'application/json',
      }
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to fetch files: ${errorText}`)
    }
    const data = await res.json()
    const fetchedFiles = data.map((f) => ({
      id: f._id,
      name: f.fileName,
      type: f.fileType || (f.fileName.endsWith(".pdf") ? "pdf" : "image"),
      size: f.fileSize ? `${(f.fileSize / (1024 * 1024)).toFixed(2)} MB` : "N/A",
      category: f.category || "documents",
      date: new Date(f.uploadedAt).toISOString().split("T")[0],
      isEncrypted: f.isEncrypted || true,
      filePath: `${BASE_URL}/${f.filePath.replace(/\\/g, "/")}`,
    }))
    setFiles(fetchedFiles)
    
    const totalSize = fetchedFiles.reduce((sum, file) => {
      const sizeInMB = Number.parseFloat(file.size) || 0
      return sum + sizeInMB
    }, 0)
    setStorageUsed(totalSize / 1024)
  } catch (err) {
    console.error("❌ Fetch files error:", err)
    Alert.alert("Error", `Failed to load files: ${err.message || "Unknown error"}`)
  } finally {
    setIsLoadingFiles(false)
  }
}


  useEffect(() => {
    fetchUserFiles()
  }, [userEmail]) // Re-fetch when userEmail changes

  // Dynamically calculate categories and their counts based on current files
  const getCategories = () => {
    const categoryMap = {}
    files.forEach((file) => {
      categoryMap[file.category] = (categoryMap[file.category] || 0) + 1
    })

    return [
      { id: "all", name: "All Files", icon: "folder", count: files.length },
      { id: "lab-results", name: "Lab Results", icon: "flask", count: categoryMap["lab-results"] || 0 },
      { id: "imaging", name: "Medical Imaging", icon: "scan", count: categoryMap["imaging"] || 0 },
      { id: "prescriptions", name: "Prescriptions", icon: "medical", count: categoryMap["prescriptions"] || 0 },
      {
        id: "immunizations",
        name: "Immunizations",
        icon: "shield-checkmark",
        count: categoryMap["immunizations"] || 0,
      },
      { id: "reports", name: "Reports", icon: "document-text", count: categoryMap["reports"] || 0 },
      { id: "ai-report", name: "AI Reports", icon: "document-text", count: categoryMap["ai-report"] || 0 },
      { id: "documents", name: "Documents", icon: "document", count: categoryMap["documents"] || 0 }, // For general uploads
    ]
  }

  const categories = getCategories()

  const uploadOptions = [
    {
      id: "camera",
      title: "Take Photo",
      subtitle: "Capture document with camera",
      icon: "camera",
      color: "#4CAF50",
    },
    {
      id: "gallery",
      title: "Choose from Gallery",
      subtitle: "Select from photo library",
      icon: "images",
      color: "#2196F3",
    },
    {
      id: "document",
      title: "Upload Document",
      subtitle: "PDF, DOC, or other files",
      icon: "document",
      color: "#FF9800",
    },
    {
      id: "scan",
      title: "Scan Document",
      subtitle: "Use built-in scanner",
      icon: "scan",
      color: "#9C27B0",
    },
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "document-text"
      case "image":
        return "image"
      case "doc":
        return "document"
      default:
        return "document"
    }
  }

  const getFileColor = (type) => {
    switch (type) {
      case "pdf":
        return "#FF5722"
      case "image":
        return "#4CAF50"
      case "doc":
        return "#2196F3"
      default:
        return "#757575"
    }
  }

  const filteredFiles = selectedCategory === "all" ? files : files.filter((file) => file.category === selectedCategory)

  // ✅ Generate AI PDF & Save to backend
  const generateAndSavePDF = async (aiOutput) => {
    try {
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            background-color: #f9f9f9;
            color: #333;
          }
          .header {
            text-align: center;
            background: linear-gradient(135deg, #2E8B57, #20B2AA);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(46, 139, 87, 0.3);
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .report-info {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 5px solid #2E8B57;
          }
          .report-info h3 {
            margin: 0 0 10px 0;
            color: #2E8B57;
            font-size: 18px;
          }
          .report-info p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
          }
          .medical-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 25px;
          }
          .medical-table th {
            background: linear-gradient(135deg, #2E8B57, #20B2AA);
            color: white;
            padding: 18px 20px;
            text-align: left;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .medical-table td {
            padding: 18px 20px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 15px;
            line-height: 1.6;
          }
          .medical-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .medical-table tr:hover {
            background-color: #e8f5e9;
          }
          .category-cell {
            font-weight: bold;
            color: #2E8B57;
            width: 200px;
            background-color: #f0f8f0 !important;
          }
          .content-cell {
            color: #444;
            word-wrap: break-word;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-top: 3px solid #2E8B57;
          }
          .footer p {
            margin: 5px 0;
            font-size: 12px;
            color: #888;
          }
          .disclaimer {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .disclaimer p {
            margin: 0;
            font-size: 13px;
            color: #856404;
            text-align: center;
          }
          .icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 8px;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 AI Medical Report</h1>
          <p>Comprehensive Health Analysis</p>
        </div>

        <div class="report-info">
          <h3>📋 Report Information</h3>
          <p><strong>Document:</strong> ${lastUploadedFileName || "Uploaded Medical Document"}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Report ID:</strong> ${Date.now().toString().slice(-8)}</p>
        </div>

        <table class="medical-table">
          <thead>
            <tr>
              <th>📊 Medical Category</th>
              <th>📝 Analysis & Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="category-cell">
                🩺 Patient Condition
              </td>
              <td class="content-cell">
                ${aiOutput.patient_condition || "No specific condition identified in the document"}
              </td>
            </tr>
            <tr>
              <td class="category-cell">
                🔍 Diagnoses
              </td>
              <td class="content-cell">
                ${aiOutput.diagnoses || "No diagnoses mentioned in the document"}
              </td>
            </tr>
            <tr>
              <td class="category-cell">
                💊 Medications
              </td>
              <td class="content-cell">
                ${aiOutput.medications || "No medications listed in the document"}
              </td>
            </tr>
            <tr>
              <td class="category-cell">
                📅 Follow-ups
              </td>
              <td class="content-cell">
                ${aiOutput.follow_ups || "No follow-up instructions provided"}
              </td>
            </tr>
            <tr>
              <td class="category-cell">
                ⚠️ Recommendations
              </td>
              <td class="content-cell">
                ${aiOutput.recommendations || "Consult with your healthcare provider for personalized advice"}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="disclaimer">
          <p>
            <strong>⚠️ Medical Disclaimer:</strong> This AI-generated report is for informational purposes only. 
            Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment.
          </p>
        </div>

        <div class="footer">
          <p><strong>Health Vault - Secure Medical Records</strong></p>
          <p>Generated by AI Medical Analysis System</p>
          <p>Report Version: 2.0 | Confidential Medical Document</p>
        </div>
      </body>
      </html>
    `
    
    const { uri } = await Print.printToFileAsync({ 
      html,
      width: 612,
      height: 792,
      margins: {
        left: 20,
        top: 20,
        right: 20,
        bottom: 20,
      }
    })
    
    const pdfName = `${lastUploadedFileName.replace(/\.[^/.]+$/, "")}-AI-Report.pdf`

    const formData = new FormData()
    formData.append("file", {
      uri,
      name: pdfName,
      type: "application/pdf",
    })
    formData.append("email", userEmail)
    formData.append("category", "ai-report")

    const res = await fetch(`${BASE_URL}/api/pdfs/upload`, {
      method: "POST",
      body: formData,
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to save AI PDF to backend: ${errorText}`)
    }
    
    await fetchUserFiles()
    Alert.alert("✅ AI Report Generated", "Your professional AI medical report has been generated and saved to your vault!")
    
  } catch (error) {
    console.error("PDF Generation Error:", error)
    Alert.alert("Error", `Failed to generate AI PDF: ${error.message || "Unknown error"}`)
  }
}

  // ✅ Handle file upload (replaces pickDocument)
// ✅ Handle file upload (replaces pickDocument)
const handleUploadOption = async (option) => {
  setShowUploadModal(false) // Close modal immediately
  setIsPicking(true) // Set loading state
  
  try {
    let result
    let fileType = ""
    
    if (option.id === "document") {
      result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf", // Only PDF for now as per your API
        copyToCacheDirectory: true,
      })
      fileType = "pdf"
    } else if (option.id === "camera" || option.id === "gallery") {
      Alert.alert("Feature Coming Soon", "Camera and Gallery uploads will be available soon!")
      return
    } else if (option.id === "scan") {
      Alert.alert("Feature Coming Soon", "Document scanning will be available soon!")
      return
    }

    if (result.canceled) return

    const fileData = result.assets[0]
    setLastUploadedFileName(fileData.name) // Set for AI report naming

    let fileUri = fileData.uri
    if (Platform.OS === "android" && fileUri.startsWith("content://")) {
      const fileInfo = await FileSystem.getInfoAsync(fileUri)
      if (!fileInfo.exists) throw new Error("File not found on device")
      fileUri = fileInfo.uri
    }

    const formData = new FormData()
    formData.append("file", {
      uri: fileUri,
      name: fileData.name,
      type: fileType === "pdf" ? "application/pdf" : "image/jpeg", // Adjust MIME type
    })
    formData.append("email", userEmail)
    formData.append("category", "documents") // Default category for direct uploads

    const res = await fetch(`${BASE_URL}/api/ai/upload`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Upload failed: ${errorText}`)
    }

    const data = await res.json()
    console.log("✅ Uploaded:", data)

    // ✅ Check if AI output exists and generate PDF
    if (data.output) {
      let aiOutput

      try {
        // Check if data.output is already an object or a string
        if (typeof data.output === 'object') {
          // If it's already an object, use it directly
          aiOutput = data.output
        } else {
          // If it's a string, process it
          const aiOutputString = data.output
            .trim()
            .replace(/\n/g, " ")
            .replace(/'/g, '"')
            .replace(/\bNone\b/g, "null")
            .replace(/\bTrue\b/g, "true")
            .replace(/\bFalse\b/g, "false")
            .replace(/(\w)"(\w)/g, '$1\\"$2')
          
          aiOutput = JSON.parse(aiOutputString)
        }

        await generateAndSavePDF(aiOutput)
      } catch (err) {
        console.warn("⚠️ Invalid AI output format, cannot generate AI report:", err, data.output)
        Alert.alert(
          "AI Processing Warning",
          "AI output could not be parsed. File uploaded, but no AI report generated.",
        )
        await fetchUserFiles() // Still refresh files for the original upload
      }
    } else {
      Alert.alert("Success", "PDF uploaded successfully.")
      await fetchUserFiles() // Refresh files for the original upload
    }
  } catch (err) {
    console.error("❌ Upload Error:", err)
    Alert.alert("Upload Error", err.message || "Unknown error")
  } finally {
    setIsPicking(false) // Reset loading state
  }
}

  const handleFileAction = async (file, action) => {
    if (!file.filePath) {
      Alert.alert("File Not Available", "This file is not locally available for this action.")
      return
    }

    try {
      if (action === "View") {
        if (file.type === "pdf") {
          await WebBrowser.openBrowserAsync(file.filePath)
        } else if (file.type === "image") {
          setCurrentImageUri(file.filePath)
          setShowImageViewer(true)
        } else {
          Alert.alert("Unsupported File Type", "This file type cannot be viewed directly.")
        }
      } else if (action === "Share") {
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert("Sharing Not Available", "Sharing is not available on your device.")
          return
        }
        await Sharing.shareAsync(file.filePath, { UTI: file.type === "pdf" ? "com.adobe.pdf" : "public.image" })
      } else if (action === "Download") {
        Alert.alert("Download File", `Do you want to save "${file.name}" to your device?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Download",
            onPress: async () => {
              try {
                const downloadedFile = await FileSystem.downloadAsync(
                  file.filePath,
                  FileSystem.documentDirectory + file.name,
                )
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(downloadedFile.uri)
                  Alert.alert("Download Initiated", "Please select a location to save the file.")
                } else {
                  Alert.alert("Download Complete", `File saved to: ${downloadedFile.uri}`)
                }
              } catch (downloadErr) {
                console.error("❌ Download error:", downloadErr)
                Alert.alert("Download Failed", `Could not download file: ${downloadErr.message || "Unknown error"}`)
              }
            },
          },
        ])
      } else if (action === "Delete") {
  Alert.alert(
    "Delete File",
    `Are you sure you want to delete "${file.name}"? This action cannot be undone.`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/pdfs/${file.id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Failed to delete file: ${errorText}`);
            }
            Alert.alert("Success", `${file.name} deleted from vault.`);
            await fetchUserFiles(); // Refresh files list
          } catch (deleteErr) {
            console.error("❌ Delete error:", deleteErr);
            Alert.alert("Delete Failed", `Could not delete file: ${deleteErr.message || "Unknown error"}`);
          }
        },
      },
    ]
  );
}

    } catch (err) {
      console.error(`❌ File action (${action}) error:`, err)
      Alert.alert("Error", `Failed to ${action.toLowerCase()} file: ${err.message || "Unknown error"}`)
    }
  }

  const storagePercentage = (storageUsed / totalStorage) * 100

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />

      {/* Header */}
      <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Health Vault</Text>
            <Text style={styles.headerSubtitle}>Secure Medical Records</Text>
          </View>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Storage Overview */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <View style={styles.storageInfo}>
              <Text style={styles.storageTitle}>Storage Usage</Text>
              <Text style={styles.storageText}>
                {storageUsed.toFixed(1)} GB of {totalStorage} GB used
              </Text>
            </View>
            <View style={styles.storageIcon}>
              <Ionicons name="cloud" size={30} color="#2E8B57" />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${storagePercentage}%`,
                    backgroundColor: storagePercentage > 80 ? "#FF5722" : "#4CAF50",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{storagePercentage.toFixed(1)}% used</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{files.length}</Text>
            <Text style={styles.statLabel}>Total Files</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{files.filter((f) => f.isEncrypted).length}</Text>
            <Text style={styles.statLabel}>Encrypted</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Days Ago</Text>
          </View>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadModal(true)}
            activeOpacity={0.8}
            disabled={isPicking} // Disable button while picking
          >
            <LinearGradient colors={["#4CAF50", "#45A049"]} style={styles.uploadButtonGradient}>
              {isPicking ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="add" size={24} color="#fff" />
              )}
              <Text style={styles.uploadButtonText}>{isPicking ? "Uploading..." : "Upload New File"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, selectedCategory === category.id && styles.categoryCardActive]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon}
                    size={20}
                    color={selectedCategory === category.id ? "#fff" : "#2E8B57"}
                  />
                  <Text style={[styles.categoryName, selectedCategory === category.id && styles.categoryNameActive]}>
                    {category.name}
                  </Text>
                  <View style={[styles.categoryCount, selectedCategory === category.id && styles.categoryCountActive]}>
                    <Text
                      style={[
                        styles.categoryCountText,
                        selectedCategory === category.id && styles.categoryCountTextActive,
                      ]}
                    >
                      {category.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Files List */}
        <View style={styles.filesSection}>
          <View style={styles.filesSectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === "all" ? "All Files" : categories.find((c) => c.id === selectedCategory)?.name}
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="funnel-outline" size={16} color="#666" />
              <Text style={styles.sortText}>Sort</Text>
            </TouchableOpacity>
          </View>

          {isLoadingFiles ? (
            <ActivityIndicator size="large" color="#2E8B57" style={{ marginTop: 50 }} />
          ) : (
            <>
              {filteredFiles.map((file) => (
                <View key={file.id} style={styles.fileCard}>
                  <View style={styles.fileIcon}>
                    <Ionicons name={getFileIcon(file.type)} size={24} color={getFileColor(file.type)} />
                  </View>

                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileSize}>{file.size}</Text>
                      <Text style={styles.fileDot}>•</Text>
                      <Text style={styles.fileDate}>{file.date}</Text>
                      {file.isEncrypted && (
                        <>
                          <Text style={styles.fileDot}>•</Text>
                          <Ionicons name="lock-closed" size={12} color="#4CAF50" />
                          <Text style={styles.encryptedText}>Encrypted</Text>
                        </>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.fileMenuButton}
                    onPress={() => {
                      Alert.alert("File Options", `Choose an action for "${file.name}"`, [
                        { text: "View", onPress: () => handleFileAction(file, "View") },
                        { text: "Share", onPress: () => handleFileAction(file, "Share") },
                        { text: "Download", onPress: () => handleFileAction(file, "Download") },
                        { text: "Delete", style: "destructive", onPress: () => handleFileAction(file, "Delete") },
                        { text: "Cancel", style: "cancel" },
                      ])
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                  </TouchableOpacity>
                  {/* 👇 Add this for a direct delete button */}
                  <TouchableOpacity
                    style={[styles.fileMenuButton, { marginLeft: 8 }]}
                    onPress={() => handleFileAction(file, "Delete")}
                  >
                    <Ionicons name="trash" size={20} color="#FF5722" />
                  </TouchableOpacity>
                </View>
              ))}
              {filteredFiles.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No files in this category</Text>
                  <Text style={styles.emptyStateSubtext}>Upload your first medical document</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Medical Document</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.uploadOptions}>
              {uploadOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.uploadOption}
                  onPress={() => handleUploadOption(option)}
                >
                  <View style={[styles.uploadOptionIcon, { backgroundColor: `${option.color}20` }]}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                  </View>
                  <View style={styles.uploadOptionText}>
                    <Text style={styles.uploadOptionTitle}>{option.title}</Text>
                    <Text style={styles.uploadOptionSubtitle}>{option.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.uploadNote}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.uploadNoteText}>All files are automatically encrypted and secured</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageViewer(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity style={styles.imageViewerCloseButton} onPress={() => setShowImageViewer(false)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
          {currentImageUri && <Image source={{ uri: currentImageUri }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  storageCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  storageText: {
    fontSize: 14,
    color: "#666",
  },
  storageIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(46, 139, 87, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e1e5e9",
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  uploadSection: {
    marginBottom: 25,
  },
  uploadButton: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  categoriesSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingRight: 20,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardActive: {
    backgroundColor: "#2E8B57",
  },
  categoryName: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  categoryNameActive: {
    color: "#fff",
  },
  categoryCount: {
    backgroundColor: "rgba(46, 139, 87, 0.1)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  categoryCountActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryCountText: {
    fontSize: 10,
    color: "#2E8B57",
    fontWeight: "bold",
  },
  categoryCountTextActive: {
    color: "#fff",
  },
  filesSection: {
    marginBottom: 30,
  },
  filesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  sortText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  fileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  fileDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
  },
  fileDate: {
    fontSize: 12,
    color: "#666",
  },
  fileDot: {
    fontSize: 12,
    color: "#ccc",
    marginHorizontal: 6,
  },
  encryptedText: {
    fontSize: 10,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
  },
  fileMenuButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
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
    paddingTop: 20,
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
  modalCloseButton: {
    padding: 4,
  },
  uploadOptions: {
    marginBottom: 20,
  },
  uploadOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  uploadOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  uploadOptionText: {
    flex: 1,
  },
  uploadOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  uploadOptionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  uploadNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
    padding: 12,
  },
  uploadNoteText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: "500",
  },
  // Styles for Image Viewer Modal
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
})
