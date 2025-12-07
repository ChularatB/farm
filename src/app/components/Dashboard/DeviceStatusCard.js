// src/app/components/Dashboard/DeviceStatusCard.js
import React from 'react';
import { useFarmStore } from '../../store/farmStore';

// Component ย่อยสำหรับแสดงสถานะของอุปกรณ์แต่ละตัว
const StatusBadge = ({ label, isActive }) => {
    // กำหนดสีตามสถานะ ON/OFF
    const colorClass = isActive 
        ? 'bg-primary-medium text-white' // สีเขียวเมื่อ ON
        : 'bg-secondary-light text-primary-dark border border-primary-dark/30'; // สีอ่อนเมื่อ OFF (หรือ Standby)

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg shadow-sm ${colorClass}`}>
            <span className="font-semibold text-sm">{label}</span>
            <span className="text-xs font-bold uppercase ml-4">
                {isActive ? 'ทำงาน' : 'พัก'}
            </span>
        </div>
    );
};

export default function DeviceStatusCard() {
    // ดึงสถานะอุปกรณ์จาก Zustand Store
    const { deviceStatus } = useFarmStore();

    // ข้อมูลอุปกรณ์สำหรับ Loop แสดงผล
    const devices = [
        { key: 'pump_water', label: 'ปั๊มน้ำหลัก' },
        { key: 'pump_nut_a', label: 'ปั๊มปุ๋ย A' },
        { key: 'pump_nut_b', label: 'ปั๊มปุ๋ย B' },
        { key: 'fan_ventilation', label: 'พัดลม/ระบายอากาศ' },
    ];

    return (
        <div className="p-6 rounded-xl bg-white shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-primary-dark">สถานะการทำงาน</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {devices.map((device) => (
                    <StatusBadge
                        key={device.key}
                        label={device.label}
                        // ตรวจสอบสถานะจาก deviceStatus
                        isActive={deviceStatus[device.key]} 
                    />
                ))}
            </div>
            
            <p className="mt-4 text-xs text-gray-500">
                * สถานะอัปเดตแบบ Real-time ตามข้อมูลที่มาจาก Cloud Firestore
            </p>
        </div>
    );
}