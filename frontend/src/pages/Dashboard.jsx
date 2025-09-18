import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard(){
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(()=> {
    async function fetch() {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // admin/users is for admin; for demo: we will fetch user profile from token or create /api/auth/me endpoint
      } catch (err) {
        // ignore
      }
    }
    fetch();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Dashboard</h2>
      <p>Personalized info will be here. For demo: check Admin for logs (admin account required).</p>
    </div>
  );
}
