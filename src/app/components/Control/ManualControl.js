// src/app/components/Control/ManualControl.js
'use client';

import React from 'react';
import { useFarmStore } from '../../store/farmStore';

export default function ManualControl() {
    const { deviceStatus, setDeviceStatus } = useFarmStore();

    // **[สำคัญมาก]** ฟังก์ชันจำลอง: ในโปรเจกต์จริง ต้องเรียก API Route ที่จะส่งคำสั่งไป Pub/Sub
    const handleToggle = async (deviceKey) => {
        const newStatus = !deviceStatus[deviceKey];

        // 1. **(TODO: Actual Implementation)** //    Fetch('/api/control', { method: 'POST', body: JSON.stringify({ device: deviceKey, action: newStatus ? 'ON' : 'OFF' }) });
        
        // 2. อัปเดต State ทันที (Optimistic Update)
        setDeviceStatus({ [deviceKey]: newStatus });
        
        alert(`ส่งคำสั่งไปยัง ${deviceKey} ให้: ${newStatus ? 'เปิด' : 'ปิด'}`);
    };

    const devices = [
        { key: 'pump_water', label: 'ปั๊มน้ำหลัก', icon: '💧' },
        { key: 'pump_nut_a', label: 'ปั๊มปุ๋ย A', icon: '🧪' },
        { key: 'pump_nut_b', label: 'ปั๊มปุ๋ย B', icon: '🧪' },
        { key: 'fan_ventilation', label: 'พัดลม', icon: '💨' },
    ];

    return (
        <div className="p-6 rounded-xl bg-white shadow-xl border border-red-500/50">
            <h3 className="text-lg font-bold mb-4 text-red-600">
                ⚠️ ควบคุมด้วยตนเอง (Manual Override)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                ควบคุมอุปกรณ์โดยตรง (ระบบอัตโนมัติจะถูกยกเลิกชั่วคราว)
            </p>
            
            <div className="grid grid-cols-2 gap-4">
                {devices.map((device) => (
                    <button
                        key={device.key}
                        onClick={() => handleToggle(device.key)}
                        className={`p-4 rounded-lg font-semibold transition duration-200 
                            ${deviceStatus[device.key] 
                                ? 'bg-primary-medium hover:bg-primary-dark text-white' 
                                : 'bg-background-light hover:bg-secondary-light text-primary-dark border border-primary-dark/30'
                            }`}
                    >
                        {device.icon} {device.label}: {deviceStatus[device.key] ? 'เปิด (คลิกเพื่อปิด)' : 'ปิด (คลิกเพื่อเปิด)'}
                    </button>
                ))}
            </div>
        </div>
    );
}