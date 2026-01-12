// src/app/login/page.js
"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sprout, Loader2, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // เรียกฟังก์ชัน signIn ของ NextAuth
      const result = await signIn('credentials', {
        username: username,
        password: password,
        redirect: false, // เราจะคุมการ Redirect เอง
      });

      if (result.error) {
        // ถ้า Login ไม่ผ่าน
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      } else {
        // ถ้าผ่าน ให้ไปหน้า Dashboard
        router.push('/');
        router.refresh(); // รีเฟรชเพื่อให้ Navbar อัปเดตสถานะ
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4 font-mitr">
      <div className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-md border border-secondary-light">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="bg-primary-medium w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md animate-bounce-slow">
            <Sprout size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-dark">FarmBrain</h1>
          <p className="text-gray-400 text-sm">เข้าสู่ระบบเพื่อจัดการฟาร์ม</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">อีเมล / เบอร์โทรศัพท์</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium focus:ring-4 focus:ring-primary-medium/10 outline-none transition-all"
                placeholder="กรอกอีเมลของคุณ"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium focus:ring-4 focus:ring-primary-medium/10 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl text-center font-bold border border-red-100">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-dark hover:bg-primary-medium text-white font-bold py-4 rounded-3xl shadow-lg transition-all flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>
        
        <div className="mt-8 text-center space-y-2">
           <p className="text-sm text-gray-500">
              ยังไม่มีบัญชีใช่ไหม?{' '}
              <Link href="/register" className="text-primary-dark font-bold hover:underline">
                 สมัครสมาชิกที่นี่
              </Link>
           </p>
        </div>
      </div>
    </div>
  );
}