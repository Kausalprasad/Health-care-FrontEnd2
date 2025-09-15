// screens/UserProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Switch,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { BASE_URL } from '../../config/config';

export default function UserProfileScreen  ({ navigation })  {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: '',
      dateOfBirth: new Date(),
      gender: '',
      bloodGroup: '',
      profilePhoto: { url: '', filename: '' },
      patientID: ''
    },
    contactInfo: {
      primaryPhone: '',
      email: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
      enableSMS: true,
      enableCall: true
    }
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Caregiver', 'Other'];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const getAuthToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // Replace with your API URL
      const response = await fetch(`${BASE_URL}/api/profile`, {
     
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          basicInfo: {
            fullName: data.data.basicInfo?.fullName || '',
            dateOfBirth: data.data.basicInfo?.dateOfBirth ? new Date(data.data.basicInfo.dateOfBirth) : new Date(),
            gender: data.data.basicInfo?.gender || '',
            bloodGroup: data.data.basicInfo?.bloodGroup || '',
            profilePhoto: data.data.basicInfo?.profilePhoto || { url: '', filename: '' },
            patientID: data.data.basicInfo?.patientID || ''
          },
          contactInfo: {
            primaryPhone: data.data.contactInfo?.primaryPhone || '',
            email: data.data.contactInfo?.email || ''
          },
          emergencyContact: {
            name: data.data.emergencyContact?.name || '',
            relationship: data.data.emergencyContact?.relationship || '',
            phoneNumber: data.data.emergencyContact?.phoneNumber || '',
            enableSMS: data.data.emergencyContact?.enableSMS ?? true,
            enableCall: data.data.emergencyContact?.enableCall ?? true
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setEditMode(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            profilePhoto: {
              url: result.assets[0].uri,
              filename: result.assets[0].fileName || 'profile.jpg'
            }
          }
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderPicker = (items, selectedValue, onSelect, visible, onClose, title) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedValue === item && styles.selectedPickerItem
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  selectedValue === item && styles.selectedPickerItemText
                ]}>
                  {item}
                </Text>
                {selectedValue === item && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderDatePicker = () => (
    <Modal visible={showDatePicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>
              Selected: {formatDate(formData.basicInfo.dateOfBirth)}
            </Text>
            <Text style={styles.datePickerAge}>
              Age: {calculateAge(formData.basicInfo.dateOfBirth)} years
            </Text>
            
            {/* Year Selector */}
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Year:</Text>
              <View style={styles.dateControls}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(formData.basicInfo.dateOfBirth);
                    newDate.setFullYear(newDate.getFullYear() - 1);
                    setFormData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, dateOfBirth: newDate }
                    }));
                  }}
                >
                  <Ionicons name="remove" size={20} color="#007AFF" />
                </TouchableOpacity>
                
                <Text style={styles.dateValue}>
                  {formData.basicInfo.dateOfBirth.getFullYear()}
                </Text>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(formData.basicInfo.dateOfBirth);
                    if (newDate.getFullYear() < new Date().getFullYear()) {
                      newDate.setFullYear(newDate.getFullYear() + 1);
                      setFormData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, dateOfBirth: newDate }
                      }));
                    }
                  }}
                >
                  <Ionicons name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Month Selector */}
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Month:</Text>
              <View style={styles.dateControls}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(formData.basicInfo.dateOfBirth);
                    let newMonth = newDate.getMonth() - 1;
                    if (newMonth < 0) {
                      newMonth = 11;
                      newDate.setFullYear(newDate.getFullYear() - 1);
                    }
                    newDate.setMonth(newMonth);
                    setFormData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, dateOfBirth: newDate }
                    }));
                  }}
                >
                  <Ionicons name="remove" size={20} color="#007AFF" />
                </TouchableOpacity>
                
                <Text style={styles.dateValue}>
                  {formData.basicInfo.dateOfBirth.toLocaleDateString('en-IN', { month: 'long' })}
                </Text>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(formData.basicInfo.dateOfBirth);
                    let newMonth = newDate.getMonth() + 1;
                    if (newMonth > 11) {
                      newMonth = 0;
                      newDate.setFullYear(newDate.getFullYear() + 1);
                    }
                    newDate.setMonth(newMonth);
                    if (newDate <= new Date()) {
                      setFormData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, dateOfBirth: newDate }
                      }));
                    }
                  }}
                >
                  <Ionicons name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Day Selector */}
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Day:</Text>
              <View style={styles.dateControls}>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(formData.basicInfo.dateOfBirth);
                    let newDay = newDate.getDate() - 1;
                    if (newDay < 1) {
                      newDate.setMonth(newDate.getMonth() - 1);
                      newDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
                    }
                    newDate.setDate(newDay);
                    setFormData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, dateOfBirth: newDate }
                    }));
                  }}
                >
                  <Ionicons name="remove" size={20} color="#007AFF" />
                </TouchableOpacity>
                
                <Text style={styles.dateValue}>
                  {formData.basicInfo.dateOfBirth.getDate()}
                </Text>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    const newDate = new Date(formData.basicInfo.dateOfBirth);
                    const daysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
                    let newDay = newDate.getDate() + 1;
                    if (newDay > daysInMonth) {
                      newDay = 1;
                      newDate.setMonth(newDate.getMonth() + 1);
                    }
                    newDate.setDate(newDay);
                    if (newDate <= new Date()) {
                      setFormData(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, dateOfBirth: newDate }
                      }));
                    }
                  }}
                >
                  <Ionicons name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => editMode ? updateProfile() : setEditMode(true)}>
          {saving ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.editButton}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={editMode ? pickImage : null}>
            <View style={styles.photoContainer}>
              {formData.basicInfo.profilePhoto.url ? (
                <Image
                  source={{ uri: formData.basicInfo.profilePhoto.url }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Ionicons name="person" size={60} color="#ccc" />
                </View>
              )}
              {editMode && (
                <View style={styles.editPhotoOverlay}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>
            {editMode ? 'Tap to change photo' : formData.basicInfo.fullName || 'User'}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={formData.basicInfo.fullName}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                basicInfo: { ...prev.basicInfo, fullName: text }
              }))}
              placeholder="Enter your full name"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput, !editMode && styles.disabledInput]}
              onPress={() => editMode && setShowDatePicker(true)}
            >
              <Text style={!editMode && styles.disabledText}>
                {formatDate(formData.basicInfo.dateOfBirth)} 
                ({calculateAge(formData.basicInfo.dateOfBirth)} years)
              </Text>
              {editMode && <Ionicons name="calendar" size={20} color="#007AFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput, !editMode && styles.disabledInput]}
              onPress={() => editMode && setShowGenderPicker(true)}
            >
              <Text style={!editMode && styles.disabledText}>
                {formData.basicInfo.gender || 'Select gender'}
              </Text>
              {editMode && <Ionicons name="chevron-down" size={20} color="#007AFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Blood Group</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput, !editMode && styles.disabledInput]}
              onPress={() => editMode && setShowBloodGroupPicker(true)}
            >
              <Text style={!editMode && styles.disabledText}>
                {formData.basicInfo.bloodGroup || 'Select blood group'}
              </Text>
              {editMode && <Ionicons name="chevron-down" size={20} color="#007AFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient ID</Text>
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={formData.basicInfo.patientID}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                basicInfo: { ...prev.basicInfo, patientID: text }
              }))}
              placeholder="Enter patient ID (optional)"
              editable={editMode}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Primary Phone</Text>
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={formData.contactInfo.primaryPhone}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, primaryPhone: text }
              }))}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={formData.contactInfo.email}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, email: text }
              }))}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={editMode}
            />
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Name</Text>
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={formData.emergencyContact.name}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, name: text }
              }))}
              placeholder="Enter contact name"
              editable={editMode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Relationship</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput, !editMode && styles.disabledInput]}
              onPress={() => editMode && setShowRelationshipPicker(true)}
            >
              <Text style={!editMode && styles.disabledText}>
                {formData.emergencyContact.relationship || 'Select relationship'}
              </Text>
              {editMode && <Ionicons name="chevron-down" size={20} color="#007AFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={formData.emergencyContact.phoneNumber}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, phoneNumber: text }
              }))}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              editable={editMode}
            />
          </View>

          {editMode && (
            <>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable SMS Alerts</Text>
                <Switch
                  value={formData.emergencyContact.enableSMS}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, enableSMS: value }
                  }))}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={formData.emergencyContact.enableSMS ? "#007AFF" : "#f4f3f4"}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable Call Alerts</Text>
                <Switch
                  value={formData.emergencyContact.enableCall}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, enableCall: value }
                  }))}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={formData.emergencyContact.enableCall ? "#007AFF" : "#f4f3f4"}
                />
              </View>
            </>
          )}
        </View>

        {/* Profile Completion */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Completion</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${profile.profileCompletion?.completionPercentage || 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {profile.profileCompletion?.completionPercentage || 0}% Complete
              </Text>
            </View>
            
            <View style={styles.completionSteps}>
              <View style={styles.stepItem}>
                <Ionicons 
                  name={profile.profileCompletion?.step1Completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={profile.profileCompletion?.step1Completed ? "#4CAF50" : "#ccc"} 
                />
                <Text style={styles.stepText}>Basic Information</Text>
              </View>
              <View style={styles.stepItem}>
                <Ionicons 
                  name={profile.profileCompletion?.step2Completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={profile.profileCompletion?.step2Completed ? "#4CAF50" : "#ccc"} 
                />
                <Text style={styles.stepText}>Emergency Contact</Text>
              </View>
              <View style={styles.stepItem}>
                <Ionicons 
                  name={profile.profileCompletion?.step3Completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={profile.profileCompletion?.step3Completed ? "#4CAF50" : "#ccc"} 
                />
                <Text style={styles.stepText}>Medical Information</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Custom Date Picker */}
      {renderDatePicker()}

      {/* Blood Group Picker */}
      {renderPicker(
        bloodGroups,
        formData.basicInfo.bloodGroup,
        (value) => setFormData(prev => ({
          ...prev,
          basicInfo: { ...prev.basicInfo, bloodGroup: value }
        })),
        showBloodGroupPicker,
        () => setShowBloodGroupPicker(false),
        'Select Blood Group'
      )}

      {/* Gender Picker */}
      {renderPicker(
        genders,
        formData.basicInfo.gender,
        (value) => setFormData(prev => ({
          ...prev,
          basicInfo: { ...prev.basicInfo, gender: value }
        })),
        showGenderPicker,
        () => setShowGenderPicker(false),
        'Select Gender'
      )}

      {/* Relationship Picker */}
      {renderPicker(
        relationships,
        formData.emergencyContact.relationship,
        (value) => setFormData(prev => ({
          ...prev,
          emergencyContact: { ...prev.emergencyContact, relationship: value }
        })),
        showRelationshipPicker,
        () => setShowRelationshipPicker(false),
        'Select Relationship'
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
        marginTop: StatusBar.currentHeight || 0,
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  photoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  photoHint: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  disabledText: {
    color: '#666',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  completionSteps: {
    marginTop: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  bottomSpacing: {
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPickerItem: {
    backgroundColor: '#f0f8ff',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPickerItemText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Custom Date Picker Styles
  datePickerContainer: {
    padding: 20,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  datePickerAge: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    width: 60,
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 100,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Medical Information Styles
  medicalSubSection: {
    marginBottom: 20,
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#f0f8ff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  medicalItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  medicalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  medicalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  medicalItemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  medicalItemNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  activeBadge: {
    backgroundColor: '#e8f5e8',
  },
  resolvedBadge: {
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#4CAF50',
  },
  resolvedText: {
    color: '#666',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  severeBadge: {
    backgroundColor: '#ffe8e8',
  },
  moderateBadge: {
    backgroundColor: '#fff3cd',
  },
  mildBadge: {
    backgroundColor: '#e8f4fd',
  },
  severityIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  dosageText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  frequencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  timingBadge: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  timingText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});