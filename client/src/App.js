import React, { useState } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const App = () => {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");

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
    const deviceId = await getDeviceId();
    const ip = await getIp();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        deviceId,
        ip,
      });

      if (res.data.suspicious) {
        setStep("otp");
        alert("⚠️ Suspicious login detected. OTP sent to your email.");
      } else {
        setToken(res.data.token);
        setStep("loggedIn");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });
      setToken(res.data.token);
      setStep("loggedIn");
    } catch (err) {
      alert(err.response?.data?.error || "OTP failed");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Zero Trust Authentication</h2>

      {step === "login" && (
        <>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><br /><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" /><br /><br />
          <button onClick={handleLogin}>Login</button>
        </>
      )}

      {step === "otp" && (
        <>
          <h3>Enter OTP sent to your email</h3>
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" /><br /><br />
          <button onClick={handleVerifyOtp}>Verify</button>
        </>
      )}

      {step === "loggedIn" && (
        <>
          <h3>✅ Login Successful</h3>
          <p>JWT: <code>{token}</code></p>
        </>
      )}
    </div>
  );
};

export default App;
