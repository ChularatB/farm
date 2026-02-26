"use client";
import { useState, useEffect } from 'react';
import { Zap, Droplets, Settings, Loader2, Lightbulb, Sprout, Image as ImageIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function ControlPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- State ---
  const [isAuto, setIsAuto] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [isIrrigationOn, setIsIrrigationOn] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);       // ✅ เพิ่มสถานะไฟ
  const [isFertilizerOn, setIsFertilizerOn] = useState(false); // ✅ เพิ่มสถานะปุ๋ย

  // รูปภาพ
  const [farmImage, setFarmImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);

  // Config: ตัวกำหนดว่าจะโชว์การ์ดไหนบ้าง
  const [config, setConfig] = useState({
    showWater: true,     // ค่า Default
    showLight: false,
    showFertilizer: false
  });

  // --- 1. Check Auth ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // --- 2. Load Control Mode (Auto/Manual) ---
  useEffect(() => {
    const savedMode = localStorage.getItem('farm_control_mode');
    setIsAuto(savedMode !== 'manual');
  }, []);

  // --- 3. Fetch Config (ดึงค่าตั้งค่ามาโชว์ UI) ---
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetch('/api/farm/info')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log("Fetched Config:", data);
            setConfig({
              showWater: data.use_irrigation ?? true,
              showLight: data.use_light ?? false,
              showFertilizer: data.use_fertilizer ?? false
            });
          }
        })
        .catch(err => console.error("Config Error:", err));
    }
  }, [status, session]);

  // --- 4. Fetch Image ---
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

  // --- 5. Fetch Sensor Status (ดึงสถานะปั๊มจริงจากบอร์ด) ---
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/sensors');
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        // อัปเดตสถานะปั๊มน้ำ (0 = ON, 1 = OFF ตาม Relay Active Low)
        setIsIrrigationOn(json.data[0].pump_status === 0);
        
        // *อนาคต: ถ้ามี sensor สถานะไฟ/ปุ๋ย ก็มาใส่ตรงนี้ได้
        // setIsLightOn(json.data[0].light_status === 0);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuto) return; // ถ้า Manual ไม่ต้องดึงถี่ก็ได้ หรือจะดึงตลอดก็ได้แล้วแต่ design
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [isAuto]);

  // --- Actions ---
  const toggleMode = () => {
    const newMode = !isAuto;
    setIsAuto(newMode);
    localStorage.setItem('farm_control_mode', newMode ? 'auto' : 'manual');
  };

  // สั่งงานปั๊มน้ำ
  const toggleIrrigation = async () => {
    if (isAuto) return;
    const newState = !isIrrigationOn;
    const commandToSend = newState ? 0 : 1; // 0=ON, 1=OFF
    
    // UI Update ทันทีเพื่อให้รู้ว่ากดแล้ว (Optimistic UI)
    setIsIrrigationOn(newState);

    try {
      // setLoading(true); // ไม่ต้อง Loading ทั้งหน้า เอาแค่ปุ่มพอ
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandToSend }),
      });
      if (!res.ok) {
        setIsIrrigationOn(!newState); // ถ้าพัง ให้เด้งกลับ
        alert('สั่งงานไม่สำเร็จ');
      }
    } catch (error) {
        setIsIrrigationOn(!newState);
        alert('Error: การเชื่อมต่อล้มเหลว');
    }
  };

  // สั่งงานไฟ (จำลอง)
  const toggleLight = () => {
     if(isAuto) return;
     setIsLightOn(!isLightOn);
     // *ใส่ fetch API ตรงนี้ถ้ามีระบบไฟจริง
  }

  // สั่งงานปุ๋ย (จำลอง)
  const toggleFertilizer = () => {
     if(isAuto) return;
     setIsFertilizerOn(!isFertilizerOn);
     // *ใส่ fetch API ตรงนี้ถ้ามีระบบปุ๋ยจริง
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-primary-dark font-mitr">
        <Loader2 className="animate-spin mr-2" /> กำลังโหลด...
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark">ระบบควบคุม (Control Panel)</h1>
      <section className="mt-6">
        <div className="space-y-4">

          {/* 📸 Farm Image */}
          <div className="bg-white rounded-[40px] p-2 shadow-lg border border-secondary-light relative overflow-hidden aspect-video">
            {imgLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-[32px]">
                <Loader2 className="animate-spin text-primary-medium" />
              </div>
            ) : farmImage ? (
              <img src={farmImage} alt="Latest Farm Status" className="w-full h-full object-cover rounded-[32px]" />
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

          {/* 🎛️ Control Cards Panel */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-secondary-light mt-4">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-primary-dark">แผงควบคุมหลัก</h3>
                 {/* Auto/Manual Toggle */}
                 <div onClick={toggleMode} className={clsx("flex p-1 rounded-full w-24 cursor-pointer transition-colors", isAuto ? 'bg-primary-medium' : 'bg-gray-200')}>
                    <div className={clsx("p-1 rounded-full text-xs font w-1/2 text-center transition-all shadow-sm", isAuto ? 'bg-white text-primary-dark translate-x-0' : 'bg-white text-gray-500 ml-auto')}>{isAuto ? 'Auto' : 'Manual'}</div>
                 </div>
             </div>

             <div className="space-y-3">
                 
                 {/* 💧 Water System (แสดงเมื่อ showWater = true) */}
                 {config.showWater && (
                    <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100 transition-all hover:shadow-md">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm"><Droplets size={24}/></div>
                       <div className="flex-1">
                          <h4 className="font-bold text-blue-800 text-sm">ระบบรดน้ำ</h4>
                          <p className="text-xs text-blue-500/80">{isIrrigationOn ? 'กำลังทำงาน 🌊' : 'ปิดการทำงาน'}</p>
                       </div>
                       <button 
                         onClick={toggleIrrigation} 
                         disabled={isAuto} 
                         className={clsx("w-20 py-2 rounded-xl text-xs font-bold transition-all active:scale-95", 
                           isIrrigationOn ? "bg-blue-500 text-white shadow-blue-200 shadow-lg" : "bg-white text-blue-500 border border-blue-200",
                           isAuto && "opacity-50 cursor-not-allowed"
                         )}>
                          {isIrrigationOn ? 'หยุด' : 'เริ่ม'}
                       </button>
                    </div>
                 )}

                 {/* 💡 Light System (แสดงเมื่อ showLight = true) */}
                 {config.showLight && (
                    <div className="flex items-center gap-4 p-4 bg-yellow-50/80 rounded-2xl border border-yellow-100 transition-all hover:shadow-md">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-sm"><Lightbulb size={24}/></div>
                       <div className="flex-1">
                          <h4 className="font-bold text-yellow-800 text-sm">ระบบแสงสว่าง</h4>
                          <p className="text-xs text-yellow-600/80">{isLightOn ? 'เปิดไฟอยู่ 💡' : 'ปิดไฟ'}</p>
                       </div>
                       <button 
                         onClick={toggleLight}
                         disabled={isAuto} 
                         className={clsx("w-20 py-2 rounded-xl text-xs font-bold transition-all active:scale-95", 
                           isLightOn ? "bg-yellow-500 text-white shadow-yellow-200 shadow-lg" : "bg-white text-yellow-600 border border-yellow-200",
                           isAuto && "opacity-50 cursor-not-allowed"
                         )}>
                          {isLightOn ? 'ปิด' : 'เปิด'}
                       </button>
                    </div>
                 )}

                 {/* 🌱 Fertilizer System (แสดงเมื่อ showFertilizer = true) */}
                 {config.showFertilizer && (
                    <div className="flex items-center gap-4 p-4 bg-green-50/80 rounded-2xl border border-green-100 transition-all hover:shadow-md">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm"><Sprout size={24}/></div>
                       <div className="flex-1">
                          <h4 className="font-bold text-green-800 text-sm">ระบบปุ๋ย</h4>
                          <p className="text-xs text-green-600/80">{isFertilizerOn ? 'กำลังจ่ายปุ๋ย 🌱' : 'ปิดการทำงาน'}</p>
                       </div>
                       <button 
                         onClick={toggleFertilizer}
                         disabled={isAuto} 
                         className={clsx("w-20 py-2 rounded-xl text-xs font-bold transition-all active:scale-95", 
                           isFertilizerOn ? "bg-green-600 text-white shadow-green-200 shadow-lg" : "bg-white text-green-600 border border-green-200",
                           isAuto && "opacity-50 cursor-not-allowed"
                         )}>
                          {isFertilizerOn ? 'หยุด' : 'เริ่ม'}
                       </button>
                    </div>
                 )}

                 {/* กรณีไม่เปิดใช้อะไรเลย */}
                 {!config.showWater && !config.showLight && !config.showFertilizer && (
                    <div className="text-center p-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                        ยังไม่ได้เปิดใช้งานระบบใดๆ <br/>
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