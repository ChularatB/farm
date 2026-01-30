// app/profile/page.js
"use client";
import { useState, useEffect } from 'react';
import { MapPin, User, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';   // <--- เพิ่ม


export default function Profile() {
   const { data: session } = useSession();
  // --- ส่วนตรวจสอบสิทธิ์ (เพิ่มใหม่) ---
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  // --------------------------------

   // Loading State
   if (status === 'loading') {
      return (
         <div className="min-h-screen flex items-center justify-center bg-background-light text-primary-dark font-mitr">
            <Loader2 className="animate-spin mr-2" /> กำลังตรวจสอบสิทธิ์...
         </div>
      );
   }

   if (status === 'unauthenticated') return null;


   return (
      <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
         <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-primary-medium rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center">
               <User size={40} className="text-white" />
            </div>
            {/* แสดงชื่อจริงจาก Session */}
            <h1 className="text-2xl font-bold text-primary-dark">
               {session?.user?.name || "เกษตรกรมือใหม่"}
            </h1>
            <p className="text-gray-500 text-sm">
               {session?.user?.email || "user@farmbrain.com"}
            </p>
            <div className="bg-white px-4 py-1 rounded-full shadow-sm border border-gray-200">
                <p className="text-xs text-gray-400">
                    รหัสฟาร์ม (Device ID): <span className="text-primary-dark font-bold">{session?.user?.device_id || '-'}</span>
                </p>
            </div>
         </div>

         {/* Farm Info Cards */}
         {/* <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-3xl shadow-sm text-center">
               <h3 className="text-gray-400 text-xs mb-1">พื้นที่ฟาร์ม</h3>
               <p className="text-xl font-bold text-primary-dark">2 ไร่</p>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm text-center">
               <h3 className="text-gray-400 text-xs mb-1">อุปกรณ์</h3>
               <p className="text-xl font-bold text-primary-dark">12 ตัว</p>
            </div>
         </div> */}

         {/* Menu List */}
         <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600"><MapPin size={18} /></div>
                  <span>จัดการแปลงเกษตร</span>
               </div>
               <ChevronRight className="text-gray-300" size={20} />
            </div>
            <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full text-gray-600"><User size={18} /></div>
                  <span>แก้ไขข้อมูลส่วนตัว</span>
               </div>
               <ChevronRight className="text-gray-300" size={20} />
            </div>
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