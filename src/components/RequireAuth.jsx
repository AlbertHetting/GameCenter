import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "/firebaseClient"; 

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    // Fallback when Firebase restores session
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  if (!user) {
    // Not signed in, send to profile (keep where they tried to go)
    return <Navigate to="/profile" replace state={{ from: location }} />;
  }

  return children;
}