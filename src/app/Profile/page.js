// src/app/Profile/page.js
"use client";
import { useState, useEffect } from 'react';
import { User, LogOut, ChevronRight, Loader2, Save, Edit3, Phone, Mail, Hash } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
   const { data: session, status } = useSession();
   const router = useRouter();

   const [isEditing, setIsEditing] = useState(false);
   const [farmInfo, setFarmInfo] = useState({ size: '0', devices: '0' });
   const [saving, setSaving] = useState(false);
   const [loadingInfo, setLoadingInfo] = useState(true);

   useEffect(() => {
      if (status === 'unauthenticated') router.push('/login');
   }, [status, router]);

   // ดึงข้อมูลฟาร์ม
   useEffect(() => {
      if (session?.user?.user_id) {
         const fetchFarmInfo = async () => {
            try {
               const res = await fetch('/api/farm/info');
               const data = await res.json();
               if (data.success) {
                  setFarmInfo({
                     size: data.farm_size || '0',
                     devices: data.total_devices || '0'
                  });
               }
            } catch (error) {
               console.error("Failed to fetch farm info", error);
            } finally {
               setLoadingInfo(false);
            }
         };
         fetchFarmInfo();
      }
   }, [session]);

   if (status === 'loading') {
      return (
         <div className="min-h-screen flex items-center justify-center bg-background-light text-primary-dark font-mitr">
            <Loader2 className="animate-spin mr-2" /> กำลังตรวจสอบสิทธิ์...
         </div>
      );
   }

   if (status === 'unauthenticated') return null;

   const handleSaveFarmInfo = async () => {
      setSaving(true);
      try {
         const res = await fetch('/api/farm/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               farm_size: farmInfo.size,
               total_devices: farmInfo.devices
               // ค่าอื่นๆ (เช่น ระบบน้ำ, ไฟ) ไม่ได้ส่งไป API จะใช้ค่าเดิมอัตโนมัติ (ที่เราเขียนดัก NULL ไว้)
            })
         });

         if (res.ok) {
            alert("บันทึกข้อมูลฟาร์มเรียบร้อย!");
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

            {/* แสดงข้อมูลการติดต่อ */}
            <div className="flex flex-col items-center mt-2 space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Mail size={14}/> {session?.user?.email}</div>
                {session?.user?.phone && <div className="flex items-center gap-2"><Phone size={14}/> {session.user.phone}</div>}
            </div>

            {/* แสดง User ID และ Device ID */}
            <div className="flex gap-2 mt-4 w-full">
                <div className="bg-white flex-1 px-3 py-2 rounded-xl shadow-sm border border-secondary-light text-center">
                   <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1"><Hash size={10}/> USER ID</p>
                   <p className="text-sm font-bold text-primary-dark font-mono truncate">{session?.user?.user_id}</p>
                </div>
                {/* <div className="bg-white flex-1 px-3 py-2 rounded-xl shadow-sm border border-secondary-light text-center">
                   <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1"><Hash size={10}/> DEVICE ID</p>
                   <p className="text-sm font-bold text-primary-dark font-mono truncate">{session?.user?.device_id || 'ยังไม่ผูก'}</p>
                </div> */}
            </div>
         </div>

         {/* ข้อมูลฟาร์ม (แก้ไขได้) */}
         <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-sm font-bold text-gray-500">ข้อมูลฟาร์ม</h3>
            <button
               onClick={() => isEditing ? handleSaveFarmInfo() : setIsEditing(true)}
               className="text-xs flex items-center gap-1 text-primary-dark font-bold bg-white px-3 py-1 rounded-full shadow-sm transition-colors hover:bg-gray-50"
            >
               {isEditing ? (saving ? 'กำลังบันทึก...' : <><Save size={14} /> บันทึก</>) : <><Edit3 size={14} /> แก้ไข</>}
            </button>
         </div>

         <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-3xl shadow-sm text-center relative border border-gray-100">
               <h3 className="text-gray-400 text-xs mb-1">พื้นที่ฟาร์ม (ตร.ม.)</h3>
               {loadingInfo ? (
                  <Loader2 className="animate-spin mx-auto text-primary-medium" size={20} />
               ) : isEditing ? (
                  <input
                     type="number"
                     value={farmInfo.size}
                     onChange={(e) => setFarmInfo({ ...farmInfo, size: e.target.value })}
                     className="w-full text-center border-b border-primary-medium focus:outline-none text-xl font-bold text-primary-dark"
                  />
               ) : (
                  <p className="text-xl font-bold text-primary-dark">{farmInfo.size} <span className="text-sm font-normal">ตร.ม.</span></p>
               )}
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm text-center border border-gray-100">
               <h3 className="text-gray-400 text-xs mb-1">อุปกรณ์ (ชิ้น)</h3>
               {loadingInfo ? (
                  <Loader2 className="animate-spin mx-auto text-primary-medium" size={20} />
               ) : isEditing ? (
                  <input
                     type="number"
                     value={farmInfo.devices}
                     onChange={(e) => setFarmInfo({ ...farmInfo, devices: e.target.value })}
                     className="w-full text-center border-b border-primary-medium focus:outline-none text-xl font-bold text-primary-dark"
                  />
               ) : (
                  <p className="text-xl font-bold text-primary-dark">{farmInfo.devices} <span className="text-sm font-normal">ตัว</span></p>
               )}
            </div>
         </div>

         <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            <Link href="/Profile/edit" className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full text-gray-600"><User size={18} /></div>
                  <span className="font-medium">แก้ไขข้อมูลส่วนตัว</span>
               </div>
               <ChevronRight className="text-gray-300" size={20} />
            </Link>
         </div>

         <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-3xl shadow-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-100"
         >
            <LogOut size={20} /> ออกจากระบบ
         </button>
      </div>
   );
}