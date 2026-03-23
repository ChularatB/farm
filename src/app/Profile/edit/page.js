"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', line_user_id: '' });

  // โหลดข้อมูลเดิมมาใส่ในฟอร์ม
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        line_user_id: session.user.line_user_id || ''
      });
    }
  }, [session]);
  console.log("Session Data:", session);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await update(formData);
        alert('บันทึกข้อมูลสำเร็จ!');
        router.push('/Profile');
      } else {
        alert('บันทึกไม่สำเร็จ');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-mitr px-6 pt-8 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/Profile" className="bg-white p-2 rounded-full shadow-sm">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-primary-dark">แก้ไขข้อมูลส่วนตัว</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-secondary-light">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ชื่อ */}
          <div>
            <label className="text-xs font-bold text-gray-500 ml-2">ชื่อ - นามสกุล</label>
            <div className="relative mt-1">
              <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-primary-medium outline-none"
              />
            </div>
          </div>

          {/* อีเมล */}
          <div>
            <label className="text-xs font-bold text-gray-500 ml-2">อีเมล</label>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-primary-medium outline-none"
              />
            </div>
          </div>

          {/* เบอร์โทร */}
          <div>
            <label className="text-xs font-bold text-gray-500 ml-2">เบอร์โทรศัพท์</label>
            <div className="relative mt-1">
              <Phone className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-primary-medium outline-none"
              />
            </div>
          </div>

          {/* 🛑 กล่องสำหรับกรอก/แก้ไขรหัส LINE ID */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">
              รหัสแจ้งเตือน LINE (LINE User ID)
            </label>
            <div className="relative">
              {/* ใส่ Icon น่ารักๆ หรือจะปล่อยโล่งก็ได้ */}
              <input
                name="line_user_id"
                type="text"
                value={formData.line_user_id}
                onChange={(e) => setFormData({ ...formData, line_user_id: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-green-500 outline-none bg-gray-50 text-gray-700"
                placeholder="เช่น U1234567890abcdef..."
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-2">
              *พิมพ์ "ขอรหัส" ในแชทบอท LINE FarmBrain แล้วนำรหัสมากรอกที่นี่
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg mt-6 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกการเปลี่ยนแปลง</>}
          </button>
        </form>
      </div>
    </div>
  );
}