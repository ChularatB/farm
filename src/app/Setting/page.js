// app/settings/page.js
"use client";
import { useState } from 'react';
import { Droplets, Lightbulb, Sprout, MapPin, Bell } from 'lucide-react';
import { clsx } from 'clsx'; // สำหรับรวม Class

// Component สำหรับ Toggle Switch
const ToggleSwitch = ({ label, isEnabled, onToggle, Icon, colorClass }) => (
  <div className="p-4 border-b border-gray-100 flex items-center justify-between last:border-b-0">
    <div className="flex items-center gap-3">
      <div className={`${colorClass} p-2 rounded-full`}><Icon size={18} /></div>
      <span>{label}</span>
    </div>
    <div 
      onClick={onToggle}
      className={clsx(
        "w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300",
        isEnabled ? 'bg-primary-medium' : 'bg-gray-300'
      )}
    >
      <div className={clsx(
        "absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-300",
        isEnabled ? 'translate-x-6' : 'translate-x-1'
      )}></div>
    </div>
  </div>
);

export default function SettingsPage() {
  const [useIrrigation, setUseIrrigation] = useState(true);
  const [useLight, setUseLight] = useState(false);
  const [useFertilizer, setUseFertilizer] = useState(false);
  const [farmSize, setFarmSize] = useState('100'); // ขนาดพื้นที่
  const [receiveLine, setReceiveLine] = useState(true);

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">ตั้งค่าการใช้งาน 🛠️</h1>

      {/* Group: ระบบที่ใช้งานในฟาร์ม */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2">ระบบควบคุมที่ติดตั้ง</h2>
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
          <ToggleSwitch 
            label="ใช้งานระบบรดน้ำ" 
            isEnabled={useIrrigation} 
            onToggle={() => setUseIrrigation(!useIrrigation)} 
            Icon={Droplets} 
            colorClass="text-blue-500 bg-blue-100"
          />
          <ToggleSwitch 
            label="ใช้งานระบบไฟ/แสง" 
            isEnabled={useLight} 
            onToggle={() => setUseLight(!useLight)} 
            Icon={Lightbulb} 
            colorClass="text-yellow-600 bg-yellow-100"
          />
          <ToggleSwitch 
            label="ใช้งานระบบปุ๋ย/สารละลาย" 
            isEnabled={useFertilizer} 
            onToggle={() => setUseFertilizer(!useFertilizer)} 
            Icon={Sprout} 
            colorClass="text-green-500 bg-green-100"
          />
        </div>
      </div>

      {/* Group: ข้อมูลฟาร์ม */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2">ข้อมูลพื้นที่เพาะปลูก</h2>
        <div className="bg-white rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
             <div className="text-gray-500"><MapPin size={20} /></div>
             <input
               type="text"
               placeholder="ขนาดพื้นที่ปลูก (ตร.ม.)"
               value={farmSize}
               onChange={(e) => setFarmSize(e.target.value)}
               className="flex-1 border-b border-gray-300 p-1 focus:border-primary-medium focus:outline-none font-medium"
             />
             <span className="text-sm text-gray-500">ตร.ม.</span>
          </div>
          <p className="text-xs text-gray-400">ขนาดพื้นที่นี้ใช้ในการคำนวณปริมาณน้ำ/ปุ๋ย</p>
        </div>
      </div>
      
       {/* Group: Notification Config */}
       <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2">การตั้งค่าแจ้งเตือน</h2>
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
          <ToggleSwitch 
            label="รับแจ้งเตือนผ่าน LINE Notify" 
            isEnabled={receiveLine} 
            onToggle={() => setReceiveLine(!receiveLine)} 
            Icon={Bell} 
            colorClass="text-green-500 bg-green-100"
          />
           <div className="p-4 border-t border-gray-100">
               <button className="w-full text-center py-2 bg-gray-100 text-primary-dark font-medium rounded-xl hover:bg-gray-200 transition-colors">
                  เชื่อมต่อ LINE Token
               </button>
           </div>
        </div>
      </div>

      <button className="w-full py-4 bg-primary-dark text-white font-bold rounded-3xl shadow-lg mt-4">
        บันทึกการตั้งค่า
      </button>
    </div>
  );
}