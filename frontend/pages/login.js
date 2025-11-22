// pages/login.js
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { API_BASE, HERO_IMAGE_BACKEND } from '../components/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Safe fetch helper used only in this file (keeps code compact)
  async function safeFetchJSON(res) {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (parseErr) {
      // throw the text so UI shows useful info instead of crashing with "Unexpected token '<'"
      throw new Error(`Server returned non-JSON response (status ${res.status}):\n\n${text.slice(0, 2000)}`);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    if (!email?.trim()) { setErr('Enter email'); setLoading(false); return; }
    if (!password?.trim()) { setErr('Enter password'); setLoading(false); return; }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // IMPORTANT: accept the HttpOnly cookie from backend
        body: JSON.stringify({ email, password }),
      });

      const body = await safeFetchJSON(res);

      if (!res.ok) {
        throw new Error(body.error || body.message || `Status ${res.status}`);
      }

      // success -> redirect to protected dashboard
      router.replace('/');
    } catch (e) {
      console.error('login error', e);
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Login — Student Optimizer</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded shadow">

          <div className="flex items-center gap-4 mb-4">
            <img src={HERO_IMAGE_BACKEND} alt="logo" className="w-14 h-14 object-cover rounded" />
            <div>
              <h1 className="text-xl font-semibold">Student Optimizer</h1>
              <div className="text-xs text-gray-500 dark:text-gray-400">Smart scheduling + recommendations</div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded dark:bg-gray-700"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded dark:bg-gray-700"
            />

            {err && <div className="text-sm text-red-500 whitespace-pre-wrap">{err}</div>}

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button type="button" onClick={() => router.push('/register')} className="px-3 py-2 border rounded">Register</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
