import React, { useState } from 'react';
import axios from 'axios';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');

  async function handleLogin(e){
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
      if (res.data.challenge) {
        setOtpMode(true);
        setSessionId(res.data.sessionId);
        setMsg(res.data.msg);
        return;
      }
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setMsg('Logged in');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
  }

  async function submitOtp(e){
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, { sessionId, otp });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setMsg('Logged in with OTP');
      setOtpMode(false);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Invalid OTP');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Login</h2>
      {!otpMode ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="p-2 border" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="p-2 border" />
          <button className="bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="flex flex-col gap-3">
          <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="OTP" className="p-2 border" />
          <button className="bg-green-600 text-white p-2 rounded">Verify OTP</button>
        </form>
      )}
      {msg && <div className="mt-3">{msg}</div>}
    </div>
  );
}
