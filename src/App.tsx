import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import { HarNovaStore, isFirebaseActive, auth } from "./services/store";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [currentView, setCurrentView] = useState<"landing" | "auth" | "dashboard">("landing");
  const [authLoading, setAuthLoading] = useState(isFirebaseActive);

  // Monitor Firebase Auth State or Fallback
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email || "anonymous@harnova.local" });
          localStorage.setItem("harnova_active_uid", firebaseUser.uid);
          localStorage.setItem("harnova_active_email", firebaseUser.email || "anonymous@harnova.local");
          setCurrentView("dashboard");
          setAuthLoading(false);
        } else {
          // Prevent stale offline identities like sandbox-user or local-user from trying to access Firebase:
          // transition them automatically to an authorized Firebase session!
          const savedUid = localStorage.getItem("harnova_active_uid");
          if (savedUid && (savedUid.startsWith("sandbox-user") || savedUid === "sandbox-user" || savedUid === "local-user")) {
            try {
              const profile = await HarNovaStore.signInAnonymously();
              handleAuthSuccess(profile.uid, profile.email);
            } catch (err) {
              console.error("Auto sandbox session migration failed:", err);
              setUser(null);
              setCurrentView("landing");
              setAuthLoading(false);
            }
          } else {
            setUser(null);
            setCurrentView("landing");
            setAuthLoading(false);
          }
        }
      }, (error) => {
        console.error("onAuthStateChanged error:", error);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Normal offline local storage fallback
      const savedUid = localStorage.getItem("harnova_active_uid");
      const savedEmail = localStorage.getItem("harnova_active_email");
      if (savedUid && savedEmail) {
        setUser({ uid: savedUid, email: savedEmail });
        setCurrentView("dashboard");
      }
      setAuthLoading(false);
    }
  }, []);

  const handleAuthSuccess = (uid: string, email: string) => {
    localStorage.setItem("harnova_active_uid", uid);
    localStorage.setItem("harnova_active_email", email);
    setUser({ uid, email });
    setCurrentView("dashboard");
  };

  const handleLogout = async () => {
    try {
      await HarNovaStore.logout();
    } catch (err) {
      console.error("Firebase logout failed:", err);
    }
    localStorage.removeItem("harnova_active_uid");
    localStorage.removeItem("harnova_active_email");
    setUser(null);
    setCurrentView("landing");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 animate-spin" />
        <span className="text-xs text-slate-500 font-mono mt-4 uppercase tracking-wider">Securing workspace session...</span>
      </div>
    );
  }

  return (
    <>
      {currentView === "landing" && (
        <LandingPage onStartBuilding={() => setCurrentView("auth")} />
      )}
      {currentView === "auth" && (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
      {currentView === "dashboard" && user && (
        <Dashboard
          uid={user.uid}
          userEmail={user.email}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
