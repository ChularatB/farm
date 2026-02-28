// src/app/History/page.js
"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CloudRain, Droplets, Sun, Thermometer, Loader2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('24H'); 
  
  // State สำหรับเก็บค่าสรุป (Summary)
  const [summary, setSummary] = useState({ avgTemp: 0, avgHumid: 0, avgSoil: 0 });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // เมื่อเปลี่ยน activeFilter ให้ดึงข้อมูลใหม่ทันที
  useEffect(() => {
    if (session?.user?.device_id) {
      const fetchHistory = async () => {
        setLoading(true); // เปิดโหมดหมุนติ้วตอนกดกรองข้อมูล
        try {
          // ✅ ส่งค่า Filter ไปหา API
          const res = await fetch(`/api/sensors?range=${activeFilter}`);
          const json = await res.json();
          
          if (json.data && json.data.length > 0) {
            
            // ✅ คำนวณค่าเฉลี่ย (Average) สำหรับการ์ดสรุปผล
            const avgT = json.data.reduce((acc, curr) => acc + (curr.temperature || 0), 0) / json.data.length;
            const avgH = json.data.reduce((acc, curr) => acc + (curr.humidity || 0), 0) / json.data.length;
            const avgS = json.data.reduce((acc, curr) => acc + (curr.soil_moisture || 0), 0) / json.data.length;
            
            setSummary({
              avgTemp: avgT.toFixed(1),
              avgHumid: avgH.toFixed(1),
              avgSoil: avgS.toFixed(1)
            });

            // ✅ จัดฟอร์แมตข้อมูลเข้ากราฟ
            const formatted = json.data
              .reverse() 
              .map(item => {
                const date = new Date(item.timestamp);
                // ถ้าดูรายวัน/รายชม. ให้โชว์เวลา (14:30) ถ้าดู 7D/30D ให้โชว์วันที่ (12 ก.พ.)
                const isLongTerm = activeFilter === '7D' || activeFilter === '30D';
                const timeLabel = isLongTerm 
                  ? date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
                  : date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

                return {
                  name: timeLabel,
                  temp: item.temperature || 0,
                  humid: item.humidity || 0,
                  soil: item.soil_moisture || 0
                };
              });
            setChartData(formatted);
          } else {
            setChartData([]);
          }
        } catch (error) {
          console.error("Failed to fetch history:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchHistory();
    }
  }, [session, activeFilter]); // 👈 สั่งให้ทำงานใหม่ทุกครั้งที่กดปุ่มเปลี่ยนเวลา (activeFilter)

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-background-light"><Loader2 className="animate-spin text-primary-medium" size={32} /></div>;
  }

  return (
    <div className="px-6 py-8 font-mitr bg-background-light min-h-screen pb-24">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">ประวัติย้อนหลัง 📊</h1>
      
      {/* Filters กรองเวลา */}
      <div className="flex justify-end gap-2 text-xs text-gray-400 font-bold bg-white p-2 rounded-full shadow-sm w-fit ml-auto mb-6">
        {['1H', '24H', '7D', '30D'].map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full transition-all duration-300 ${activeFilter === filter ? 'bg-primary-medium text-white shadow-md scale-105' : 'hover:bg-gray-50'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary-medium">
          <Loader2 className="animate-spin mb-3" size={40} />
          <p className="text-sm font-bold animate-pulse">กำลังประมวลผลข้อมูล...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="bg-white p-8 rounded-[32px] shadow-sm text-center border border-secondary-light mt-4">
          <Thermometer className="mx-auto text-gray-300 mb-2" size={48} />
          <p className="text-gray-500 font-bold">ไม่พบข้อมูลในช่วงเวลานี้</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ✅ ฟีเจอร์ใหม่: การ์ดสรุปค่าเฉลี่ย (Useful Information) */}
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-yellow-100 text-center">
                <Sun size={20} className="mx-auto text-yellow-500 mb-1"/>
                <p className="text-[10px] text-gray-400 uppercase font-bold">อุณหภูมิเฉลี่ย</p>
                <p className="text-lg font-bold text-yellow-600">{summary.avgTemp}°</p>
             </div>
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-blue-100 text-center">
                <CloudRain size={20} className="mx-auto text-blue-500 mb-1"/>
                <p className="text-[10px] text-gray-400 uppercase font-bold">ชื้นอากาศเฉลี่ย</p>
                <p className="text-lg font-bold text-blue-600">{summary.avgHumid}%</p>
             </div>
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-green-100 text-center">
                <Droplets size={20} className="mx-auto text-green-500 mb-1"/>
                <p className="text-[10px] text-gray-400 uppercase font-bold">ชื้นดินเฉลี่ย</p>
                <p className="text-lg font-bold text-green-600">{summary.avgSoil}%</p>
             </div>
          </div>

          {/* Chart 1: อุณหภูมิ */}
          <div className="bg-white p-5 rounded-[32px] shadow-lg border border-secondary-light">
            <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-yellow-500"/> แนวโน้มอุณหภูมิ
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area name="อุณหภูมิ (°C)" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: ความชื้น (อากาศ & ดิน) */}
          <div className="bg-white p-5 rounded-[32px] shadow-lg border border-secondary-light">
            <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
              <Droplets size={18} className="text-blue-500"/> ปริมาณความชื้น
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar name="ความชื้นอากาศ (%)" dataKey="humid" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={6} />
                  <Bar name="ความชื้นดิน (%)" dataKey="soil" fill="#34d399" radius={[4, 4, 0, 0]} barSize={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}