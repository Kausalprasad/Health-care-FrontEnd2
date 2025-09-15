import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BASE_URL } from "../../config/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function MyAppointments({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) setUserEmail(user.email);
      else {
        setUserEmail(null);
        setAppointments([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAppointments = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/bookings?email=${userEmail}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userEmail]);

  const handleCancel = async (bookingId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", data.message);
        fetchAppointments();
      } else {
        Alert.alert("Error", data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const openRescheduleModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedSlot(appointment.slot);
    setAvailableSlots([]);
    setLoadingSlots(true);

    if (!appointment.doctorId?._id) {
      Alert.alert("Error", "Doctor ID missing for this appointment");
      setLoadingSlots(false);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/doctors/${appointment.doctorId._id}/slots?date=${appointment.appointmentDate}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      Alert.alert("Error", "Failed to fetch available slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
      setRescheduleModalVisible(true);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !selectedSlot) return;
    try {
      const response = await fetch(
        `${BASE_URL}/api/bookings/${selectedAppointment._id}/reschedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newSlot: selectedSlot,
            newDate: selectedAppointment.appointmentDate,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Appointment rescheduled!");
        setRescheduleModalVisible(false);
        setSelectedAppointment(null);
        setSelectedSlot("");
        fetchAppointments();
      } else {
        Alert.alert("Error", data.message || "Failed to reschedule appointment");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#5DBAAE" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <View style={styles.headerSpace} />
        </View>
        <View style={styles.separator} />
        <View style={styles.emptyContainer}>
          <Text style={styles.noDataText}>No appointments booked yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* Header */}
     <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={styles.placeholder} />
      </View>

      
      {/* Gray separator line */}
      <View style={styles.separator} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.upcomingText}>Upcoming</Text>

        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              {/* Teal top section */}
              <View style={styles.cardTop}>
                <View style={styles.leftInfo}>
                 <Image
  source={
    item.doctorId?.profilePicture
      ? { uri: item.doctorId.profilePicture }
      : require("../../../assets/doctor.png")
  }
  style={styles.doctorPhoto}
/>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>
                      {item.doctorId?.name || "Dr. Mehra"}
                    </Text>
                    <Text style={styles.doctorSpecialty}>
                      {item.doctorId?.specialization || "Dermatologist"}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.rightInfo}>
                  <Text style={styles.dateText}>
                    {item.appointmentDate || "04 Sep"}
                  </Text>
                  <Text style={styles.timeText}>
                    {item.slot || "10:00 am"}
                  </Text>
                </View>
              </View>

              {/* White bottom section */}
              <View style={styles.cardBottom}>
                <View style={styles.patientInfo}>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Patient: </Text>
                    <Text style={styles.infoValue}>
                      {item.patientName || "Kaushal"}
                    </Text>
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Hospital: </Text>
                    <Text style={styles.infoValue}>
                      {item.hospitalName || "Namo"}
                    </Text>
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Cost: </Text>
                    <Text style={styles.infoValue}>
                      ${item.fees || "250"}
                    </Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openRescheduleModal(item)}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Modal */}
      <Modal
        visible={rescheduleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>

            {loadingSlots ? (
              <ActivityIndicator size="large" color="#5DBAAE" />
            ) : (
              <Picker
                selectedValue={selectedSlot}
                onValueChange={(value) => setSelectedSlot(value)}
                style={styles.picker}
              >
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => (
                    <Picker.Item key={index} label={slot} value={slot} />
                  ))
                ) : (
                  <Picker.Item label="No slots available" value="" />
                )}
              </Picker>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleReschedule}
              disabled={loadingSlots || availableSlots.length === 0}
            >
              <Text style={styles.buttonText}>Update Slot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelBtn]}
              onPress={() => handleCancel(selectedAppointment?._id)}
            >
              <Text style={styles.buttonText}>Cancel Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRescheduleModalVisible(false)}
              style={[styles.modalButton, styles.closeBtn]}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  
  // Header with back arrow and title
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  backButton: {
    marginRight: 12,
  },
  backArrow: {
    fontSize: 24,
    color: "#000000",
    fontWeight: "400",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    textAlign: "center",
    marginRight: 36, // Balance for back arrow
  },
  headerSpace: {
    width: 36,
  },
  
  // Gray line separator
  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 0,
  },

  // Content area
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  upcomingText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 20,
  },

  // Appointment card
  appointmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Teal header section
  cardTop: {
    backgroundColor: "#39A6A3",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: "#ffffff",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  rightInfo: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },

  // White bottom section
  cardBottom: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  patientInfo: {
    flex: 1,
  },
  infoLine: {
    fontSize: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#000000",
  },
  infoValue: {
    fontWeight: "400",
    color: "#000000",
  },
  editButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
  },

  // Loading states
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#666666",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  picker: {
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#5DBAAE",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
  },
  closeBtn: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});