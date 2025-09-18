import React, { useState } from 'react';
import axios from 'axios';

export default function Admin(){
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState('');

  async function fetchLogs() {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error fetching logs');
    }
  }

  async function fetchSessions() {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error fetching sessions');
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Admin Panel</h2>
      <div className="flex gap-3 mb-4">
        <button onClick={fetchLogs} className="bg-blue-600 text-white p-2 rounded">Load Logs</button>
        <button onClick={fetchSessions} className="bg-green-600 text-white p-2 rounded">Load Sessions</button>
      </div>
      {msg && <div>{msg}</div>}
      <div>
        <h3>Logs</h3>
        <pre style={{maxHeight:300, overflow:'auto'}}>{JSON.stringify(logs, null, 2)}</pre>
      </div>
      <div>
        <h3>Sessions</h3>
        <pre style={{maxHeight:300, overflow:'auto'}}>{JSON.stringify(sessions, null, 2)}</pre>
      </div>
    </div>
  );
}
