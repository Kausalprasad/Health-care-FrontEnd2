import React, { useState, useContext, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../api/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";

// Google Auth imports
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "216997849771-3gpcadeh6q1k12lntbl2e726s38gfsrb.apps.googleusercontent.com",
    androidClientId: "216997849771-3gpcadeh6q1k12lntbl2e726s38gfsrb.apps.googleusercontent.com",
    iosClientId: "216997849771-3gpcadeh6q1k12lntbl2e726s38gfsrb.apps.googleusercontent.com",
  });

  // Google Auth response handle
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.authentication;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          setUser(userCredential.user);
        })
        .catch((error) => {
          Alert.alert("Google Sign-In Failed", error.message);
        });
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Heading */}
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>
        Login to your account to access{"\n"}your dashboard
      </Text>

      {/* Purple Curved Background */}
      <LinearGradient colors={["#F2F0FF", "#E7E4FF"]} style={styles.curvedBox}>
        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={{ alignSelf: "flex-end", marginBottom: 20 }}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgot}>Forgot Password</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginText}>
            {isLoading ? "Signing In..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Register */}
        <Text style={styles.registerText}>
          Don’t have an account?{" "}
          <Text
            style={styles.registerLink}
            onPress={() => navigation.navigate("Signup")}
          >
            Register
          </Text>
        </Text>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <AntDesign name="google" size={20} color="black" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() =>
            Alert.alert("Coming Soon", "Apple Sign-In will be available soon!")
          }
        >
          <FontAwesome name="apple" size={22} color="black" />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    backgroundColor: "#fff",
    // paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#6C63FF",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
    style:"semi-bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
    style:"medium",
    lineHeight: 26,
      fontFamily: "Poppins_400Regular",
  },
 curvedBox: {
  flex: 1,
  backgroundColor: "#EDEBFF",
  borderTopLeftRadius: 50,
  borderTopRightRadius: 40,
  padding: 40,
  alignItems: "center",
  marginTop: 30,
  
},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
    height: 60,
    width: "100%",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  forgot: {
    color: "#333",
    fontSize: 15,
     fontWeight: "500",
     fontFamily: "Poppins_400Regular",
  },
  loginButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
   fontSize: 15,
     fontWeight: "500",
     fontFamily: "Poppins_400Regular",
  },
  registerText: {
    marginTop: 20,
    fontSize: 15,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  registerLink: {
    color: "#6C63FF",
    fontWeight: "600",
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#000000",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#333",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "rgba(204, 204, 204, 1)",
    // borderWidth: 1,
    // borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
    marginBottom: 10,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
});
