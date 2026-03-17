// src/app/register/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Phone, Loader2, AlertCircle } from 'lucide-react'; // เพิ่ม AlertCircle มาให้ดูสวยๆ

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // พิมพ์ปุ๊บ ลบแจ้งเตือนปั๊บ จะได้ไม่งง
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    // กันเหนียว เผื่อเบอร์โทรพิมพ์ไม่ครบ 10 ตัว
    if (formData.phone.length !== 10) {
      setError('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');
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
          phone: formData.phone,
          password: formData.password
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // 🛑 ถ้าระบบตอบกลับมาว่าซ้ำ มันจะเอาข้อความมาโชว์ตรงนี้!
        setError(json.error || 'เกิดข้อผิดพลาดในการสมัคร');
      } else {
        alert('🎉 สมัครสมาชิกสำเร็จ! รหัสฟาร์มของคุณคือ: ' + json.deviceId);
        router.push('/login');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ ลองใหม่อีกครั้งนะ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex justify-center items-start p-5 font-mitr py-10">
      <div className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-md border border-secondary-light">
        
        <div className="text-center mb-6">
          <div className="bg-secondary-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserPlus size={32} className="text-primary-dark" />
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">สมัครสมาชิก</h1>
          <p className="text-gray-400 text-xs">กรอกข้อมูลให้ครบถ้วนเพื่อเริ่มใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ชื่อฟาร์ม */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">ชื่อฟาร์ม / ชื่อผู้ใช้</label>
            <input name="name" type="text" required onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50 transition-colors"
              placeholder="เช่น สมชาย ฟาร์ม" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">อีเมล (Email)</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                <input name="email" type="email" required onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50 transition-colors"
                placeholder="example@email.com" />
            </div>
          </div>

          {/* เบอร์โทร */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">เบอร์โทรศัพท์ (Phone)</label>
             <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                <input name="phone" type="tel" required pattern="[0-9]{10}" onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50 transition-colors"
                placeholder="08XXXXXXXX" />
            </div>
          </div>

          {/* รหัสผ่าน */}
          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">รหัสผ่าน</label>
                <input name="password" type="password" required minLength="6" onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50 transition-colors" placeholder="******" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 ml-2">ยืนยันรหัส</label>
                <input name="confirmPassword" type="password" required minLength="6" onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary-medium outline-none bg-gray-50 transition-colors" placeholder="******" />
            </div>
          </div>

          {/* 🛑 แจ้งเตือน Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-2xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-primary-medium hover:bg-primary-dark text-white font-bold py-3.5 rounded-3xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'ลงทะเบียนเข้าใช้งาน'}
          </button>
        </form>
        
        <div className="text-center mt-6">
            <Link href="/login" className="text-sm text-gray-500 hover:text-primary-dark font-bold underline transition-colors">
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
            </Link>
        </div>
      </div>
    </div>
  );
}