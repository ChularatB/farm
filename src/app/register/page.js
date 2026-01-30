// app/register/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // เช็คพื้นฐาน
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'เกิดข้อผิดพลาด');
        setLoading(false);
      } else {
        // สมัครเสร็จ ให้ไปหน้า Login
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        router.push('/login');
      }
    } catch (err) {
      setError('เชื่อมต่อระบบล้มเหลว');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4 font-mitr py-10">
      <div className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-md border border-secondary-light">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-secondary-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserPlus size={32} className="text-primary-dark" />
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">สมัครสมาชิกใหม่</h1>
          <p className="text-gray-400 text-xs">เข้าร่วม FarmBrain เพื่อจัดการฟาร์มของคุณ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">ชื่อฟาร์ม / ชื่อผู้ใช้</label>
            <input
              name="name"
              type="text"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50"
              placeholder="เช่น สมชาย ฟาร์ม"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">Email</label>
            <input
              name="email"
              type="text"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50"
              placeholder="xxxxx@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">รหัสผ่าน</label>
                <input
                name="password"
                type="password"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50"
                placeholder="******"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">ยืนยันรหัส</label>
                <input
                name="confirmPassword"
                type="password"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50"
                placeholder="******"
                />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl text-center font-bold">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-medium hover:bg-primary-dark text-white font-bold py-3 rounded-3xl shadow-lg transition-all flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'ลงทะเบียน'}
          </button>
        </form>
        
        <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-gray-500 hover:text-primary-dark font-bold underline">
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
            </Link>
        </div>
      </div>
    </div>
  );
}