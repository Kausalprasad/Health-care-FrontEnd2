// context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../api/firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [justSignedUp, setJustSignedUp] = useState(false); // NEW

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (justSignedUp) {
        // Agar abhi signup hua hai → force logout
        signOut(auth);
        setUser(null);
        setJustSignedUp(false);
      } else {
        setUser(u);
      }
    });
    return unsubscribe;
  }, [justSignedUp]);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, setJustSignedUp }}>
      {children}
    </AuthContext.Provider>
  );
};
