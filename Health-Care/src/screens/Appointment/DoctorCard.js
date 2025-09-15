import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config/config";

export default function DoctorDetailScreen({ route, navigation }) {
  const { doctor } = route.params;

  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [price, setPrice] = useState(0);

  // ✅ Fetch slots
  const fetchAvailableSlotsForDate = async (doctorId, date) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/doctors/${doctorId}/slots?date=${date}`
      );
      const data = await response.json();

      if (response.ok) {
        setSlots(data.availableSlots || []);
        setPrice(data.price || doctor.fees);
      } else {
        setSlots(doctor?.availableSlots || []);
        setPrice(doctor?.fees || 0);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlots(doctor?.availableSlots || []);
      setPrice(doctor?.fees || 0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initialize today’s slots
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchAvailableSlotsForDate(doctor._id, today);
  }, []);

  // ✅ Book Appointment
const handleBooking = async () => {
  if (!patientName.trim() || !patientEmail.trim()) {
    Alert.alert("Error", "Please enter patient name and email");
    return;
  }
  if (!selectedDate || !selectedTime) {
    Alert.alert("Error", "Please select a date & slot");
    return;
  }

  try {
    setLoading(true);
    const response = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: doctor._id,
        patientName,
        patientEmail,
        slot: selectedTime,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      Alert.alert("Success", "Appointment booked successfully");
      setSelectedTime(null);
      setPatientName("");
      setPatientEmail("");

      // ✅ Booking ke baad navigation
      navigation.navigate("MyAppointments");
    } else {
      Alert.alert("Error", data.message || "Booking failed");
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpec}>
                {doctor.specialization} | {doctor.hospitalName}
              </Text>
              <Text style={styles.about}>{doctor.bio}</Text>
            </View>

            <Image
              source={
                doctor.profilePicture
                  ? { uri: doctor.profilePicture }
                  : require("../../../assets/doctor.png")
              }
              style={styles.doctorImage}
            />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doctor.experience} yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doctor.patients || 1000}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {doctor.rating ? `${doctor.rating}/5` : "4/5"}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Patient Info</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter patient name"
            value={patientName}
            onChangeText={setPatientName}
          />
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Enter patient email"
            value={patientEmail}
            onChangeText={setPatientEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Available Slots */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionHeading}>Available Slots</Text>
            <Ionicons name="calendar-outline" size={20} color="#111" />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6C63FF" />
          ) : slots.length === 0 ? (
            <Text style={{ color: "#666", marginTop: 10 }}>
              No slots available for this date
            </Text>
          ) : (
            <View style={styles.timeRow}>
              {slots.map((time, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.timeBox,
                    selectedTime === time && styles.timeSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View style={styles.bottomContainer}>
        <Text style={styles.priceText}>₹{price}</Text>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>
            {loading ? "Booking..." : "Book Appointment"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  doctorImage: { width: 80, height: 80, borderRadius: 12, marginLeft: 12 },
  doctorName: { fontSize: 18, fontWeight: "bold", color: "#111" },
  doctorSpec: { fontSize: 14, color: "#666", marginVertical: 4 },
  about: { fontSize: 13, color: "#777", marginTop: 2 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: {
    flex: 1,
    backgroundColor: "#F8FCFF",
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CFE7FF",
  },
  statValue: { fontSize: 15, fontWeight: "bold", color: "#111" },
  statLabel: { fontSize: 12, color: "#444", marginTop: 2 },
  section: { marginBottom: 20 },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  timeBox: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    margin: 6,
  },
  timeSelected: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  timeText: { fontSize: 14, color: "#111" },
  timeTextSelected: { color: "#fff" },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: { fontSize: 18, fontWeight: "bold", color: "#111" },
  bookButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
