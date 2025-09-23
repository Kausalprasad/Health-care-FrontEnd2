import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileSetupScreen = ({ navigation }) => {
  const handleCreateProfile = () => {
    navigation.navigate('ProfileSetupStep1');
  };

  const handleSkipForNow = () => {
    // Handle skip navigation
   
    navigation.navigate('DashboardScreen');

    console.log('Skip for now pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.content}>
        {/* Profile Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.profileIcon}>
            <View style={styles.profileIconInner}>
              <View style={styles.avatarCircle} />
              <View style={styles.bodyShape} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Let's Set Up{'\n'}your Profile</Text>

        {/* Description */}
        <Text style={styles.description}>
          Add your details once and{'\n'}access all your medical{'\n'}info easily.
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Create Profile Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>Create Profile</Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkipForNow}
          activeOpacity={0.6}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
     marginTop: StatusBar.currentHeight || 0,
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#7c7ce0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  profileIconInner: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7c7ce0',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  bodyShape: {
    width: 50,
    height: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderWidth: 2,
    borderColor: '#7c7ce0',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  spacer: {
    flex: 1,
    minHeight: 60,
  },
  createButton: {
    backgroundColor: '#7c7ce0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#7c7ce0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  skipButtonText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileSetupScreen;