import React, { useState } from "react";
import { Image, Dimensions } from "react-native";
import DoctorPng from "../../../assets/Dashoabdicons/Group 21.png";
import CheckupPng from "../../../assets/Dashoabdicons/Group 22.png";
import CalendarPng from "../../../assets/Dashoabdicons/Group 23.png";
import CameraPng from "../../../assets/Dashoabdicons/Group 24.png";
import PrescriptionPng from "../../../assets/Dashoabdicons/MentalHealth.png";
import GamesPng from "../../../assets/Dashoabdicons/Group 29.png";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // adjust the path if needed
import Sidebar from "../../components/Sidebar";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PngIcon = ({ source, style }) => (
  <Image source={source} style={[{ resizeMode: "contain" }, style]} />
);

export default function HealthDashboard({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const handleChatbotPress = () => {
    navigation.navigate('ChatbotScreen');
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#B2B3F2" />

      {/* Main Gradient Background */}
      <View style={[styles.gradientBg, { backgroundColor: "#B2B3F2" }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profilePic}
            onPress={() => setSidebarVisible(true)}
          />
          <Text style={styles.greeting}>
            Hi {user?.displayName || user?.email?.split("@")[0] || "User"}!
          </Text>
          <View style={styles.sosButton}>
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </View>

        {/* Well-being Checkup Card */}
        <View style={styles.wellBeingCard}>
          {/* Text section */}
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardSubtext}>EVERYDAY WELL-BEING CHECKUP</Text>
            <Text style={styles.cardMainText}>How do you feel today?</Text>
          </View>

          {/* Button section */}
         <TouchableOpacity
  style={styles.startButton}
  onPress={() => navigation.navigate('MentalHealthScreen')} // 'NextScreen' ko apne target screen ke name se replace karo
>
  <Text style={styles.startButtonText}>Start</Text>
</TouchableOpacity>

        </View>
      </View>

      {/* White Content Area */}
      <ScrollView style={styles.whiteContent} showsVerticalScrollIndicator={false}>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Our Features</Text>

          <View style={styles.featuresGrid}>
            {/* First Row */}
            <View style={styles.featureRow}>
              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("AIDoctor")}
              >
                <PngIcon source={CameraPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("AiHealthCheckupScreen")}
              >
                <PngIcon source={GamesPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("MentalHealthScreen")}
              >
                <PngIcon source={PrescriptionPng} style={styles.featureIcon} />
              </TouchableOpacity>
            </View>

            {/* Second Row */}
            <View style={styles.featureRow}>
              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("HealthGames")}
              >
                <PngIcon source={DoctorPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("CosmeticScreen")}
              >
                <PngIcon source={CheckupPng} style={styles.featureIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.featureItem}
                onPress={() => navigation.navigate("SymptomChecker")}
              >
                <PngIcon source={CalendarPng} style={styles.featureIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Today's Vitals Section */}
        <View style={styles.vitalsSection}>
          <View style={styles.vitalsCard}>
            <View style={styles.vitalsLeft}>
              <Text style={styles.vitalsTitle}>TODAY'S{'\n'}VITALS</Text>
              <Text style={styles.deviceConnected}>Device Connected</Text>
            </View>
            <View style={styles.vitalsRight}>
              <View style={styles.vitalCircle}>
                <Text style={styles.vitalLabel}>BPM</Text>
                <Text style={styles.vitalValue}>72</Text>
              </View>
              <View style={styles.vitalCircle}>
                <Text style={styles.vitalLabel}>BP</Text>
                <Text style={styles.vitalValue}>120/80</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Appointment */}
       <View style={styles.appointmentSection}>
  <TouchableOpacity 
  style={styles.appointmentHeader} 
  onPress={() => navigation.navigate("MyAppointments")} // 👈 yaha apna screen ka naam do
>
  <Text style={styles.appointmentTitle}>Upcoming Appointment</Text>
  <Ionicons name="chevron-forward" size={24} color="#333" />
</TouchableOpacity>


  <View style={styles.appointmentCardContainer}>
    <View style={styles.appointmentCard}>
      {/* Doctor Image */}
      <View style={styles.doctorAvatar}>
        <Image
          source={require("../../../assets/doctor.png")}
          style={styles.doctorImage}
        />
      </View>

      {/* Doctor Info */}
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>Dr. Mehra</Text>
        <Text style={styles.doctorSpecialty}>Dermatologist</Text>
      </View>

      {/* Appointment Time */}
      <View style={styles.appointmentTime}>
        <Text style={styles.dateText}>04 Sep</Text>
        <Text style={styles.timeText}>10:00 am</Text>
      </View>
    </View>

    {/* Footer Section */}
    <View style={styles.appointmentFooter}>
      <Text style={styles.patientName}>Kaushal</Text>
      <View style={styles.hospitalInfo}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.hospitalName}>Hospital Name</Text>
      </View>
    </View>
  </View>
</View>


        {/* Prescription Reminders */}
        <View style={styles.prescriptionSection}>
          <View style={styles.prescriptionHeader}>
            <Text style={styles.prescriptionTitle}>Prescription Reminders</Text>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </View>

          <View style={styles.prescriptionCard}>
            <View style={styles.medicineItem}>
              <View style={styles.pillIcon}>
                <View style={[styles.pill, { backgroundColor: '#FFB347' }]} />
              </View>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>Vitamin D</Text>
                <Text style={styles.medicineQuantity}>1 tablet</Text>
              </View>
              <View style={styles.medicineTime}>
                <Text style={styles.medicineType}>Supplement</Text>
                <Text style={styles.timeSlot}>Morning</Text>
              </View>
            </View>

            <View style={styles.medicineSeparator} />

            <View style={styles.medicineItem}>
              <View style={styles.pillIcon}>
                <View style={[styles.pill, { backgroundColor: '#FF6B6B' }]} />
              </View>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>Amlodipine</Text>
                <Text style={styles.medicineQuantity}>2 tablets</Text>
              </View>
              <View style={styles.medicineTime}>
                <Text style={styles.medicineType}>BP</Text>
                <Text style={styles.timeSlot}>Morning, Evening</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recommended Reads */}
        <View style={styles.readsSection}>
          <View style={styles.readsHeader}>
            <Text style={styles.readsTitle}>Recommended Reads</Text>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.readsScroll}>
            <View style={styles.readCard}>
              <View style={styles.readImage} />
              <View style={styles.readInfo}>
                <View style={styles.readTag}>
                  <Text style={styles.readTagText}>Stress Management</Text>
                </View>
                <Text style={styles.readTime}>7 min</Text>
                <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce Stress</Text>
              </View>
            </View>

            <View style={styles.readCard}>
              <View style={styles.readImage} />
              <View style={styles.readInfo}>
                <View style={styles.readTag}>
                  <Text style={styles.readTagText}>Stress Management</Text>
                </View>
                <Text style={styles.readTime}>5 min</Text>
                <Text style={styles.readTitle}>Mindfulness in Daily Life: Simple Practices to Reduce</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
     <View style={styles.bottomNav}>
  <TouchableOpacity style={styles.navItem}>
    <Image
      source={require("../../../assets/Dashoabdicons/home.png")} // 👈 apna PNG path daalna
      style={styles.navIcon}
    />
    <Text style={[styles.navText, { color: "#7475B4" }]}>Home</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.navItem}
    onPress={() => navigation.navigate("CaregiverDashboard")}
  >
    <Image
      source={require("../../../assets/Dashoabdicons/dashboad.png")}
      style={styles.navIcon}
    />
    <Text style={styles.navText}>Dashboard</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.navItem}
    onPress={() => navigation.navigate("LoginVaultId")}
  >
    <Image
      source={require("../../../assets/Dashoabdicons/Vector.png")}
      style={styles.navIcon}
    />
    <Text style={styles.navText}>Vault</Text>
  </TouchableOpacity>
</View>

      
      <TouchableOpacity style={styles.chatbotButton} onPress={handleChatbotPress}>
        <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.chatbotButtonGradient}>
          <Ionicons name="chatbubbles" size={30} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Sidebar Component */}
      <Sidebar 
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    
  },
  gradientBg: {
    paddingTop: Math.max(StatusBar.currentHeight || 0, 20) + 10, // Better status bar handling
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    minHeight: screenHeight * 0.25, // Minimum height to ensure proper spacing
  },
  header: {
    
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Math.max(20, screenWidth * 0.05), // Responsive padding
    marginBottom: 20,
    marginTop: 10, // Add top margin for better spacing
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    marginRight: 15,
  },
  greeting: {
    flex: 1,
    fontSize: Math.min(24, screenWidth * 0.06), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  sosButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  sosText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF4444",
  },
  wellBeingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: Math.max(15, screenWidth * 0.04), // Responsive margins
    marginVertical: 10,
    borderRadius: 50,
    paddingHorizontal: Math.max(20, screenWidth * 0.05), // Responsive padding
    paddingVertical: 15,
    elevation: 3,
    maxWidth: screenWidth - (Math.max(15, screenWidth * 0.04) * 2), // Prevent overflow
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 10, // Add margin to prevent text from touching button
  },
  cardSubtext: {
    fontSize: Math.min(13, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#7a7a7a",
    fontWeight: "600",
    marginBottom: 3,
    flexWrap: 'wrap', // Allow text wrapping
  },
  cardMainText: {
    fontSize: Math.min(15, screenWidth * 0.04), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "700",
    color: "#333",
    flexWrap: 'wrap', // Allow text wrapping
  },
  startButton: {
    backgroundColor: "#7475B4",
    paddingHorizontal: Math.max(18, screenWidth * 0.045), // Responsive padding
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 60, // Minimum button width 
  },
  startButtonText: {
    color: "#fff",
    fontSize: Math.min(15, screenWidth * 0.04), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    textAlign: 'center',
  },
  whiteContent: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },
  featuresSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05), // Responsive padding
    marginBottom: 30,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: Math.min(22, screenWidth * 0.055), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    alignSelf: "flex-start",
    width: "100%",
  },
  featuresGrid: {
    gap: 15,
    width: "100%",
    alignItems: "center",
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
    width: "100%",
  },
  featureItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    width: Math.min(107, screenWidth * 0.25), // Responsive icon size
    height: Math.min(107, screenWidth * 0.25),
  },
  featureTitle: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 8,
  },
  vitalsSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05), // Responsive padding
    marginBottom: 30,
    alignItems: "center",
  },
  vitalsCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    // borderRadius: 20,
    padding: Math.max(20, screenWidth * 0.05), // Responsive padding
    flexDirection: "row",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
    boderBottomWidth: 1,
    width: "100%",
  },
  vitalsLeft: {
    flex: 1,
  },
  vitalsTitle: {
    fontSize: Math.min(18, screenWidth * 0.045), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
  },
  deviceConnected: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#4ECDC4",
    fontWeight: "500",
  },
  vitalsRight: {
    flexDirection: "row",
    gap: Math.max(15, screenWidth * 0.04), // Responsive gap
  },
  vitalCircle: {
    width: Math.min(80, screenWidth * 0.18), // Responsive size
    height: Math.min(80, screenWidth * 0.18),
    borderRadius: Math.min(40, screenWidth * 0.09),
    borderWidth: 3,
    borderColor: "#39A6A3",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  vitalLabel: {
    fontSize: Math.min(12, screenWidth * 0.03), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#666",
    fontWeight: "500",
  },
  vitalValue: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  appointmentSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05), // Responsive padding
    marginBottom: 30,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  appointmentTitle: {
    fontSize: Math.min(22, screenWidth * 0.055), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  appointmentCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  appointmentCard: {
    backgroundColor: "#C9CAFF",
    padding: Math.max(20, screenWidth * 0.05), // Responsive padding
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentFooter: {
    backgroundColor: "#fff",
    padding: Math.max(20, screenWidth * 0.05), // Responsive padding
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: Math.min(18, screenWidth * 0.045), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#1E1E1E",
  },
  patientName: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#333",
    fontWeight: "600",
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  hospitalName: {
    fontFamily: "Poppins_400Regular",
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    color: "#666",
    marginLeft: 4,
  },
  doctorAvatar: {
  width: 70,
  height: 70,
  borderRadius: 25,
  overflow: "hidden", // image circular crop hoga
  marginRight: 12,
  backgroundColor: "#eee", // fallback bg
},

doctorImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},
  appointmentTime: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 2,
  },
  timeText: {
    fontSize: Math.min(18, screenWidth * 0.045), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  prescriptionSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05), // Responsive padding
    marginBottom: 30,
  },
  prescriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  prescriptionTitle: {
    fontSize: Math.min(22, screenWidth * 0.055), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  prescriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: Math.max(20, screenWidth * 0.05), // Responsive padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  pill: {
    width: 20,
    height: 12,
    borderRadius: 6,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  medicineQuantity: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#666",
  },
  medicineTime: {
    alignItems: "flex-end",
  },
  medicineType: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  timeSlot: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#666",
  },
  medicineSeparator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 10,
  },
  readsSection: {
    paddingHorizontal: Math.max(20, screenWidth * 0.05), // Responsive padding
    marginBottom: 30,
    alignItems: "center",
  },
  readsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
  },
  readsTitle: {
    fontSize: Math.min(22, screenWidth * 0.055), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  readsScroll: {
    paddingLeft: 0,
  },
  readCard: {
    width: Math.min(280, screenWidth * 0.7), // Responsive width
    marginRight: 15,
    backgroundColor: "#fff",
    // borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    elevation: 3,
  },
  readImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#39A6A3",
  },
  readInfo: {
    padding: 15,
  },
  readTag: {
    backgroundColor: "#E8F5F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  readTagText: {
    fontSize: Math.min(12, screenWidth * 0.03), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#39A6A3",
    fontWeight: "500",
  },
  readTime: {
    fontSize: Math.min(12, screenWidth * 0.03), // Responsive font size
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginBottom: 8,
    textAlign: "right",
    position: "absolute",
    top: 15,
    right: 15,
  },
  readTitle: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontFamily: "Poppins_400Regular",
    fontWeight: "500",
    color: "#333",
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 50,
  },
  bottomNav: {
  flexDirection: "row",
  justifyContent: "space-around",
  paddingVertical: 20,
  // backgroundColor: "#fff",

  // Shadow for iOS
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -2}, // 👈 upar ki taraf shadow
  shadowOpacity: 0.1,
  shadowRadius: 6,

  // Shadow for Android
  elevation: 8,
},

  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 25,  // 👈 same size jaise Ionicons tha
    height: 25,
    resizeMode: "contain",
    // marginBottom: 2,
  },
  navText: {
    fontSize: 12,
      fontFamily: "Poppins_400Regular",
    color: "#999",
  },
   chatbotButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  chatbotButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});