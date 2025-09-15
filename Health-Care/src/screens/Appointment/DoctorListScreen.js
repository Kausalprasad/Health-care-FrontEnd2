// --- Updated BookAppointmentScreen with Navigation --- //

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { BASE_URL } from "../../config/config";

export default function BookAppointmentScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minRating, setMinRating] = useState("");

  // Temporary filter states
  const [tempSpecialization, setTempSpecialization] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [tempMinRating, setTempMinRating] = useState("");

  // unique lists
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);

  // Backend se doctors fetch karna
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/doctors`);
        const data = await response.json();
        setDoctors(data);
        setFilteredDoctors(data);

        // unique values extract
        const uniqueSpecs = [...new Set(data.map((d) => d.specialization))];
        const uniqueLocs = [...new Set(data.map((d) => d.location))];
        setSpecializations(uniqueSpecs);
        setLocations(uniqueLocs);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Search + Filter functionality
  useEffect(() => {
    let filtered = doctors;

    if (searchText.trim() !== "") {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchText.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(
        (doc) => doc.specialization === selectedSpecialization
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((doc) => doc.location === selectedLocation);
    }

    if (minRating) {
      filtered = filtered.filter(
        (doc) => (doc.rating || 0) >= parseFloat(minRating)
      );
    }

    setFilteredDoctors(filtered);
  }, [searchText, doctors, selectedSpecialization, selectedLocation, minRating]);

  const applyFilters = () => {
    setSelectedSpecialization(tempSpecialization);
    setSelectedLocation(tempLocation);
    setMinRating(tempMinRating);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedSpecialization("");
    setSelectedLocation("");
    setMinRating("");
    setTempSpecialization("");
    setTempLocation("");
    setTempMinRating("");
  };

  // Star rating component
  const StarRating = ({ rating, totalReviews }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color="#E0E0E0" />
        );
      }
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>{stars}</View>
        <Text style={styles.reviewCount}>({totalReviews || 0})</Text>
      </View>
    );
  };

  // Doctor card with navigation
  const DoctorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate("DoctorCard", { doctor: item })}
    >
      <View style={styles.doctorInfo}>
        <View style={styles.avatarContainer}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Ionicons name="person" size={30} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.specialization}>
            {item.specialization} | {item.hospitalName || "Hospital Name"}
          </Text>
          <StarRating
            rating={item.rating || 4.2}
            totalReviews={item.totalReviews || 127}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      </SafeAreaView>
    );
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
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or speciality"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            (selectedSpecialization || selectedLocation || minRating) &&
              styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={
              selectedSpecialization || selectedLocation || minRating
                ? "#007AFF"
                : "#666"
            }
          />
        </TouchableOpacity>
      </View>

      {/* Doctors List */}
      <FlatList
        data={filteredDoctors.slice(0, 3)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <DoctorCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter Doctors</Text>

            {/* Specialization */}
            <Text style={styles.filterLabel}>Specialization</Text>
            <Picker
              selectedValue={tempSpecialization}
              onValueChange={(value) => setTempSpecialization(value)}
            >
              <Picker.Item label="All" value="" />
              {specializations.map((spec, idx) => (
                <Picker.Item key={idx} label={spec} value={spec} />
              ))}
            </Picker>

            {/* Location */}
            <Text style={styles.filterLabel}>Location</Text>
            <Picker
              selectedValue={tempLocation}
              onValueChange={(value) => setTempLocation(value)}
            >
              <Picker.Item label="All" value="" />
              {locations.map((loc, idx) => (
                <Picker.Item key={idx} label={loc} value={loc} />
              ))}
            </Picker>

            {/* Rating */}
            <Text style={styles.filterLabel}>Minimum Rating</Text>
            <Picker
              selectedValue={tempMinRating}
              onValueChange={(value) => setTempMinRating(value)}
            >
              <Picker.Item label="Any" value="" />
              <Picker.Item label="3+" value="3" />
              <Picker.Item label="4+" value="4" />
              <Picker.Item label="4.5+" value="4.5" />
            </Picker>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles (same as before + modal styles) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  placeholder: { width: 40 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#000" },
  filterButton: {
    position: "relative",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterButtonActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  doctorInfo: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorDetails: { flex: 1 },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  specialization: { fontSize: 14, color: "#666", marginBottom: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  starsContainer: { flexDirection: "row", marginRight: 6 },
  reviewCount: { fontSize: 12, color: "#666" },
  separator: { height: 8 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 16, color: "#666" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  filterLabel: { fontSize: 14, fontWeight: "500", marginTop: 10 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  clearButton: { backgroundColor: "#f0f0f0" },
  applyButton: { backgroundColor: "#007AFF" },
  clearButtonText: { color: "#000", fontWeight: "600" },
  applyButtonText: { color: "#fff", fontWeight: "600" },
});
