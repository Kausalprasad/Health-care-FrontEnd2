import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Image 
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

  // Edit handlers for different sections
  const handleEditBasicInfo = () => {
    navigation.navigate('ProfileSetupStep1', { 
      isEdit: true, 
      profileData: profile 
    });
  };

  const handleEditEmergencyContact = () => {
    navigation.navigate('ProfileSetupStep2', { 
      isEdit: true, 
      profileData: profile 
    });
  };

  const handleEditMedicalInfo = () => {
    navigation.navigate('ProfileSetupStep3', { 
      isEdit: true, 
      profileData: profile 
    });
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'What would you like to edit?',
      [
        {
          text: 'Basic Information',
          onPress: handleEditBasicInfo
        },
        {
          text: 'Emergency Contact', 
          onPress: handleEditEmergencyContact
        },
        {
          text: 'Medical Information',
          onPress: handleEditMedicalInfo
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

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
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('ProfileSetupStep1')}
        >
          <Text style={styles.createButtonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#B4A7D6" />
      
      {/* Header with purple background */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card with overlapping avatar */}
        <View style={styles.profileHeader}>
          {/* Avatar positioned to overlap */}
          <View style={styles.avatarOverlay}>
            {profile.basicInfo?.profilePhoto?.url ? (
              <Image 
                source={{ uri: `${BASE_URL}${profile.basicInfo.profilePhoto.url}` }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
          
          <Text style={styles.profileName}>
            {profile.basicInfo?.fullName || 'Anushka'}
          </Text>
          <Text style={styles.profileSubtitle}>
            {profile.basicInfo?.gender || 'Gender'} . {profile.basicInfo?.dateOfBirth ? 
              new Date().getFullYear() - new Date(profile.basicInfo.dateOfBirth).getFullYear() + ' Age' : 'Age'} . {profile.basicInfo?.patientID || 'Patient ID'}
          </Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
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
            <View style={styles.dividerLine} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone no.</Text>
              <Text style={styles.infoValue}>
                {profile.contactInfo?.primaryPhone || '9876543210'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOB</Text>
              <Text style={styles.infoValue}>
                {profile.basicInfo?.dateOfBirth ? 
                  new Date(profile.basicInfo.dateOfBirth).toLocaleDateString('en-GB') : 'DD/MM/YY'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
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
          <View style={styles.sectionHeaderWithEdit}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TouchableOpacity onPress={handleEditEmergencyContact}>
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
            <View style={styles.dividerLine} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relation</Text>
              <Text style={styles.infoValue}>
                {profile.emergencyContact?.relationship || 'Friend'}
              </Text>
            </View>
            <View style={styles.dividerLine} />
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
          <View style={styles.sectionHeaderWithEdit}>
            <Text style={styles.sectionTitle}>Medical Condition</Text>
            <TouchableOpacity onPress={handleEditMedicalInfo}>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {profile.medicalConditions && profile.medicalConditions.length > 0 ? (
              profile.medicalConditions.map((condition, index) => (
                <View key={`condition-${index}`}>
                  <View style={styles.conditionRow}>
                    <Text style={styles.conditionText}>{condition.conditionName}</Text>
                  </View>
                  {index < profile.medicalConditions.length - 1 && <View style={styles.dividerLine} />}
                </View>
              ))
            ) : (
              <>
                <View style={styles.conditionRow}>
                  <Text style={styles.conditionText}>Diabetes</Text>
                </View>
                <View style={styles.dividerLine} />
                <View style={[styles.conditionRow, styles.lastRow]}>
                  <Text style={styles.conditionText}>Hypertension</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Allergies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithEdit}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <TouchableOpacity onPress={handleEditMedicalInfo}>
              <Ionicons name="pencil" size={16} color="#8B7AD8" />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {profile.allergies && profile.allergies.length > 0 ? (
              profile.allergies.map((allergy, index) => (
                <View key={`allergy-${index}`}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{allergy.allergenName}</Text>
                    <Text style={styles.infoValue}>{allergy.severity}</Text>
                  </View>
                  {index < profile.allergies.length - 1 && <View style={styles.dividerLine} />}
                </View>
              ))
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nuts</Text>
                  <Text style={styles.infoValue}>Severe</Text>
                </View>
                <View style={styles.dividerLine} />
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
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#8B7AD8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#B4A7D6',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 50,
    position: 'relative',
    overflow: 'visible',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : StatusBar.currentHeight + 15,
    left: 16,
    zIndex: 10,
    padding: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  scrollView: {
    flex: 1,
    marginTop: 30,
  },
  profileHeader: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
    position: 'relative',
    marginTop: 40,
  },
  avatarOverlay: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 40,
    // backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 6,
    // overflow: 'hidden',
    zIndex: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F0F0',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  editButton: {
    backgroundColor: '#8B7AD8',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B7AD8',
    marginBottom: 12,
  },
  sectionHeaderWithEdit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 20,
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
    color: '#000',
    fontWeight: '500',
  },
  conditionRow: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  conditionText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
  bottomPadding: {
    height: 40,
  },
});

export default ProfileView;