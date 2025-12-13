// app/page.js
"use client";
import { useState, useEffect } from 'react';
import { CloudRain, Droplets, Sun, Thermometer, Wind } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, control, history
  
  // State สำหรับเก็บข้อมูลจริงจาก BigQuery
  const [sensorData, setSensorData] = useState([]); // ข้อมูลกราฟ (Array)
  const [latest, setLatest] = useState(null);       // ข้อมูลล่าสุด (Object)
  const [loading, setLoading] = useState(true);     // สถานะการโหลด

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchData = async () => {
    try {
      // เรียก API ที่เราสร้างไว้ (app/api/sensors/route.js)
      const res = await fetch('/api/sensors');
      const json = await res.json();
      
      if (json.data && json.data.length > 0) {
        // API ส่งข้อมูลมาแบบ เรียงจากใหม่ไปเก่า (DESC) 
        // แต่กราฟต้องการ เรียงจากเก่าไปใหม่ (ASC) -> เลยต้อง reverse()
        const reversedData = [...json.data].reverse();
        
        setSensorData(reversedData);
        // ข้อมูลล่าสุดคือตัวสุดท้ายหลังจาก reverse (หรือตัวแรกก่อน reverse)
        setLatest(reversedData[reversedData.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อเข้าหน้าเว็บ และตั้งเวลาดึงใหม่ทุก 10 วินาที
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  // ฟังก์ชันจัดรูปแบบเวลาสำหรับกราฟ (เช่น "2025-12-09 16:30" -> "16:30")
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background-light text-primary-dark font-bold">กำลังโหลดข้อมูลฟาร์ม...</div>;
  }

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-xl text-gray-500">ยินดีต้อนรับกลับ, ชาวสวน!</p>
          <p className="text-xs text-gray-400">อัปเดตล่าสุด: {latest ? formatTime(latest.timestamp) : '-'}</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white p-2 rounded-full shadow-sm text-primary-medium"><CloudRain size={20}/></div>
        </div>
      </header>

      {/* Tabs Switcher */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-6">
        {['overview', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab 
              ? 'bg-primary-medium text-white shadow-md' 
              : 'text-gray-400 hover:text-primary-dark'
            }`}
          >
            {tab === 'overview' ? 'ภาพรวม' : tab === 'history' ? 'ประวัติ' : 'ควบคุม'}
          </button>
        ))}
      </div>

      {/* --- CONTENT: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Status Card ใหญ่ */}
          <div className="bg-white rounded-[30px] p-6 shadow-md text-center relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-2 ${latest?.soil_moisture < 40 ? 'bg-red-500' : 'bg-primary-medium'}`}></div>
             <h2 className="text-gray-500 mb-4">สถานะระบบโดยรวม</h2>
             <div className={`text-5xl font-bold mb-2 ${latest?.soil_moisture < 40 ? 'text-red-500' : 'text-green-500'}`}>
               {latest?.soil_moisture < 40 ? 'Warning' : 'Normal'}
             </div>
             <p className="text-xs text-gray-400 px-4">
               {latest?.soil_moisture < 40 
                 ? 'ความชื้นในดินต่ำกว่ากำหนด ระบบรดน้ำกำลังทำงาน' 
                 : 'ระบบทำงานปกติ ค่าความชื้นและอุณหภูมิอยู่ในเกณฑ์ที่กำหนด'}
             </p>
          </div>

          {/* Grid Sensors */}
          <div className="grid grid-cols-1 gap-4">
            {/* Temperature */}
            <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-full text-red-500"><Thermometer /></div>
                <div>
                  <div className="text-sm text-gray-400">อุณหภูมิอากาศ</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {latest?.temperature ? parseFloat(latest.temperature).toFixed(1) : '--'}°C
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg ${latest?.temperature > 35 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {latest?.temperature > 35 ? 'ร้อน' : 'ปกติ'}
              </span>
            </div>

            {/* Humidity */}
            <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full text-blue-500"><Droplets /></div>
                <div>
                  <div className="text-sm text-gray-400">ความชื้นอากาศ</div>
                  <div className="text-2xl font-bold text-gray-700">
                     {latest?.humidity ? parseFloat(latest.humidity).toFixed(1) : '--'}%
                  </div>
                </div>
              </div>
            </div>
            
             {/* Soil Moisture */}
             <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-full text-amber-700"><Wind /></div>
                <div>
                  <div className="text-sm text-gray-400">ความชื้นในดิน</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {latest?.soil_moisture ? parseInt(latest.soil_moisture) : '--'}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg ${latest?.soil_moisture < 2000 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                {/* Logic สถานะดินขึ้นอยู่กับค่า Analog ที่ได้ (เช่น 0-4095) ต้องปรับตาม Sensor จริง */}
                {latest?.soil_moisture < 2000 ? 'ต่ำ' : 'ดี'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT: HISTORY --- */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Filters */}
           <div className="flex justify-end gap-2 text-xs text-gray-400 font-bold">
              <span>Realtime (100 ล่าสุด)</span>
           </div>

           {/* Chart 1: Soil Moisture & Humidity */}
           <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4 ml-2">ความชื้นในดิน (ล่าสุด)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0ECDE" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime} 
                      tick={{fontSize: 10}} 
                      axisLine={false} 
                      tickLine={false} 
                      interval={10} // แสดงเวลาทุกๆ 10 จุดเพื่อไม่ให้รก
                    />
                    <Tooltip 
                      labelFormatter={formatTime}
                      cursor={{fill: '#F0F7F0'}} 
                      contentStyle={{borderRadius: '10px', border: 'none'}} 
                    />
                    {/* เปลี่ยน dataKey ให้ตรงกับชื่อ column ใน BigQuery */}
                    <Bar dataKey="soil_moisture" fill="#68B2A0" radius={[4, 4, 4, 4]} name="ความชื้นดิน" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Chart 2: Temperature */}
           <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4 ml-2">อุณหภูมิอากาศ</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sensorData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2C6975" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2C6975" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0ECDE" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime} 
                      tick={{fontSize: 10}} 
                      axisLine={false} 
                      interval={10}
                    />
                    <Tooltip 
                      labelFormatter={formatTime}
                      contentStyle={{borderRadius: '10px', border: 'none'}} 
                    />
                    <Area type="monotone" dataKey="temperature" stroke="#2C6975" fillOpacity={1} fill="url(#colorTemp)" name="อุณหภูมิ" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}