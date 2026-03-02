// src/app/Control/page.js
"use client";
import { useState, useEffect } from 'react';
import { Droplets, Settings, Loader2, Lightbulb, Sprout, Image as ImageIcon, Camera } from 'lucide-react'; // ✅ เพิ่ม Icon Camera
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function ControlPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isAuto, setIsAuto] = useState(true);
  const [loading, setLoading] = useState(true);

  const [isIrrigationOn, setIsIrrigationOn] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [isFertilizerOn, setIsFertilizerOn] = useState(false);

  const [farmImage, setFarmImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);

  // ✅ State สำหรับปุ่มถ่ายภาพ
  const [isCapturing, setIsCapturing] = useState(false);

  const [config, setConfig] = useState({
    showWater: true,
    showLight: false,
    showFertilizer: false
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    const savedMode = localStorage.getItem('farm_control_mode');
    setIsAuto(savedMode !== 'manual');
  }, []);

  useEffect(() => {
    if (session?.user?.user_id) {
      fetch('/api/farm/info')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setConfig({
              showWater: data.use_irrigation ?? true,
              showLight: data.use_light ?? false,
              showFertilizer: data.use_fertilizer ?? false
            });
          }
        })
        .catch(err => console.error(err));
    }
  }, [session]);

  const fetchLatestImage = async () => {
    try {
      const res = await fetch(`/api/farm-image?t=${new Date().getTime()}`, { cache: 'no-store' });
      const json = await res.json();

      if (json.imageUrl) {
        setFarmImage(json.imageUrl); // โชว์รูป
      } else {
        setFarmImage(null); // ✅ ถ้าไม่ตรง / ไม่มีรูป ให้โชว์คำว่า "ยังไม่มีรูปภาพ"
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImgLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestImage();
    const interval = setInterval(fetchLatestImage, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // 1. แก้ฟังก์ชันเปลี่ยนโหมด (Auto/Manual) ให้ส่งค่าไปบอก Backend ด้วย
  const toggleMode = async () => {
    const newMode = !isAuto;
    setIsAuto(newMode);
    localStorage.setItem('farm_control_mode', newMode ? 'auto' : 'manual');
    
    // แจ้ง Backend ว่าตอนนี้อยู่โหมดไหน (1 = Auto, 0 = Manual)
    try {
      await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          device_id: session?.user?.device_id || 'farm_001',
          operation_mode: newMode ? 1 : 0 
        }),
      });
    } catch(err) { console.error("Error updating mode:", err); }
  };


  // 2. แก้ฟังก์ชันสั่งปั๊มน้ำ ให้ส่งค่า pump_command
  const toggleIrrigation = async () => {
    if (isAuto) return;
    const newState = !isIrrigationOn;
    const commandToSend = newState ? 0 : 1; 
    setIsIrrigationOn(newState);
    
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          device_id: session?.user?.device_id || 'farm_001',
          operation_mode: 0, // สั่งมือแปลว่าต้องเป็น Manual (0)
          pump_command: commandToSend 
        }),
      });
      if (!res.ok) {
        setIsIrrigationOn(!newState);
        alert('สั่งงานไม่สำเร็จ');
      }
    } catch (error) {
      setIsIrrigationOn(!newState);
      alert('Error: การเชื่อมต่อล้มเหลว');
    }
  };
  const handleCapture = async () => {
    setIsCapturing(true);
    
    try {
      // 🛑 ต้องเป็น /api/snap เท่านั้นนะแก! 🛑
      const res = await fetch('/api/camera/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_id: session?.user?.device_id || "900C1AB865E4" 
        })
      });

      if (res.ok) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          fetchLatestImage();
          if (attempts >= 4) {
            clearInterval(checkInterval);
            setIsCapturing(false);
          }
        }, 5000); 
      } else {
        alert('ส่งคำสั่งถ่ายภาพล้มเหลว');
        setIsCapturing(false);
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setIsCapturing(false);
    }
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-background-light"><Loader2 className="animate-spin text-primary-medium" /></div>;
  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark">ระบบควบคุม</h1>
      <section className="mt-6">
        <div className="space-y-4">

          {/* 📸 ส่วนแสดงภาพ */}
          <div className="bg-white rounded-[40px] p-2 shadow-lg border border-secondary-light relative overflow-hidden aspect-video">
            {imgLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-[32px]">
                <Loader2 className="animate-spin text-primary-medium" />
              </div>
            ) : farmImage ? (
              <img key={farmImage} src={farmImage} alt="Latest Farm" className="w-full h-full object-cover rounded-[32px]" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-[32px] text-gray-400">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <p className="text-xs">ยังไม่มีรูปภาพจากฟาร์ม</p>
              </div>
            )}

            <div className="absolute top-5 left-5 bg-black/50 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LATEST UPDATE
            </div>

            {/* ✅ ปุ่มกดถ่ายภาพ (Snap) มุมขวาบน */}
            <div className="absolute top-4 right-4">
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className={clsx(
                  "bg-white/90 backdrop-blur-sm p-3 rounded-full text-primary-dark shadow-lg transition-all active:scale-95",
                  isCapturing ? "opacity-70 cursor-wait" : "hover:bg-primary-medium hover:text-white"
                )}
              >
                {isCapturing ? <Loader2 size={20} className="animate-spin text-primary-medium" /> : <Camera size={20} />}
              </button>
            </div>

            {/* โชว์แถบแจ้งเตือนตอนกำลังถ่าย */}
            {isCapturing && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                กำลังสั่งถ่ายภาพ รอสักครู่... 📸
              </div>
            )}
          </div>

          {/* ... (โค้ดส่วน แผงควบคุมหลัก เหมือนเดิมเป๊ะๆ) ... */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-secondary-light mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary-dark">แผงควบคุมหลัก</h3>
              <div onClick={toggleMode} className={clsx("flex p-1 rounded-full w-24 cursor-pointer transition-colors", isAuto ? 'bg-primary-medium' : 'bg-gray-200')}>
                <div className={clsx("p-1 rounded-full text-xs font-bold w-1/2 text-center transition-all shadow-sm", isAuto ? 'bg-white text-primary-dark translate-x-0' : 'bg-white text-gray-500 ml-auto')}>{isAuto ? 'Auto' : 'Manual'}</div>
              </div>
            </div>

            <div className="space-y-3">
              {config.showWater && (
                <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm"><Droplets size={24} /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-800 text-sm">ระบบรดน้ำ</h4>
                    <p className="text-xs text-blue-500/80">{isIrrigationOn ? 'กำลังทำงาน 🌊' : 'ปิดการทำงาน'}</p>
                  </div>
                  <button onClick={toggleIrrigation} disabled={isAuto} className={clsx("w-20 py-2 rounded-xl text-xs font-bold transition-all", isIrrigationOn ? "bg-blue-500 text-white shadow-md" : "bg-white text-blue-500 border border-blue-200", isAuto && "opacity-50 cursor-not-allowed")}>
                    {isIrrigationOn ? 'หยุด' : 'เริ่ม'}
                  </button>
                </div>
              )}

              {config.showLight && (
                <div className="flex items-center gap-4 p-4 bg-yellow-50/80 rounded-2xl border border-yellow-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-sm"><Lightbulb size={24} /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-yellow-800 text-sm">ระบบแสงสว่าง</h4>
                    <p className="text-xs text-yellow-600/80">{isLightOn ? 'เปิดไฟอยู่ 💡' : 'ปิดไฟ'}</p>
                  </div>
                  <button onClick={() => !isAuto && setIsLightOn(!isLightOn)} disabled={isAuto} className={clsx("w-20 py-2 rounded-xl text-xs font-bold transition-all", isLightOn ? "bg-yellow-500 text-white shadow-md" : "bg-white text-yellow-600 border border-yellow-200", isAuto && "opacity-50 cursor-not-allowed")}>
                    {isLightOn ? 'ปิด' : 'เปิด'}
                  </button>
                </div>
              )}

              {config.showFertilizer && (
                <div className="flex items-center gap-4 p-4 bg-green-50/80 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm"><Sprout size={24} /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-800 text-sm">ระบบปุ๋ย</h4>
                    <p className="text-xs text-green-600/80">{isFertilizerOn ? 'กำลังจ่ายปุ๋ย 🌱' : 'ปิดการทำงาน'}</p>
                  </div>
                  <button onClick={() => !isAuto && setIsFertilizerOn(!isFertilizerOn)} disabled={isAuto} className={clsx("w-20 py-2 rounded-xl text-xs font-bold transition-all", isFertilizerOn ? "bg-green-600 text-white shadow-md" : "bg-white text-green-600 border border-green-200", isAuto && "opacity-50 cursor-not-allowed")}>
                    {isFertilizerOn ? 'หยุด' : 'เริ่ม'}
                  </button>
                </div>
              )}

              {!config.showWater && !config.showLight && !config.showFertilizer && (
                <div className="text-center p-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                  ยังไม่ได้เปิดใช้งานระบบใดๆ <br />
                  <Link href="/Setting" className="text-primary-medium underline mt-2 inline-block">ไปตั้งค่า</Link>
                </div>
              )}
            </div>
          </div>

          <Link href="/Setting">
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-secondary-light flex justify-between items-center mt-6 cursor-pointer hover:bg-gray-50 transition-colors group">
              <span className="font-semibold text-primary-dark group-hover:text-primary-medium transition-colors">ตั้งค่าการใช้งานระบบ</span>
              <Settings size={24} className="text-gray-400 group-hover:text-primary-medium transition-colors" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}