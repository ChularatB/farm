// app/page.js
"use client";
import { useState } from 'react';
import { CloudRain, Droplets, Sun, Thermometer, Wind, Zap, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock Data สำหรับกราฟ
const data = [
  { name: 'Mo', temp: 24, humid: 60 },
  { name: 'Tu', temp: 26, humid: 55 },
  { name: 'We', temp: 28, humid: 70 },
  { name: 'Th', temp: 25, humid: 65 },
  { name: 'Fr', temp: 27, humid: 62 },
  { name: 'Sa', temp: 30, humid: 50 },
  { name: 'Su', temp: 32, humid: 45 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, control, history

  return (
    <div className="min-h-screen bg-background-light font-mitr pb-24 px-6 pt-8">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-xl text-gray-500">ยินดีต้อนรับกลับ, ชาวสวน!</p>
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
             <div className="absolute top-0 left-0 w-full h-2 bg-primary-medium"></div>
             <h2 className="text-gray-500 mb-4">สถานะระบบโดยรวม</h2>
             <div className="text-5xl font-bold text-green-500 mb-2">Normal</div>
             <p className="text-xs text-gray-400 px-4">
               ระบบทำงานปกติ ค่าความชื้นและอุณหภูมิอยู่ในเกณฑ์ที่กำหนด ปั๊มน้ำทำงานล่าสุดเมื่อ 10:00 น.
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
                  <div className="text-2xl font-bold text-gray-700">32°C</div>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-lg">ปกติ</span>
            </div>

            {/* Light */}
            <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-500"><Sun /></div>
                <div>
                  <div className="text-sm text-gray-400">ความเข้มแสง</div>
                  <div className="text-2xl font-bold text-gray-700">543 Lux</div>
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full text-blue-500"><Droplets /></div>
                <div>
                  <div className="text-sm text-gray-400">ความชื้นอากาศ</div>
                  <div className="text-2xl font-bold text-gray-700">86%</div>
                </div>
              </div>
            </div>
            
             {/* Soil Moisture (เพิ่มให้เพราะสำคัญมาก) */}
             <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-secondary-light">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-full text-amber-700"><Wind /></div>
                <div>
                  <div className="text-sm text-gray-400">ความชื้นในดิน</div>
                  <div className="text-2xl font-bold text-gray-700">45%</div>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg">ต่ำ</span>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT: HISTORY --- */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Filters */}
           <div className="flex justify-end gap-2 text-xs text-gray-400 font-bold">
              <span>1H</span>
              <span>24H</span>
              <span className="text-primary-dark">7D</span>
              <span>30D</span>
           </div>

           {/* Chart 1 */}
           <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4 ml-2">ความชื้นย้อนหลัง</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0ECDE" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#F0F7F0'}} contentStyle={{borderRadius: '10px', border: 'none'}} />
                    <Bar dataKey="humid" fill="#FF8BA7" radius={[10, 10, 10, 10]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Chart 2 */}
           <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4 ml-2">อุณหภูมิ & แสง</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#68B2A0" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#68B2A0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0ECDE" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} />
                    <Tooltip contentStyle={{borderRadius: '10px', border: 'none'}} />
                    <Area type="monotone" dataKey="temp" stroke="#2C6975" fillOpacity={1} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}