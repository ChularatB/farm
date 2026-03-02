// src/app/components/Control/ManualControl.js
'use client';

import React from 'react';
import { useFarmStore } from '../../store/farmStore';

export default function ManualControl() {
    const { deviceStatus, setDeviceStatus } = useFarmStore();

// ในไฟล์ src/app/components/Control/ManualControl.js

    const handleToggle = async (deviceKey) => {
        const newStatus = !deviceStatus[deviceKey];
        const commandToSend = newStatus ? 0 : 1; 

        // อัปเดต State ทันที
        setDeviceStatus({ [deviceKey]: newStatus });
        
        try {
            const res = await fetch('/api/control', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    device_id: 'farm_001', 
                    operation_mode: 0, // บังคับเป็นโหมด Manual (0)
                    // ตอนนี้ Backend แกรับแค่ pump_command ตัวเดียว ถ้าอนาคตมีปั๊มปุ๋ย แกอาจจะต้องเพิ่มเงื่อนไขส่ง fertilizer_command ไปแทนนะ
                    pump_command: deviceKey === 'pump_water' ? commandToSend : undefined 
                }) 
            });

            if (!res.ok) {
                setDeviceStatus({ [deviceKey]: !newStatus });
                alert(`สั่งงาน ${deviceKey} ไม่สำเร็จจ่ะ`);
            }
        } catch (error) {
            setDeviceStatus({ [deviceKey]: !newStatus });
            alert('การเชื่อมต่อล้มเหลว');
        }
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