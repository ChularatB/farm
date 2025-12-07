// app/control/page.js
"use client"; // จำเป็นต้องใช้เพราะมีการจัดการ State
import { useState } from 'react';
import { Play, Zap, Droplets, MapPin, Settings } from 'lucide-react';
import { clsx } from 'clsx'; // Library เสริมช่วยในการรวม Class

export default function ControlPage() {
  // Mock State สำหรับ ระบบรดน้ำ
  const [isAuto, setIsAuto] = useState(true);
  const [isIrrigationOn, setIsIrrigationOn] = useState(false);

  // ฟังก์ชันสลับ Auto/Manual
  const toggleMode = () => {
    setIsAuto(!isAuto);
  };

  // ฟังก์ชันควบคุม Manual (จะใช้ได้เมื่ออยู่ในโหมด Manual เท่านั้น)
  const toggleIrrigation = () => {
    if (!isAuto) {
      setIsIrrigationOn(!isIrrigationOn);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark">ระบบควบคุม (Control Panel)</h1>
      <section className="mt-6">
        <div className="space-y-4">
          
          {/* Video Placeholder (Monitor) */}
          <div className="bg-gray-200 rounded-3xl h-48 flex items-center justify-center relative shadow-inner">
             <Play className="text-gray-400 fill-gray-400" size={48} />
             <div className="absolute bottom-4 left-4 text-xs bg-black/50 text-white px-2 py-1 rounded">Live: 07:54:21</div>
          </div>

          {/* Control Card: ระบบรดน้ำ (Irrigation System) */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-secondary-light">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary-dark flex items-center gap-2">
                 <Droplets size={20} className="text-blue-500" /> ระบบรดน้ำ
              </h3>
              
              {/* Auto/Manual Toggle */}
              <div 
                onClick={toggleMode} 
                className={clsx(
                  "flex p-1 rounded-full w-24 transition-all duration-300 cursor-pointer shadow-inner",
                  isAuto ? 'bg-primary-medium' : 'bg-gray-200'
                )}
              >
                <div 
                  className={clsx(
                    "p-1 rounded-full text-xs font-bold transition-all duration-300 w-1/2 text-center",
                    isAuto ? 'bg-white shadow-md text-primary-dark' : 'text-gray-500 ml-auto'
                  )}
                >
                  {isAuto ? 'Auto' : 'Manual'}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
               {/* Visual Status / ON */}
               <div className={clsx(
                 "flex-1 rounded-2xl h-20 flex items-center justify-center border-2 relative overflow-hidden",
                 isIrrigationOn 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'bg-gray-100 border-gray-300'
               )}>
                  <span className={clsx("font-bold relative z-10", isIrrigationOn ? 'text-blue-600' : 'text-gray-500')}>
                    {isIrrigationOn ? 'รดน้ำ' : 'ปิด'}
                  </span>
               </div>

               {/* Manual Button (ON/OFF) */}
               <button 
                 onClick={toggleIrrigation}
                 disabled={isAuto} // ปิดปุ่มถ้าเป็น Auto
                 className={clsx(
                   "flex-1 rounded-2xl h-20 flex flex-col items-center justify-center transition-colors",
                   !isAuto // เมื่ออยู่ Manual
                    ? (isIrrigationOn ? 'bg-red-100 hover:bg-red-200 text-red-500' : 'bg-green-100 hover:bg-green-200 text-green-500')
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed' // เมื่ออยู่ Auto
                 )}
               >
                  <Zap size={20} className="mb-1"/>
                  <span className="text-xs font-bold">
                     {!isAuto ? (isIrrigationOn ? 'หยุดทำงาน' : 'เริ่มทำงาน') : 'Auto Lock'}
                  </span>
               </button>
            </div>
          </div>

          {/* Card Link to Settings */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-secondary-light flex justify-between items-center mt-6">
             <span className="font-semibold text-primary-dark">ตั้งค่าการใช้งานระบบ</span>
             <Settings size={24} className="text-primary-medium"/>
          </div>

        </div>
      </section>
    </div>
  );
}