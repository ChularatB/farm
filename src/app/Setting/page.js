// src/app/Setting/page.js
"use client";
import { useState, useEffect } from 'react';
import { Droplets, Lightbulb, Sprout, MapPin, Loader2, Save, Clock, Calendar, Cpu, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ToggleSwitch = ({ label, isEnabled, onToggle, Icon, colorClass }) => (
  <div className="p-4 border-b border-gray-100 flex items-center justify-between last:border-b-0">
    <div className="flex items-center gap-3">
      <div className={`${colorClass} p-2 rounded-full`}><Icon size={18} /></div>
      <span>{label}</span>
    </div>
    <div onClick={onToggle} className={clsx("w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300", isEnabled ? 'bg-primary-medium' : 'bg-gray-300')}>
      <div className={clsx("absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-300", isEnabled ? 'translate-x-6' : 'translate-x-1')}></div>
    </div>
  </div>
);

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [useIrrigation, setUseIrrigation] = useState(true);
  const [useLight, setUseLight] = useState(false);
  const [useFertilizer, setUseFertilizer] = useState(false);
  const [farmSize, setFarmSize] = useState('');
  const [totalDevices, setTotalDevices] = useState('');

  // 🛑 เพิ่ม State สำหรับเก็บ LINE User ID
  const [lineUserId, setLineUserId] = useState('');

  // State ตั้งเวลา
  const [lightStart, setLightStart] = useState('18:00');
  const [lightDuration, setLightDuration] = useState('4');
  const [fertilizerDays, setFertilizerDays] = useState('30');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.user_id) {
      fetch('/api/farm/info')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUseIrrigation(data.use_irrigation ?? true);
            setUseLight(data.use_light ?? false);
            setUseFertilizer(data.use_fertilizer ?? false);
            setFarmSize(data.farm_size || '');
            setTotalDevices(data.total_devices || '');

            // ดึงค่าเวลา และ LINE ID (ถ้ามี)
            setLightStart(data.light_start_time || '18:00');
            setLightDuration(data.light_duration?.toString() || '4');
            setFertilizerDays(data.fertilizer_interval?.toString() || '30');
            setLineUserId(data.line_user_id || ''); 
          }
        })
        .catch(err => console.error(err));
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/farm/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_size: farmSize,
          total_devices: totalDevices,
          use_irrigation: useIrrigation,
          use_light: useLight,
          use_fertilizer: useFertilizer,
          light_start_time: lightStart,
          light_duration: parseInt(lightDuration),
          fertilizer_interval: parseInt(fertilizerDays),
          line_user_id: lineUserId 
        })
      });
      if (res.ok) alert("บันทึกการตั้งค่าเรียบร้อย!");
    } catch (error) {
      console.error(error);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">ตั้งค่าการใช้งาน 🛠️</h1>

      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2">ระบบควบคุมที่ติดตั้ง</h2>
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <ToggleSwitch label="ใช้งานระบบรดน้ำ" isEnabled={useIrrigation} onToggle={() => setUseIrrigation(!useIrrigation)} Icon={Droplets} colorClass="text-blue-500 bg-blue-100" />
          <ToggleSwitch label="ใช้งานระบบไฟ/แสง" isEnabled={useLight} onToggle={() => setUseLight(!useLight)} Icon={Lightbulb} colorClass="text-yellow-600 bg-yellow-100" />
          <ToggleSwitch label="ใช้งานระบบปุ๋ย/สารละลาย" isEnabled={useFertilizer} onToggle={() => setUseFertilizer(!useFertilizer)} Icon={Sprout} colorClass="text-green-500 bg-green-100" />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {useLight && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-yellow-800 font-bold mb-3 flex items-center gap-2"><Clock size={18} /> ตั้งเวลาเปิดไฟ</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-yellow-600">เริ่มเวลา</label>
                <input type="time" value={lightStart} onChange={(e) => setLightStart(e.target.value)} className="w-full bg-white rounded-xl p-2 text-center font-bold text-gray-700 outline-none border border-yellow-100 focus:border-yellow-400" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-yellow-600">นาน (ชม.)</label>
                <input type="number" value={lightDuration} onChange={(e) => setLightDuration(e.target.value)} className="w-full bg-white rounded-xl p-2 text-center font-bold text-gray-700 outline-none border border-yellow-100 focus:border-yellow-400" />
              </div>
            </div>
          </div>
        )}

        {useFertilizer && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-green-800 font-bold mb-3 flex items-center gap-2"><Calendar size={18} /> รอบการใส่ปุ๋ย</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-700">ใส่ปุ๋ยทุกๆ</span>
              <input type="number" value={fertilizerDays} onChange={(e) => setFertilizerDays(e.target.value)} className="w-20 bg-white rounded-xl p-2 text-center font-bold text-gray-700 outline-none border border-green-100 focus:border-green-400" />
              <span className="text-sm text-green-700">วัน</span>
            </div>
            <p className="text-xs text-green-600 mt-2">*ระบบจะแจ้งเตือนเมื่อครบกำหนด</p>
          </div>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <h2 className="text-sm text-gray-500 mb-2 ml-2">ข้อมูลพื้นที่</h2>
          <div className="bg-white rounded-3xl p-5 shadow-lg flex items-center gap-3 border border-gray-100">
            <MapPin size={20} className="text-gray-500" />
            <input type="text" placeholder="ขนาดพื้นที่" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} className="flex-1 border-b p-1 outline-none font-medium" />
            <span className="text-sm text-gray-500">ตร.ม.</span>
          </div>
        </div>
        <div>
          <h2 className="text-sm text-gray-500 mb-2 ml-2">อุปกรณ์ในพื้นที่</h2>
          <div className="bg-white rounded-3xl p-5 shadow-lg flex items-center gap-3 border border-gray-100">
            <Cpu size={20} className="text-gray-500" />
            <input type="text" placeholder="จำนวนอุปกรณ์ (ชิ้น)" value={totalDevices} onChange={(e) => setTotalDevices(e.target.value)} className="flex-1 border-b p-1 outline-none font-medium" />
            <span className="text-sm text-gray-500">ชิ้น</span>
          </div>
        </div>

        {/* 🛑 เพิ่มกล่องสำหรับกรอก LINE User ID ตรงนี้เลย! */}
        <div>
          <h2 className="text-sm text-gray-500 mb-2 ml-2 flex items-center gap-1">
            รับการแจ้งเตือนผ่าน LINE
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-full text-green-600"><MessageCircle size={18} /></div>
              <h3 className="font-bold text-green-800">LINE User ID</h3>
            </div>
            <p className="text-xs text-green-600/80 mb-3 ml-1">กรอก User ID เพื่อรับแจ้งเตือนเมื่อดินแห้ง, อากาศร้อน หรือมีรูปล่าสุดจากฟาร์ม</p>
            <input
              type="text"
              placeholder="เช่น Ubfc450..."
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
              className="w-full bg-white rounded-xl p-3 font-medium text-gray-700 outline-none border border-green-200 focus:border-green-500 shadow-inner"
            />
          </div>
          <p className="text-[12px] text-gray-400 mt-1 ml-2">
            *พิมพ์ "ขอรหัส" ในแชทบอท LINE FarmBrain แล้วนำรหัสมากรอกที่นี่
          </p>
        </div>

      </div>

      <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-primary-dark text-white font-bold rounded-3xl shadow-lg mt-4 flex justify-center items-center gap-2 hover:bg-opacity-90 transition-all">
        {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกการตั้งค่า</>}
      </button>
    </div>
  );
}