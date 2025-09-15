import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../api/firebaseConfig";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      Alert.alert(
        "Success", 
        "Password reset email sent successfully! Please check your inbox and follow the instructions to reset your password.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      let errorMessage = "Failed to send reset email. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many requests. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      <LinearGradient
        colors={['#2E8B57', '#20B2AA', '#48CAE4']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Ionicons name="lock-open" size={50} color="#fff" />
                <View style={styles.heartbeat}>
                  <Ionicons name="pulse" size={20} color="#FF6B6B" />
                </View>
              </View>
              
              <Text style={styles.welcomeText}>Forgot Password?</Text>
              <Text style={styles.subtitleText}>
                Don't worry! Enter your email and we'll send you a reset link
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <View style={styles.iconHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail" size={30} color="#2E8B57" />
                </View>
                <Text style={styles.formTitle}>Reset Your Password</Text>
                <Text style={styles.formDescription}>
                  Enter the email address associated with your HealthCare+ account
                </Text>
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#2E8B57" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !emailSent}
                />
                {email.length > 0 && validateEmail(email) && (
                  <View style={styles.validIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </View>

              {/* Email validation hint */}
              {email.length > 0 && !validateEmail(email) && (
                <View style={styles.validationHint}>
                  <Ionicons name="information-circle" size={16} color="#FF6B6B" />
                  <Text style={styles.validationText}>Please enter a valid email address</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.resetButton, 
                  (isLoading || emailSent) && styles.resetButtonDisabled
                ]}
                onPress={handlePasswordReset}
                disabled={isLoading || emailSent}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isLoading || emailSent 
                      ? ['#ccc', '#999'] 
                      : ['#2E8B57', '#20B2AA']
                  }
                  style={styles.resetButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.resetButtonText}>Sending...</Text>
                    </View>
                  ) : emailSent ? (
                    <View style={styles.buttonContent}>
                      <Ionicons name="checkmark" size={20} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.resetButtonText}>Email Sent!</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="send" size={20} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.resetButtonText}>Send Reset Email</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepText}>1</Text>
                  </View>
                  <Text style={styles.instructionText}>Check your email inbox</Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepText}>2</Text>
                  </View>
                  <Text style={styles.instructionText}>Click the reset link</Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepText}>3</Text>
                  </View>
                  <Text style={styles.instructionText}>Create a new password</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              {/* Alternative Options */}
              <TouchableOpacity 
                style={styles.alternativeButton}
                onPress={() => {
                  Alert.alert(
                    "Contact Support", 
                    "If you're having trouble accessing your account, please contact our support team.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Contact Support", onPress: () => console.log("Contact support") }
                    ]
                  );
                }}
              >
                <Ionicons name="help-circle-outline" size={20} color="#2E8B57" />
                <Text style={styles.alternativeButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate("Login")}
                disabled={isLoading}
              >
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.securityText}>
                Your account security is our top priority
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  heartbeat: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    height: 55,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  validIcon: {
    marginLeft: 8,
  },
  validationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  validationText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 5,
  },
  resetButton: {
    borderRadius: 15,
    marginBottom: 25,
    overflow: 'hidden',
    shadowColor: '#2E8B57',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    marginBottom: 25,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  alternativeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginLeft: 8,
    textAlign: 'center',
  },
});