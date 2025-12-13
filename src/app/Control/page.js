// app/control/page.js
"use client";
import { useState, useEffect } from 'react';
import { Play, Zap, Droplets, Settings, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function ControlPage() {
  // เริ่มต้นตั้งเป็น true ไปก่อน
  const [isAuto, setIsAuto] = useState(true);
  const [isIrrigationOn, setIsIrrigationOn] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- 1. (เพิ่มใหม่) โหลดสถานะเดิมจาก Local Storage ตอนเปิดหน้าเว็บ ---
  useEffect(() => {
    // เช็คว่ามีค่าที่บันทึกไว้มั้ย?
    const savedMode = localStorage.getItem('farm_control_mode');

    if (savedMode === 'manual') {
      setIsAuto(false); // ถ้าเคยเซฟว่า manual ก็ปรับเป็น manual
    } else {
      setIsAuto(true);  // ถ้าไม่มี หรือเป็น auto ก็เป็น auto
    }
  }, []);

  // --- 2. ฟังก์ชันดึงสถานะจาก API (Logic เดิม) ---
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/sensors');
      const json = await res.json();

      if (json.data && json.data.length > 0) {
        const latest = json.data[0];
        const isPumpOn = latest.pump_status === 0;
        setIsIrrigationOn(isPumpOn);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. ดึงข้อมูล / หยุดดึงตามโหมด (Logic เดิมที่แก้ให้แล้ว) ---
  useEffect(() => {
    if (!isAuto) return; // ถ้า Manual ไม่ต้องดึง

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [isAuto]);

  // --- 4. (แก้ไข) ฟังก์ชันสลับโหมด พร้อมบันทึกลงเครื่อง ---
  const toggleMode = () => {
    const newMode = !isAuto;
    setIsAuto(newMode);

    // บันทึกค่าลง Local Storage ทันที
    // ถ้า newMode เป็น true (Auto) ให้เซฟคำว่า 'auto'
    // ถ้า newMode เป็น false (Manual) ให้เซฟคำว่า 'manual'
    localStorage.setItem('farm_control_mode', newMode ? 'auto' : 'manual');
  };

  // const toggleIrrigation = async () => {
  //   if (isAuto) return;
  //   const newState = !isIrrigationOn;
  //   setIsIrrigationOn(newState);
  //   console.log(`สั่งงานปั๊ม: ${newState ? 'เปิด (ส่ง 0)' : 'ปิด (ส่ง 1)'}`);
  // };

  // ฟังก์ชันกดปุ่มเปิด/ปิด (Manual Control)
  const toggleIrrigation = async () => {
    if (isAuto) return;

    const newState = !isIrrigationOn;

    // 1. กำหนดค่า Command ที่จะส่ง: 0 = เปิด, 1 = ปิด
    const commandToSend = newState ? 0 : 1;

    // 2. ยิง API POST เพื่อส่งคำสั่ง
    try {
      setLoading(true); // แสดงสถานะกำลังส่งคำสั่ง
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandToSend }),
      });

      if (res.ok) {
        // ถ้าส่งสำเร็จ ให้เปลี่ยนสถานะใน UI ทันที
        setIsIrrigationOn(newState);
        console.log(`Command ${commandToSend} sent successfully.`);
      } else {
        // ถ้าส่งไม่สำเร็จ
        alert('Error: ไม่สามารถส่งคำสั่งไปยัง Cloud ได้');
        console.error('API failed to send command');
      }

    } catch (error) {
      alert('Error: การเชื่อมต่อ Cloud ล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark">ระบบควบคุม (Control Panel)</h1>
      <section className="mt-6">
        <div className="space-y-4">

          {/* Video Placeholder */}
          <div className="bg-gray-200 rounded-3xl h-48 flex items-center justify-center relative shadow-inner overflow-hidden">
            <Play className="text-gray-400 fill-gray-400" size={48} />
            <div className="absolute bottom-4 left-4 text-xs bg-black/50 text-white px-2 py-1 rounded">Live: {new Date().toLocaleTimeString('th-TH')}</div>
          </div>

          {/* Control Card */}
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

            {/* Buttons */}
            <div className="flex gap-4">
              {/* Visual Status */}
              <div className={clsx(
                "flex-1 rounded-2xl h-20 flex items-center justify-center border-2 relative overflow-hidden transition-all duration-500",
                isIrrigationOn
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-gray-100 border-gray-300'
              )}>
                {loading ? (
                  <Loader2 className="animate-spin text-gray-400" />
                ) : (
                  <span className={clsx("font-bold relative z-10", isIrrigationOn ? 'text-blue-600' : 'text-gray-500')}>
                    {isIrrigationOn ? 'รดน้ำ (ON)' : 'ปิด (OFF)'}
                  </span>
                )}
                {isIrrigationOn && <div className="absolute bottom-0 w-full h-1/2 bg-blue-400/20 wave-animation"></div>}
              </div>

              {/* Manual Button */}
              <button
                onClick={toggleIrrigation}
                disabled={isAuto || loading}
                className={clsx(
                  "flex-1 rounded-2xl h-20 flex flex-col items-center justify-center transition-colors",
                  !isAuto
                    ? (isIrrigationOn ? 'bg-red-100 hover:bg-red-200 text-red-500' : 'bg-green-100 hover:bg-green-200 text-green-500')
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Zap size={20} className="mb-1" />
                <span className="text-xs font-bold">
                  {isAuto ? 'Auto Lock' : (isIrrigationOn ? 'หยุดทำงาน' : 'เริ่มทำงาน')}
                </span>
              </button>
            </div>
          </div>

          <Link href="/settings">
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-secondary-light flex justify-between items-center mt-6 cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="font-semibold text-primary-dark">ตั้งค่าการใช้งานระบบ</span>
              <Settings size={24} className="text-primary-medium" />
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
}