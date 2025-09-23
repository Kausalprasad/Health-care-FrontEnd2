import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config/config';

const ProfileView = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B7AD8" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.noDataText}>No profile found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8E5F3" />
      
      {/* Header with gradient background */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.basicInfo?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>
            {profile.basicInfo?.fullName || 'Unknown'}
          </Text>
          <Text style={styles.profileSubtitle}>
            {profile.basicInfo?.gender || 'Gender'} • {profile.basicInfo?.dateOfBirth ? 
              new Date().getFullYear() - new Date(profile.basicInfo.dateOfBirth).getFullYear() : 'Age'} • {profile.basicInfo?.patientID || 'Patient ID'}
          </Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {profile.contactInfo?.email || 'abc@gmail.com'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone no.</Text>
              <Text style={styles.infoValue}>
                {profile.contactInfo?.primaryPhone || '9876543210'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOB</Text>
              <Text style={styles.infoValue}>
                {profile.basicInfo?.dateOfBirth ? 
                  new Date(profile.basicInfo.dateOfBirth).toLocaleDateString('en-GB') : 'DD/MM/YY'}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              <Text style={styles.infoValue}>
                {profile.basicInfo?.bloodGroup || 'B+'}
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>
                {profile.emergencyContact?.name || 'Kaushal'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relation</Text>
              <Text style={styles.infoValue}>
                {profile.emergencyContact?.relationship || 'Friend'}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.infoLabel}>Phone No.</Text>
              <Text style={styles.infoValue}>
                {profile.emergencyContact?.phoneNumber || '9876543210'}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Conditions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Condition</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {profile.medicalConditions && profile.medicalConditions.length > 0 ? (
              profile.medicalConditions.map((condition, index) => (
                <View 
                  key={`condition-${index}`} 
                  style={[
                    styles.conditionRow,
                    index === profile.medicalConditions.length - 1 && styles.lastRow
                  ]}
                >
                  <Text style={styles.conditionText}>{condition.conditionName}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.conditionRow, styles.lastRow]}>
                <Text style={styles.conditionText}>Diabetes</Text>
              </View>
            )}
            {profile.medicalConditions && profile.medicalConditions.length > 1 && (
              <View style={[styles.conditionRow, styles.lastRow]}>
                <Text style={styles.conditionText}>Hypertension</Text>
              </View>
            )}
          </View>
        </View>

        {/* Allergies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {profile.allergies && profile.allergies.length > 0 ? (
              profile.allergies.map((allergy, index) => (
                <View 
                  key={`allergy-${index}`}
                  style={[
                    styles.infoRow,
                    index === profile.allergies.length - 1 && styles.lastRow
                  ]}
                >
                  <Text style={styles.infoLabel}>{allergy.allergenName}</Text>
                  <Text style={styles.infoValue}>{allergy.severity}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nuts</Text>
                  <Text style={styles.infoValue}>Severe</Text>
                </View>
                <View style={[styles.infoRow, styles.lastRow]}>
                  <Text style={styles.infoLabel}>Pollen</Text>
                  <Text style={styles.infoValue}>Mild</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
     marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#E8E5F3',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 100,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 25,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#8B7AD8',
  },
  scrollView: {
    flex: 1,
    marginTop: -60,
  },
  profileHeader: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#8B7AD8',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B7AD8',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  conditionRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  conditionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileView;