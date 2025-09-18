import React, { useState } from 'react';
import axios from 'axios';

export default function Signup(){
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e){
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/signup`, { name, email, password });
      setMsg('Signed up! Check your email.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="p-2 border" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="p-2 border" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="p-2 border" />
        <button className="bg-blue-600 text-white p-2 rounded">Signup</button>
      </form>
      {msg && <div className="mt-3">{msg}</div>}
    </div>
  );
}
