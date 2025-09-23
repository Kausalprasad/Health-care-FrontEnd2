import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "../screens/Landing/LandingScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen/ForgotPasswordScreen";
import { AuthContext } from "../context/AuthContext";
import SymptomCheckerScreen from "../screens/Model/SymptomCheckerScreen";
import NailAnalysisScreen from "../screens/Model/NailAnalysisScreen";
import HealthGamesScreen from "../screens/HealthGames/HealthGamesScreen";
import BreathingGameScreen from "../screens/HealthGames/Games/BreathingGameScreen";
import ResultsScreen from "../screens/HealthGames/Games/ResultsScreen";
import EyeBubblesGameScreen from "../screens/HealthGames/Games/EyeBubblesGameScreen";
import AIDoctorScreen from "../screens/Model/AIDoctorScreen";
import TongueDiseaseCheckerScreen from "../screens/Model/TongueDiseaseCheckerScreen";
import ChatbotScreen from "../screens/Model/ChatbotScreen";
import EyeScreen from "../screens/Model/EyeScreen";
import SkinCheckScreen from "../screens/Model/SkinCheckScreen"; // Import the SkinCheckScreen
import NutritionQuestScreen from "../screens/HealthGames/Games/NutritionQuestScreen"; 
import CosmeticScreen from "../screens/Model/CosmeticScreen";
import Dsdashboard from "../screens/Appointment/Dashboard";
import DoctorListScreen from "../screens/Appointment/DoctorListScreen";
import AppointmentBooking from "../screens/Appointment/AppointmentBooking";
import MyAppointments from "../screens/Appointment/MyAppointments";
import CaregiverDashboard from "../screens/CaregiverDashboard/CaregiverDashboardScreen";
import AiHealthCheckupScreen from "../screens/Dashboard/AiHealthCheckupScreen";
import DoctorCard from "../screens/Appointment/DoctorCard";
import MelanomaScreen from "../screens/Model/MelanomaScreen";
import MentalHealthScreen from "../screens/Model/MentalHealthScreen";
import HairCheckScreen from "../screens/Model/HairCheckScreen";
import Sidebar from "../components/Sidebar";
import UserProfileScreen from "../screens/UserProfile/UserProfileScreen";
import ProfileSetupStep2 from "../screens/UserProfile/ProfileSetupStep2";
import ProfileSetupStep3 from "../screens/UserProfile/ProfileSetupStep3";
import ProfileSetupStep1 from "../screens/UserProfile/ProfileSetupStep1";
import ProfileViewScreen from "../screens/UserProfile/ProfileViewScreen";
import VitalsScreen from "../screens/Vitals/VitalsScreen";





// Vault Screens
import VaultMenu from "../screens/Vault/VaultMenu";
import CreateVaultId from "../screens/Vault/CreateVaultId";
import LoginVaultId from "../screens/Vault/LoginVaultId";
import VaultDashboard from "../screens/Vault/VaultDashboard";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
  {user ? (
    <>
      <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
      <Stack.Screen name="VaultMenu" component={VaultMenu} />
      <Stack.Screen name="CreateVaultId" component={CreateVaultId} />
      <Stack.Screen name="LoginVaultId" component={LoginVaultId} />
      <Stack.Screen name="VaultDashboard" component={VaultDashboard} />
    </>
  ) : (
    <>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </>
  )}

  {/* ✅ Available in both cases */}
  <Stack.Screen name="SymptomChecker" component={SymptomCheckerScreen} />
  <Stack.Screen name="NailAnalysis" component={NailAnalysisScreen} />
  <Stack.Screen name="AIDoctor" component={AIDoctorScreen} />
  <Stack.Screen name="TongueDiseaseChecker" component={TongueDiseaseCheckerScreen} />
   <Stack.Screen name="HealthGames" component={HealthGamesScreen} />
   <Stack.Screen name="BreathingGameScreen" component={BreathingGameScreen} />
<Stack.Screen name="ResultsScreen" component={ResultsScreen} />
  <Stack.Screen name="EyeBubblesGameScreen" component={EyeBubblesGameScreen} />
  <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
  <Stack.Screen name="EyeScreen" component={EyeScreen} />
  <Stack.Screen name="SkinCheck" component={SkinCheckScreen} />
  <Stack.Screen name="NutritionQuestScreen" component={NutritionQuestScreen} />
  <Stack.Screen name="CosmeticScreen" component={CosmeticScreen} />
  <Stack.Screen name="HairCheckScreen" component={HairCheckScreen} />

  <>
  <Stack.Screen name="Dsashboard" component={Dsdashboard} />
  <Stack.Screen name="Doctors" component={DoctorListScreen} />
  <Stack.Screen name="BookAppointment" component={AppointmentBooking} />
  <Stack.Screen name="MyAppointments" component={MyAppointments} />
  </>
  <>
  <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboard} />
  <Stack.Screen name="AiHealthCheckupScreen" component={AiHealthCheckupScreen} />
  <Stack.Screen name="DoctorCard" component={DoctorCard} />
  <Stack.Screen name="MelanomaScreen" component={MelanomaScreen} />
  <Stack.Screen name="MentalHealthScreen" component={MentalHealthScreen} />
  <Stack.Screen name="Sidebar" component={Sidebar}/>
  <Stack.Screen name="UserProfileScreen" component={UserProfileScreen}/>
  <Stack.Screen name="ProfileSetupStep2" component={ProfileSetupStep2}/>
  <Stack.Screen name="ProfileSetupStep3" component={ProfileSetupStep3}/>
  <Stack.Screen name="ProfileSetupStep1" component={ProfileSetupStep1}/>
  <Stack.Screen name="ProfileViewScreen" component={ProfileViewScreen}/>
  <Stack.Screen name="VitalsScreen" component={VitalsScreen}/>
  </>
  
</Stack.Navigator>


  );
}
