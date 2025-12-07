"use client";
import { useState } from 'react';
import { CloudRain, Droplets, Sun, Thermometer, Wind, Zap, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: 'Mo', temp: 24, humid: 60 },
  { name: 'Tu', temp: 26, humid: 55 },
  { name: 'We', temp: 28, humid: 70 },
  { name: 'Th', temp: 25, humid: 65 },
  { name: 'Fr', temp: 27, humid: 62 },
  { name: 'Sa', temp: 30, humid: 50 },
  { name: 'Su', temp: 32, humid: 45 },
];

export default function HistorylPage() {
  return (
    <div className="px-10">
      <h1 className="text-2xl">ประวัติย้อนหลัง</h1>
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
    </div>
  );
}
