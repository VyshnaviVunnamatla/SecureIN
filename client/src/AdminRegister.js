import React, { useState } from "react";
import axios from "axios";

const AdminRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        email,
        password,
        role,
      });
      setMessage("Registered successfully");
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || "Failed"));
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Create User</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br /><br />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br /><br />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select><br /><br />
      <button onClick={handleRegister}>Create User</button>
      <p>{message}</p>
    </div>
  );
};

export default AdminRegister;
