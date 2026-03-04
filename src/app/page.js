// src/app/page.js
"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CloudRain, Droplets, Sun, Thermometer, Wind, Loader2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [latest, setLatest] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // ✅ ค่าเริ่มต้นให้ดึง ALL จะได้เห็นข้อมูลเก่าทันที
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState({ avgTemp: 0, avgHumid: 0, avgSoil: 0 });
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sensors?range=ALL'); // หน้าแรกก็ให้ดึงข้อมูลล่าสุดที่มี
      const json = await res.json();

      if (json.data && json.data.length > 0) {
        const reversedData = [...json.data].reverse();
        setLatest(reversedData[reversedData.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/sensors?range=${activeFilter}`);
      const json = await res.json();

      if (json.data && json.data.length > 0) {
        // หาค่าเฉลี่ยภาพรวม
        const avgT = json.data.reduce((acc, curr) => acc + (curr.temperature || 0), 0) / json.data.length;
        const avgH = json.data.reduce((acc, curr) => acc + (curr.humidity || 0), 0) / json.data.length;
        const avgS = json.data.reduce((acc, curr) => acc + (curr.soil_moisture || 0), 0) / json.data.length;

        setSummary({
          avgTemp: avgT.toFixed(1),
          avgHumid: avgH.toFixed(1),
          avgSoil: avgS.toFixed(1)
        });

        // 🧠 ระบบ AI บดข้อมูล (Grouping Data) 🧠
        const groupedMap = new Map();

        json.data.reverse().forEach(item => {
          const date = new Date(item.timestamp);
          let timeLabel = '';

          // ✅ จัดชื่อแกน X ตามที่แกขอเป๊ะๆ!
          if (activeFilter === '1H') {
            timeLabel = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
          } else if (activeFilter === '24H') {
            timeLabel = date.toLocaleTimeString('th-TH', { hour: '2-digit' }) + ':00';
          } else if (activeFilter === '7D') {
            const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์'];
            timeLabel = days[date.getDay()];
          } else if (activeFilter === '30D') {
            timeLabel = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
          } else {
            timeLabel = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
          }

          // จับยัดเข้ากลุ่มและบวกค่าสะสมไว้หาค่าเฉลี่ย
          if (!groupedMap.has(timeLabel)) {
            groupedMap.set(timeLabel, { name: timeLabel, tempSum: 0, humidSum: 0, soilSum: 0, count: 0 });
          }
          const group = groupedMap.get(timeLabel);
          group.tempSum += item.temperature || 0;
          group.humidSum += item.humidity || 0;
          group.soilSum += item.soil_moisture || 0;
          group.count += 1;
        });

        // แปลงผลลัพธ์ที่จัดกลุ่มแล้วออกมาใช้โชว์กราฟ
        const formatted = Array.from(groupedMap.values()).map(group => ({
          name: group.name,
          temp: Number((group.tempSum / group.count).toFixed(1)),
          humid: Number((group.humidSum / group.count).toFixed(1)),
          soil: Number((group.soilSum / group.count).toFixed(1))
        }));

        setHistoryData(formatted);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      if (activeTab === 'overview') {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
      } else if (activeTab === 'history') {
        fetchHistory();
      }
    }
  }, [status, activeTab, activeFilter]);

  // ✅ จัดรูปแบบเวลาใหม่ ให้มี วันที่ และ เดือน 
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    // จะได้หน้าตาแบบ "28 ก.พ. 14:30" 
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-primary-dark font-bold font-mitr">
        <Loader2 className="animate-spin mr-2" /> กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="h-screen bg-background-light font-mitr pb-24 px-6 pt-8 overflow-y-auto">

      {/* Header */}
      <header className="flex justify-between mb-6">
        <div>
          <p className="text-xl text-gray-500">
            ยินดีต้อนรับ, <span className="text-primary-dark font-bold">{session?.user?.name || 'ชาวสวน'}</span>!
          </p>
          {/* ✅ โชว์เวลาแบบเต็มๆ ตรงนี้ */}
          <p className="text-xs text-gray-400">
            อัปเดตล่าสุด: <span className="font-bold text-primary-medium">{latest ? formatTime(latest.timestamp) : (loadingData ? 'กำลังโหลด...' : '-')}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white p-2 rounded-full shadow-sm text-primary-medium"><CloudRain size={20} /></div>
        </div>
      </header>

      {/* Tabs Switcher */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-6">
        {['overview', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab
                ? 'bg-primary-medium text-white shadow-md'
                : 'text-gray-400 hover:text-primary-dark'
              }`}
          >
            {tab === 'overview' ? 'ภาพรวม' : 'ประวัติย้อนหลัง'}
          </button>
        ))}
      </div>

      {/* --- CONTENT: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="bg-white rounded-[30px] p-6 shadow-md text-center relative overflow-hidden border border-secondary-light">
            <div className={`absolute top-0 left-0 w-full h-2 ${latest?.soil_moisture < 40 ? 'bg-red-500' : 'bg-primary-medium'}`}></div>
            <h2 className="text-gray-500 mb-4 font-bold">สถานะระบบโดยรวม</h2>
            <div className={`text-5xl font-bold mb-2 ${latest?.soil_moisture < 40 ? 'text-red-500' : 'text-green-500'}`}>
              {loadingData ? '...' : (latest?.soil_moisture < 40 ? 'Warning' : 'Normal')}
            </div>
            <p className="text-xs text-gray-400 px-4">
              {loadingData
                ? 'กำลังเชื่อมต่อกับเซ็นเซอร์...'
                : (latest?.soil_moisture < 40
                  ? 'ความชื้นในดินต่ำกว่ากำหนด ระบบกำลังแจ้งเตือน'
                  : 'ระบบทำงานปกติ ค่าความชื้นและอุณหภูมิอยู่ในเกณฑ์ที่กำหนด')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-full text-red-500"><Thermometer /></div>
                <div>
                  <div className="text-sm text-gray-400 font-bold">อุณหภูมิอากาศ</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {latest?.temperature ? parseFloat(latest.temperature).toFixed(1) : '--'}°C
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${latest?.temperature > 35 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {latest?.temperature > 35 ? 'ร้อน' : 'ปกติ'}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full text-blue-500"><Droplets /></div>
                <div>
                  <div className="text-sm text-gray-400 font-bold">ความชื้นอากาศ</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {latest?.humidity ? parseFloat(latest.humidity).toFixed(1) : '--'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-full text-amber-700"><Wind /></div>
                <div>
                  <div className="text-sm text-gray-400 font-bold">ความชื้นในดิน</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {latest?.soil_moisture ? parseInt(latest.soil_moisture) : '--'}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${latest?.soil_moisture < 40 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                {latest?.soil_moisture < 40 ? 'ดินแห้ง' : 'ชุ่มชื้น'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT: HISTORY --- */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

          {/* ✅ เพิ่มปุ่ม ALL (ทั้งหมด) ให้กด */}
          <div className="flex justify-end gap-2 text-xs text-gray-400 font-bold bg-white p-2 rounded-full shadow-sm w-fit ml-auto">
            {['1H', '24H', '7D', '30D', 'ALL'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                disabled={loadingHistory}
                className={`px-3 py-1.5 rounded-full transition-all duration-300 ${activeFilter === filter ? 'bg-primary-medium text-white shadow-md scale-105' : 'hover:bg-gray-50'}`}
              >
                {filter === 'ALL' ? 'ทั้งหมด' : filter}
              </button>
            ))}
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 text-primary-medium">
              <Loader2 className="animate-spin mb-3" size={40} />
              <p className="text-sm font-bold animate-pulse">กำลังดึงข้อมูลประวัติ...</p>
            </div>
          ) : historyData.length === 0 ? (
            <div className="bg-white p-8 rounded-[32px] shadow-sm text-center border border-secondary-light mt-4">
              <Thermometer className="mx-auto text-gray-300 mb-2" size={48} />
              <p className="text-gray-500 font-bold">ไม่พบข้อมูลในช่วงเวลานี้</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-yellow-100 text-center">
                  <Sun size={20} className="mx-auto text-yellow-500 mb-1" />
                  <p className="text-[10px] text-gray-400 uppercase font-bold">อุณหภูมิเฉลี่ย</p>
                  <p className="text-lg font-bold text-yellow-600">{summary.avgTemp}°</p>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-blue-100 text-center">
                  <CloudRain size={20} className="mx-auto text-blue-500 mb-1" />
                  <p className="text-[10px] text-gray-400 uppercase font-bold">ชื้นอากาศเฉลี่ย</p>
                  <p className="text-lg font-bold text-blue-600">{summary.avgHumid}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-green-100 text-center">
                  <Droplets size={20} className="mx-auto text-green-500 mb-1" />
                  <p className="text-[10px] text-gray-400 uppercase font-bold">ความชื้นดินเฉลี่ย</p>
                  <p className="text-lg font-bold text-green-600">{summary.avgSoil}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-[32px] shadow-lg border border-secondary-light">
                <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-yellow-500" /> แนวโน้มอุณหภูมิ
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area name="อุณหภูมิ (°C)" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ---------------- กราฟที่ 2: ความชื้นอากาศ ---------------- */}
              <div className="bg-white p-5 rounded-[32px] shadow-lg border border-secondary-light mt-6">
                <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                  <CloudRain size={18} className="text-blue-500" /> ความชื้นอากาศ
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar name="ความชื้นอากาศ (%)" dataKey="humid" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ---------------- กราฟที่ 3: ความชื้นดิน ---------------- */}
              <div className="bg-white p-5 rounded-[32px] shadow-lg border border-secondary-light mt-6">
                <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                  <Droplets size={18} className="text-green-500" /> ความชื้นดิน
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar name="ความชื้นดิน (%)" dataKey="soil" fill="#34d399" radius={[4, 4, 0, 0]} barSize={8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </>
          )}
        </div>
      )}

    </div>
  );
}