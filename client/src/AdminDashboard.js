import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminDashboard = ({ onBack }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/logs`)
      .then(res => setLogs(res.data))
      .catch(err => console.error("Error fetching logs", err));
  }, []);

  const flattened = logs.flatMap(user =>
    user.loginLogs.map(log => ({
      ...log,
      email: user.email,
    }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const chartData = {
    labels: flattened.map((log, i) => `${log.email} - ${i + 1}`),
    datasets: [
      {
        label: "Risk Score",
        data: flattened.map(log => log.riskScore),
        backgroundColor: flattened.map(log => log.riskScore >= 5 ? "red" : "green"),
      },
    ],
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2>Admin Dashboard</h2>

      {flattened.length === 0 ? (
        <p>No login activity available yet. Try logging in with a test user.</p>
      ) : (
        <>
          <Bar data={chartData} />
          <h3>Login Logs</h3>
          <table border="1" cellPadding="8" cellSpacing="0">
            <thead>
              <tr>
                <th>Email</th>
                <th>IP</th>
                <th>City</th>
                <th>Country</th>
                <th>Device</th>
                <th>Risk</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {flattened.map((log, i) => (
                <tr key={i}>
                  <td>{log.email}</td>
                  <td>{log.ip}</td>
                  <td>{log.city}</td>
                  <td>{log.country}</td>
                  <td>{log.deviceId?.slice(0, 6)}...</td>
                  <td style={{ color: log.riskScore >= 5 ? "red" : "green" }}>
                    {log.riskScore}
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <br />
      <button onClick={onBack} style={{ marginTop: "20px" }}>Back</button>
    </div>
  );
};

export default AdminDashboard;
