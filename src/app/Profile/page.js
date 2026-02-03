// src/app/Profile/page.js
"use client";
import { useState, useEffect } from 'react';
import { MapPin, User, LogOut, ChevronRight, Loader2, Save, Edit3 } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
   const { data: session, status } = useSession();
   const router = useRouter();

   // State สำหรับเก็บข้อมูลฟาร์ม (เริ่มต้นเป็นค่าว่าง)
   const [isEditing, setIsEditing] = useState(false);
   const [farmInfo, setFarmInfo] = useState({ size: '0', devices: '0' });
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      if (status === 'unauthenticated') {
         router.push('/login');
      }
   }, [status, router]);

   // Loading State
   if (status === 'loading') {
      return (
         <div className="min-h-screen flex items-center justify-center bg-background-light text-primary-dark font-mitr">
            <Loader2 className="animate-spin mr-2" /> กำลังตรวจสอบสิทธิ์...
         </div>
      );
   }

   if (status === 'unauthenticated') return null;

   // ฟังก์ชันบันทึกข้อมูลลง DB
   const handleSaveFarmInfo = async () => {
      setSaving(true);
      try {
         const res = await fetch('/api/farm/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
               farm_size: farmInfo.size, 
               total_devices: farmInfo.devices 
            })
         });
         
         if (res.ok) {
            alert("บันทึกข้อมูลเรียบร้อย!");
            setIsEditing(false);
         } else {
            alert("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
         }
      } catch (error) {
         console.error(error);
         alert("เกิดข้อผิดพลาด");
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
         <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-primary-medium rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center">
               <User size={40} className="text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-primary-dark">
               {session?.user?.name || "เกษตรกร"}
            </h1>
            
            {/* แสดงเบอร์โทร */}
            <p className="text-gray-500 text-sm mb-2">
               {session?.user?.email} 
            </p>

            {/* ✅ แสดง Device ID (รหัสฟาร์ม) */}
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-secondary-light mt-2 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Farm Device ID</p>
                <p className="text-lg font-bold text-primary-dark font-mono">
                    {session?.user?.device_id || 'กำลังสร้าง...'}
                </p>
            </div>
         </div>

         {/* Farm Info Cards (แก้ไขได้) */}
         <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-sm font-bold text-gray-500">ข้อมูลฟาร์ม</h3>
            <button 
               onClick={() => isEditing ? handleSaveFarmInfo() : setIsEditing(true)}
               className="text-xs flex items-center gap-1 text-primary-dark font-bold bg-white px-3 py-1 rounded-full shadow-sm"
            >
               {isEditing ? (saving ? 'กำลังบันทึก...' : <><Save size={14}/> บันทึก</>) : <><Edit3 size={14}/> แก้ไข</>}
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-3xl shadow-sm text-center relative">
               <h3 className="text-gray-400 text-xs mb-1">พื้นที่ฟาร์ม (ไร่)</h3>
               {isEditing ? (
                  <input 
                     type="number" 
                     value={farmInfo.size}
                     onChange={(e) => setFarmInfo({...farmInfo, size: e.target.value})}
                     className="w-full text-center border-b border-primary-medium focus:outline-none text-xl font-bold text-primary-dark"
                  />
               ) : (
                  <p className="text-xl font-bold text-primary-dark">{farmInfo.size} ไร่</p>
               )}
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm text-center">
               <h3 className="text-gray-400 text-xs mb-1">อุปกรณ์ (ชิ้น)</h3>
               {isEditing ? (
                  <input 
                     type="number" 
                     value={farmInfo.devices}
                     onChange={(e) => setFarmInfo({...farmInfo, devices: e.target.value})}
                     className="w-full text-center border-b border-primary-medium focus:outline-none text-xl font-bold text-primary-dark"
                  />
               ) : (
                  <p className="text-xl font-bold text-primary-dark">{farmInfo.devices} ตัว</p>
               )}
            </div>
         </div>

         {/* Menu List (เหมือนเดิม) */}
         <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
            {/* <div className="p-4 border-b border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600"><MapPin size={18} /></div>
                  <span>จัดการแปลงเกษตร</span>
               </div>
               <ChevronRight className="text-gray-300" size={20} />
            </div> */}
            <Link href="/Profile/edit" className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full text-gray-600"><User size={18} /></div>
                  <span>แก้ไขข้อมูลส่วนตัว</span>
               </div>
               <ChevronRight className="text-gray-300" size={20} />
            </Link>
         </div>

         <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full py-4 bg-primary-dark text-white font-bold rounded-3xl shadow-lg flex items-center justify-center gap-2"
         >
            <LogOut size={20} /> ออกจากระบบ
         </button>
      </div>
   );
}