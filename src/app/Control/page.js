// app/control/page.js
"use client";
import { useState, useEffect } from 'react';
import { Play, Zap, Droplets, Settings, Loader2, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // <--- เพิ่ม
import { useRouter } from 'next/navigation';   // <--- เพิ่ม

export default function ControlPage() {
// ✅ 1. ย้าย Hook ทั้งหมดมาไว้บนสุด
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isAuto, setIsAuto] = useState(true);
  const [isIrrigationOn, setIsIrrigationOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [farmImage, setFarmImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);

  // ✅ 2. useEffect ทั้งหมดต้องอยู่ก่อนการ return
  
  // ตรวจสอบสิทธิ์
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // โหลดโหมดจาก Local Storage
  useEffect(() => {
    const savedMode = localStorage.getItem('farm_control_mode');
    setIsAuto(savedMode !== 'manual');
  }, []);

  // ดึงรูปล่าสุด
  const fetchLatestImage = async () => {
    try {
      const res = await fetch('/api/farm-image');
      const json = await res.json();
      if (json.imageUrl) setFarmImage(json.imageUrl);
    } catch (err) {
      console.error("Failed to fetch image:", err);
    } finally {
      setImgLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestImage();
    const interval = setInterval(fetchLatestImage, 30000);
    return () => clearInterval(interval);
  }, []);

  // ดึงสถานะเซนเซอร์
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/sensors');
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setIsIrrigationOn(json.data[0].pump_status === 0);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuto) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [isAuto]);

  // --- ฟังก์ชันช่วยเหลือ ---
  const toggleMode = () => {
    const newMode = !isAuto;
    setIsAuto(newMode);
    localStorage.setItem('farm_control_mode', newMode ? 'auto' : 'manual');
  };

  const toggleIrrigation = async () => {
    if (isAuto) return;
    const newState = !isIrrigationOn;
    const commandToSend = newState ? 0 : 1;
    try {
      setLoading(true);
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandToSend }),
      });
      if (res.ok) setIsIrrigationOn(newState);
    } catch (error) {
      alert('Error: การเชื่อมต่อล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. เช็ค Loading และ Unauthenticated ไว้ "หลัง" Hook ทั้งหมด
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
      <h1 className="text-2xl font-bold text-primary-dark">ระบบควบคุม (Control Panel)</h1>
      <section className="mt-6">
        <div className="space-y-4">


          {/* 📸 ส่วนแสดงรูปล่าสุดจากฟาร์ม */}
          <div className="bg-white rounded-[40px] p-2 shadow-lg border border-secondary-light relative overflow-hidden aspect-video">
            {imgLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-[32px]">
                <Loader2 className="animate-spin text-primary-medium" />
              </div>
            ) : farmImage ? (
              <img
                src={farmImage}
                alt="Latest Farm Status"
                className="w-full h-full object-cover rounded-[32px]"
              />
              // <img
              //   src="/farm_test.jpg"
              //   alt="Latest Farm Status"
              //   className="w-full h-full object-cover rounded-[32px]"
              // />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-[32px] text-gray-400">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <p className="text-xs">ยังไม่มีรูปภาพจากฟาร์ม</p>
              </div>
            )}

            <div className="absolute top-5 left-5 bg-black/50 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              LATEST UPDATE
            </div>
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

          <Link href="/Setting">
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