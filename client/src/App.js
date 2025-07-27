import React, { useState } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import AdminDashboard from "./AdminDashboard";
import AdminRegister from "./AdminRegister";
import AdminUserPanel from "./AdminUserPanel";
import './App.css';

const App = () => {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [adminPanel, setAdminPanel] = useState(false);
  const [userPanel, setUserPanel] = useState(false);

  const getDeviceId = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  };

  const getIp = async () => {
    const res = await fetch("https://api64.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  };

  const handleLogin = async () => {
    console.log("Login initiated...");

    const deviceId = await getDeviceId();
    const ip = await getIp();
    console.log("Device ID:", deviceId);
    console.log("IP Address:", ip);

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        email,
        password,
        deviceId,
        ip,
      });

      console.log("Response:", res.data);

      if (res.data.suspicious) {
        setStep("otp");
        alert("Suspicious login detected. OTP sent to your email.");
      } else {
        setToken(res.data.token);
        setRole(res.data.role);
        setStep("loggedIn");
      }
    } catch (err) {
      console.error("Login failed:", err.message, err.response?.status, err.response?.data);
      alert(err.response?.data?.error || err.message || "Login failed. Check console for details.");
    }
  };

  const handleVerifyOtp = async () => {
    console.log("Verifying OTP...");

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-otp`, {
        email,
        otp,
      });
      console.log("OTP Verified:", res.data);

      setToken(res.data.token);
      setRole(res.data.role);
      setStep("loggedIn");
    } catch (err) {
      console.error("OTP Verification failed:", err);
      alert(err.response?.data?.error || "OTP failed");
    }
  };

  return (
    <div className="app-container">
      <div className="app-box">
        <h2>Zero Trust Authentication</h2>

        {step === "login" && (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            /><br /><br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            /><br /><br />
            <button onClick={handleLogin}>Login</button>
          </>
        )}

        {step === "otp" && (
          <>
            <h3>Enter OTP sent to your email</h3>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            /><br /><br />
            <button onClick={handleVerifyOtp}>Verify</button>
          </>
        )}

        {step === "admin" && (
          <AdminDashboard onBack={() => setStep("loggedIn")} />
        )}

        {step === "loggedIn" && (
          <>
            <h3>Login Successful</h3>
            <p>JWT: <code>{token}</code></p>
            <p>Role: <strong>{role}</strong></p>
            {role === "admin" && (
              <>
                <button onClick={() => setStep("admin")}>Go to Admin Dashboard</button><br /><br />
                <button onClick={() => setAdminPanel(true)}>Create Users (Admin Only)</button><br /><br />
                <button onClick={() => setUserPanel(true)}>Manage Users</button><br /><br />
              </>
            )}
            <br /><br />
            <button onClick={() => {
              setToken(""); setRole(""); setStep("login");
            }}>
              Logout
            </button>
          </>
        )}

        {adminPanel && <AdminRegister />}
        {userPanel && <AdminUserPanel />}
      </div>
    </div>
  );
};

export default App;
