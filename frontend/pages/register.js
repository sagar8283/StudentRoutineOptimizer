// pages/register.js
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { API_BASE, HERO_IMAGE_BACKEND } from '../components/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function safeFetchJSON(res) {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (parseErr) {
      throw new Error(`Server returned non-JSON response (status ${res.status}):\n\n${text.slice(0,2000)}`);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setSuccess('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErr('Email and password required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // optional, but safe if backend sets cookies
        body: JSON.stringify({ name, email, password })
      });

      const body = await safeFetchJSON(res);

      if (!res.ok) {
        throw new Error(body.error || body.message || `Status ${res.status}`);
      }

      setSuccess('Registration successful — redirecting to login...');

      // short delay so user sees success message
      setTimeout(() => router.replace('/login'), 1200);
    } catch (error) {
      console.error('register error:', error);
      setErr(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Register — Student Optimizer</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow">
          <div className="flex items-center gap-4 mb-4">
            <img src={HERO_IMAGE_BACKEND} alt="logo" className="w-14 h-14 object-cover rounded" />
            <div>
              <h1 className="text-xl font-semibold">Register</h1>
              <div className="text-xs text-gray-500 dark:text-gray-400">Create your account</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded dark:bg-gray-700" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded dark:bg-gray-700" />

            {err && <div className="text-sm text-red-500 whitespace-pre-wrap">{err}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
                {loading ? 'Registering…' : 'Register'}
              </button>
              <button type="button" onClick={() => router.push('/login')} className="px-3 py-2 border rounded">Login</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
