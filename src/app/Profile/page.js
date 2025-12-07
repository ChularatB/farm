// app/profile/page.js
import { MapPin, User, LogOut, ChevronRight } from 'lucide-react';

export default function Profile() {
  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-primary-medium rounded-full mb-4 border-4 border-white shadow-md flex items-center justify-center">
           <User size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-primary-dark">สมชาย รักเกษตร</h1>
        <p className="text-gray-500 text-sm">เจ้าของฟาร์ม • สมาชิก Premium</p>
      </div>

      {/* Farm Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="bg-white p-4 rounded-3xl shadow-sm text-center">
            <h3 className="text-gray-400 text-xs mb-1">พื้นที่ฟาร์ม</h3>
            <p className="text-xl font-bold text-primary-dark">2 ไร่</p>
         </div>
         <div className="bg-white p-4 rounded-3xl shadow-sm text-center">
            <h3 className="text-gray-400 text-xs mb-1">อุปกรณ์</h3>
            <p className="text-xl font-bold text-primary-dark">12 ตัว</p>
         </div>
      </div>

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

      <button className="w-full py-4 bg-primary-dark text-white font-bold rounded-3xl shadow-lg flex items-center justify-center gap-2">
        <LogOut size={20} /> ออกจากระบบ
      </button>
    </div>
  );
}