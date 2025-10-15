import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorPng from "../../../assets/Dashoabdicons/Group 21.png";
import CheckupPng from "../../../assets/Dashoabdicons/Group 22.png";
import CalendarPng from "../../../assets/Dashoabdicons/Group 23.png";
import CameraPng from "../../../assets/Dashoabdicons/Group 24.png";
import PrescriptionPng from "../../../assets/Dashoabdicons/MentalHealth.png";
import GamesPng from "../../../assets/Dashoabdicons/Group 29.png";
import Xray from '../../../assets/Dashoabdicons/Xray.png';
import prenativeHealth from '../../../assets/Dashoabdicons/prenativeHealth.png';
import pregnancy from '../../../assets/Dashoabdicons/pregnancy.png';
import Insurance from '../../../assets/Dashoabdicons/Insurance.png'; 
import Diet from '../../../assets/Dashoabdicons/Diet.png';
import Calorie from '../../../assets/Dashoabdicons/Calorie.png';
const { width: screenWidth } = Dimensions.get('window');

const PngIcon = ({ source, style }) => (
  <Image source={source} style={[{ resizeMode: "contain" }, style]} />
);

export default function FeaturesScreen({ navigation }) {
  const features = [
    {
      title: "Health Analysis Tools",
      items: [
        {
          icon: GamesPng,
          route: "AiHealthCheckupScreen",
        },
        {
          icon: CheckupPng,
          route: "CosmeticScreen",
        },
         {
          icon: Xray,
          route: "XrayScreen",
        },
        {
          icon: CalendarPng,
          route: "SymptomChecker",
        },
       
        {
          icon: PrescriptionPng,
          route: "MentalHealthScreen",
        },
        {
          icon: prenativeHealth,
          route: "PreventiveHealthScreen",
        },
      ],
    },
    {
      title: "Medical and Treatment Planning",
      items: [
        {
          icon: CameraPng,
          route: "AIDoctor",
        },
        {
          icon: pregnancy,
          route: "PregnancyScreen",
        },
        {
          icon: Insurance,
          route: "InsuranceScreen",
        },
      ],
    },
    {
      title: "Wellness and Lifestyle",
      items: [
        {
          icon: Diet,
          route: "DietScreen",
        },
        {
          icon: Calorie,
          route: "CalorieCalculator",
        },
        {
          icon: DoctorPng,
          route: "HealthGames",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Features</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {features.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            <View style={styles.featuresGrid}>
              {category.items.map((feature, featureIndex) => (
                <TouchableOpacity
                  key={featureIndex}
                  style={styles.featureItem}
                  onPress={() => navigation.navigate(feature.route)}
                >
                  <PngIcon source={feature.icon} style={styles.featureIcon} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  categorySection: {
    marginTop: 25,
  },
  categoryHeader: {
    backgroundColor: "#7475B4",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#fff",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    gap: 20,
  },
  featureItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    width: 107,
    height: 120,
  },
  bottomSpacing: {
    height: 30,
  },
});