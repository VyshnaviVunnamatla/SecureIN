import React, { useState } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        alert("⚠️ Suspicious login detected. Please verify your email or device.");
      } else {
        alert("✅ Login successful");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Zero Trust Auth Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><br />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" /><br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default App;
