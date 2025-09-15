// src/config/config.js
import { Platform } from "react-native";

export const BASE_URL =
   Platform.OS === "android"
    ? "http://192.168.31.248:5000" // Android Emulator IP
    : "http://192.168.31.248:5000"; // iOS or real device on same network
  

  //   export const BASE_URL =
  // Platform.OS === "android"
  //   ? "http://13.62.68.3" // Android Emulator IP
  //   : "http://13.62.68.3"; // iOS or real dez
