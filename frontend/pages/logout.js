// pages/logout.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { API_BASE } from '../components/api';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {
        console.error('logout error', e);
      } finally {
        router.replace('/login');
      }
    }
    logout();
  }, [router]);

  return <div className="p-6">Logging out…</div>;
}
